import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report, ReportStatus } from './reports.entity';
import { CreateReportDto } from './create-report.dto';
import { ModerateReportDto } from './moderate-report.dto';
import { QueryReportsDto } from './query-reports.dto';
import { User } from '../users/user.entity';
import { AuditLog } from './audit-log.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepo: Repository<Report>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  async create(dto: CreateReportDto, userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Invalid reporter');

    const report = this.reportsRepo.create({
      ...dto,
      reporterId: user.id,
      reporter: user,
    });

    return this.reportsRepo.save(report);
  }

  async findAll(query: QueryReportsDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const qb = this.reportsRepo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.reporter', 'reporter');

    if (query.status) {
      qb.andWhere('report.status = :status', { status: query.status });
    }
    if (query.category) {
      qb.andWhere('report.category = :category', { category: query.category });
    }

    const sortField =
      query.sortBy === 'id' ? 'report.id' : 'report.createdAt';
    qb.orderBy(sortField, query.order ?? 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      data: items,
      meta: { total, page, limit, pageCount: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(id: number) {
    const report = await this.reportsRepo.findOne({
      where: { id },
      relations: ['reporter'],
    });
    if (!report) {
      throw new NotFoundException(`Report ${id} not found`);
    }
    return report;
  }

  async moderate(
    reportId: number,
    dto: ModerateReportDto,
    moderatorUserId: number,
  ) {
    const report = await this.reportsRepo.findOne({ where: { id: reportId } });
    if (!report) {
      throw new NotFoundException(`Report ${reportId} not found`);
    }

    if (report.status !== ReportStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING reports can be moderated',
      );
    }

    const previousStatus = report.status;
    report.status = dto.status;
    await this.reportsRepo.save(report);

    const audit = this.auditRepo.create({
      actionType: 'REPORT_MODERATED',
      performedById: moderatorUserId,
      entityName: 'report',
      entityId: report.id,
      actionDetails: JSON.stringify({
        previousStatus,
        newStatus: dto.status,
        notes: dto.notes ?? null,
      }),
    });
    await this.auditRepo.save(audit);

    return this.findOne(report.id);
  }

  async getModerationAuditTrail(reportId: number) {
    await this.findOne(reportId);
    const entries = await this.auditRepo.find({
      where: { entityName: 'report', entityId: reportId },
      order: { createdAt: 'DESC' },
      relations: ['performedBy'],
    });
    return entries.filter((e) => e.actionType === 'REPORT_MODERATED');
  }
}
