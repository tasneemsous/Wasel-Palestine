import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from './reports.entity';
import { CreateReportDto } from './create-report.dto';
import { User } from '../users/user.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private reportsRepo: Repository<Report>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
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

  findAll() {
    return this.reportsRepo.find({ relations: ['reporter'] });
  }

  findOne(id: number) {
    return this.reportsRepo.findOne({ where: { id }, relations: ['reporter'] });
  }
}