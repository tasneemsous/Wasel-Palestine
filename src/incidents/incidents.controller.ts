import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './create-incident.dto';
import { UpdateIncidentDto } from './update-incident.dto';
import { QueryIncidentsDto } from './query-incidents.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('api/v1/incidents')
@UseGuards(JwtAuthGuard)
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  create(@Body() dto: CreateIncidentDto) {
    return this.incidentsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryIncidentsDto) {
    return this.incidentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incidentsService.findOne(Number(id));
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  update(@Param('id') id: string, @Body() dto: UpdateIncidentDto) {
    return this.incidentsService.update(Number(id), dto);
  }

  @Patch(':id/verify')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  verify(@Param('id') id: string, @Request() req: { user: { userId: number } }) {
    return this.incidentsService.verify(Number(id), req.user.userId);
  }

  @Patch(':id/close')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  close(@Param('id') id: string) {
    return this.incidentsService.close(Number(id));
  }
}
