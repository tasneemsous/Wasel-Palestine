import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class EstimateRouteDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  fromLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  fromLong: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  toLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  toLong: number;

  /** When true, active checkpoints near the straight-line path add time and appear in metadata. */
  @IsOptional()
  @IsBoolean()
  avoidCheckpoints?: boolean;

  /**
   * Optional single circular “no-go” zone: if the straight-line sample path comes within
   * radiusKm of the center, a fixed time penalty is applied (heuristic only).
   */
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  avoidAreaCenterLat?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  avoidAreaCenterLong?: number;

  @IsOptional()
  @IsNumber()
  @Min(0.1)
  @Max(200)
  avoidAreaRadiusKm?: number;

  /** Urban default ~35 km/h for straight-line distance → time mapping. */
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(130)
  averageSpeedKmh?: number;
}
