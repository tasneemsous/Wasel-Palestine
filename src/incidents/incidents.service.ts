import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Incident } from './incident.entity';
import { CreateIncidentDto } from './create-incident.dto';
import { UpdateIncidentDto } from './update-incident.dto';
import { QueryIncidentsDto } from './query-incidents.dto';
import { Report } from '../Reports/reports.entity';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectRepository(Incident)
    private incidentsRepo: Repository<Incident>,
    @InjectRepository(Report)
    private reportsRepo: Repository<Report>,
  ) {}

  private readonly relations = ['verifiedBy', 'sourceReport', 'sourceReport.reporter'] as const;

  async create(dto: CreateIncidentDto) {
    if (dto.sourceReportId != null) {
      const report = await this.reportsRepo.findOne({
        where: { id: dto.sourceReportId },
      });
      if (!report) {
        throw new BadRequestException('Source report not found');
      }
    }

    const incident = this.incidentsRepo.create({
      type: dto.type,
      severity: dto.severity,
      description: dto.description,
      locationLat: dto.locationLat,
      locationLong: dto.locationLong,
      sourceReportId: dto.sourceReportId ?? null,
      startsAt: dto.startsAt ? new Date(dto.startsAt) : undefined,
      endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      isActive: dto.isActive ?? true,
    });

    const saved = await this.incidentsRepo.save(incident);
    return this.findOne(saved.id);
  }

  async findAll(query: QueryIncidentsDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const qb = this.incidentsRepo
      .createQueryBuilder('incident')
      .leftJoinAndSelect('incident.verifiedBy', 'verifiedBy')
      .leftJoinAndSelect('incident.sourceReport', 'sourceReport')
      .leftJoinAndSelect('sourceReport.reporter', 'reporter');

    if (query.type) {
      qb.andWhere('incident.type = :type', { type: query.type });
    }
    if (query.severity) {
      qb.andWhere('incident.severity = :severity', { severity: query.severity });
    }
    if (query.isActive !== undefined) {
      qb.andWhere('incident.isActive = :isActive', { isActive: query.isActive });
    }
    if (query.sourceReportId != null) {
      qb.andWhere('incident.sourceReportId = :sourceReportId', {
        sourceReportId: query.sourceReportId,
      });
    }

    const sortField =
      query.sortBy === 'id'
        ? 'incident.id'
        : query.sortBy === 'severity'
          ? 'incident.severity'
          : 'incident.startsAt';
    qb.orderBy(sortField, query.order ?? 'DESC');

    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      data: items,
      meta: { total, page, limit, pageCount: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(id: number) {
    const incident = await this.incidentsRepo.findOne({
      where: { id },
      relations: [...this.relations],
    });
    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
    return incident;
  }

  async findBySourceReportId(reportId: number) {
    return this.incidentsRepo.find({
      where: { sourceReportId: reportId },
      relations: [...this.relations],
      order: { startsAt: 'DESC' },
    });
  }

  async update(id: number, dto: UpdateIncidentDto) {
    const incident = await this.incidentsRepo.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }

    if (dto.sourceReportId !== undefined && dto.sourceReportId !== null) {
      const report = await this.reportsRepo.findOne({
        where: { id: dto.sourceReportId },
      });
      if (!report) {
        throw new BadRequestException('Source report not found');
      }
    }

    if (dto.type !== undefined) incident.type = dto.type;
    if (dto.severity !== undefined) incident.severity = dto.severity;
    if (dto.description !== undefined) incident.description = dto.description;
    if (dto.locationLat !== undefined) incident.locationLat = dto.locationLat;
    if (dto.locationLong !== undefined) incident.locationLong = dto.locationLong;
    if (dto.sourceReportId !== undefined) {
      incident.sourceReportId = dto.sourceReportId;
    }
    if (dto.startsAt !== undefined) incident.startsAt = new Date(dto.startsAt);
    if (dto.endsAt !== undefined) {
      incident.endsAt = dto.endsAt ? new Date(dto.endsAt) : null;
    }
    if (dto.isActive !== undefined) incident.isActive = dto.isActive;

    await this.incidentsRepo.save(incident);
    return this.findOne(id);
  }

  async verify(id: number, userId: number) {
    const incident = await this.incidentsRepo.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
    incident.verifiedById = userId;
    await this.incidentsRepo.save(incident);
    return this.findOne(id);
  }

  async close(id: number) {
    const incident = await this.incidentsRepo.findOne({ where: { id } });
    if (!incident) {
      throw new NotFoundException(`Incident ${id} not found`);
    }
    incident.isActive = false;
    incident.endsAt = new Date();
    await this.incidentsRepo.save(incident);
    return this.findOne(id);
  }
}
