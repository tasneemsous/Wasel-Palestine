import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  Patch,
  Query,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './create-report.dto';
import { ModerateReportDto } from './moderate-report.dto';
import { QueryReportsDto } from './query-reports.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
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
  findAll(@Query() query: QueryReportsDto) {
    return this.reportsService.findAll(query);
  }

  @Get(':id/incidents')
  findLinkedIncidents(@Param('id') id: string) {
    return this.incidentsService.findBySourceReportId(Number(id));
  }

  @Get(':id/moderation-history')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  getModerationHistory(@Param('id') id: string) {
    return this.reportsService.getModerationAuditTrail(Number(id));
  }

  @Patch(':id/moderation')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  moderate(
    @Param('id') id: string,
    @Body() dto: ModerateReportDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.reportsService.moderate(
      Number(id),
      dto,
      req.user.userId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reportsService.findOne(Number(id));
  }
}
