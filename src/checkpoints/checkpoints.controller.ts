import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { CheckpointsService } from './checkpoints.service';
import { CreateCheckpointDto } from './create-checkpoint.dto';
import { UpdateCheckpointDto } from './update-checkpoint.dto';
import { AddCheckpointStatusDto } from './add-checkpoint-status.dto';
import {
  QueryCheckpointHistoryDto,
  QueryCheckpointsDto,
} from './query-checkpoints.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('checkpoints')
@UseGuards(JwtAuthGuard)
export class CheckpointsController {
  constructor(private readonly checkpointsService: CheckpointsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  create(
    @Body() dto: CreateCheckpointDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.checkpointsService.create(dto, req.user.userId);
  }

  @Get()
  findAll(@Query() query: QueryCheckpointsDto) {
    return this.checkpointsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.checkpointsService.findOne(Number(id));
  }

  @Get(':id/history')
  getHistory(
    @Param('id') id: string,
    @Query() query: QueryCheckpointHistoryDto,
  ) {
    return this.checkpointsService.getHistory(Number(id), query);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCheckpointDto,
  ) {
    return this.checkpointsService.update(Number(id), dto);
  }

  @Post(':id/status')
  @UseGuards(RolesGuard)
  @Roles('ADMIN', 'MODERATOR')
  addStatus(
    @Param('id') id: string,
    @Body() dto: AddCheckpointStatusDto,
    @Request() req: { user: { userId: number } },
  ) {
    return this.checkpointsService.addStatus(
      Number(id),
      dto,
      req.user.userId,
    );
  }
}
