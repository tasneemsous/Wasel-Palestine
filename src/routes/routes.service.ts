import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkpoint } from '../checkpoints/checkpoint.entity';
import { EstimateRouteDto } from './estimate-route.dto';

const EARTH_RADIUS_KM = 6371;
const DEFAULT_SPEED_KMH = 35;
const ROUTE_SAMPLE_STEPS = 24;
const CHECKPOINT_INFLUENCE_KM = 2.5;
const MINUTES_PER_CHECKPOINT_NEAR_ROUTE = 12;
const AVOID_ZONE_PENALTY_MINUTES = 20;

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Checkpoint)
    private readonly checkpointsRepo: Repository<Checkpoint>,
  ) {}

  async estimate(dto: EstimateRouteDto) {
    this.validateAvoidArea(dto);

    const distanceKm = haversineKm(
      dto.fromLat,
      dto.fromLong,
      dto.toLat,
      dto.toLong,
    );

    const speedKmh = dto.averageSpeedKmh ?? DEFAULT_SPEED_KMH;
    let durationMinutes = (distanceKm / speedKmh) * 60;

    const assumptions: string[] = [
      'Straight-line (great-circle) distance between endpoints',
      `Nominal average speed ${speedKmh} km/h (heuristic, not live traffic)`,
      'Actual roads may be longer; this is a coarse lower bound on road distance',
    ];

    const metadata: Record<string, unknown> = {
      method: 'haversine_heuristic_v1',
      assumptions: [...assumptions],
    };

    let checkpointAdjustment = 0;
    if (dto.avoidCheckpoints) {
      const { nearby, adjustment } = await this.checkpointPenalty(
        dto.fromLat,
        dto.fromLong,
        dto.toLat,
        dto.toLong,
      );
      checkpointAdjustment = adjustment;
      durationMinutes += adjustment;
      if (nearby.length > 0) {
        metadata.checkpointsNearRoute = nearby;
        metadata.checkpointDurationAdjustmentMinutes = round1(adjustment);
      }
    }

    let avoidAreaAdjustment = 0;
    if (dto.avoidAreaCenterLat != null) {
      const hit = segmentPassesNearPoint(
        dto.fromLat,
        dto.fromLong,
        dto.toLat,
        dto.toLong,
        dto.avoidAreaCenterLat!,
        dto.avoidAreaCenterLong!,
        dto.avoidAreaRadiusKm!,
      );
      if (hit.within) {
        avoidAreaAdjustment = AVOID_ZONE_PENALTY_MINUTES;
        durationMinutes += avoidAreaAdjustment;
        metadata.avoidArea = {
          centerLat: dto.avoidAreaCenterLat,
          centerLong: dto.avoidAreaCenterLong,
          radiusKm: dto.avoidAreaRadiusKm,
          reason:
            'Sampled straight path intersects the avoidance radius; extra time added as a simple detour heuristic',
          closestSampleDistanceKm: hit.closestKm,
        };
        metadata.avoidAreaDurationAdjustmentMinutes = avoidAreaAdjustment;
      } else {
        metadata.avoidArea = {
          centerLat: dto.avoidAreaCenterLat,
          centerLong: dto.avoidAreaCenterLong,
          radiusKm: dto.avoidAreaRadiusKm,
          closestSampleDistanceKm: hit.closestKm,
          note: 'Path samples stay outside the avoidance radius; no penalty',
        };
      }
    }

    return {
      distanceKm: round3(distanceKm),
      durationMinutes: round1(durationMinutes),
      metadata: {
        ...metadata,
        totalHeuristicAdjustmentsMinutes: round1(
          checkpointAdjustment + avoidAreaAdjustment,
        ),
      },
    };
  }

  private validateAvoidArea(dto: EstimateRouteDto) {
    const parts = [
      dto.avoidAreaCenterLat,
      dto.avoidAreaCenterLong,
      dto.avoidAreaRadiusKm,
    ].filter((v) => v != null);
    if (parts.length === 0) return;
    if (parts.length !== 3) {
      throw new BadRequestException(
        'avoidAreaCenterLat, avoidAreaCenterLong, and avoidAreaRadiusKm must all be provided together',
      );
    }
  }

  private async checkpointPenalty(
    fromLat: number,
    fromLong: number,
    toLat: number,
    toLong: number,
  ) {
    const checkpoints = await this.checkpointsRepo.find({
      where: { isActive: true },
    });

    const nearby: { id: number; name: string; distanceKm: number }[] = [];

    for (const cp of checkpoints) {
      const lat = Number(cp.locationLat);
      const lng = Number(cp.locationLong);
      const dMin = minDistancePointToSegmentKm(
        lat,
        lng,
        fromLat,
        fromLong,
        toLat,
        toLong,
        ROUTE_SAMPLE_STEPS,
      );
      if (dMin <= CHECKPOINT_INFLUENCE_KM) {
        nearby.push({
          id: cp.id,
          name: cp.name,
          distanceKm: round3(dMin),
        });
      }
    }

    const adjustment = nearby.length * MINUTES_PER_CHECKPOINT_NEAR_ROUTE;
    return { nearby, adjustment };
  }
}

function haversineKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

function minDistancePointToSegmentKm(
  pointLat: number,
  pointLon: number,
  aLat: number,
  aLon: number,
  bLat: number,
  bLon: number,
  steps: number,
): number {
  let min = Infinity;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = aLat + (bLat - aLat) * t;
    const lon = aLon + (bLon - aLon) * t;
    const d = haversineKm(pointLat, pointLon, lat, lon);
    if (d < min) min = d;
  }
  return min;
}

function segmentPassesNearPoint(
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number,
  centerLat: number,
  centerLong: number,
  radiusKm: number,
): { within: boolean; closestKm: number } {
  let closestKm = Infinity;
  for (let i = 0; i <= ROUTE_SAMPLE_STEPS; i++) {
    const t = i / ROUTE_SAMPLE_STEPS;
    const lat = fromLat + (toLat - fromLat) * t;
    const lon = fromLong + (toLong - fromLong) * t;
    const d = haversineKm(lat, lon, centerLat, centerLong);
    if (d < closestKm) closestKm = d;
  }
  return { within: closestKm <= radiusKm, closestKm: round3(closestKm) };
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000;
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}
