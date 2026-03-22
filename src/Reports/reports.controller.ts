import { Controller, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './create-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IncidentsService } from '../incidents/incidents.service';

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(
    private reportsService: ReportsService,
    private incidentsService: IncidentsService,
  ) {}

  @Post()
  create(@Body() dto: CreateReportDto, @Request() req) {
    return this.reportsService.create(dto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.reportsService.findAll();
  }

  @Get(':id/incidents')
  findLinkedIncidents(@Param('id') id: string) {
    return this.incidentsService.findBySourceReportId(Number(id));
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(Number(id));
  }
}