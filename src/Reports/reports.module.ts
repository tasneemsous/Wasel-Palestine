import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Report } from './reports.entity';
import { User } from '../users/user.entity';
import { IncidentsModule } from '../incidents/incidents.module';

@Module({
  imports: [TypeOrmModule.forFeature([Report, User]), IncidentsModule],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}