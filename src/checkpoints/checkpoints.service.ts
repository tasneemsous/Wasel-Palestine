import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Checkpoint } from './checkpoint.entity';
import { CheckpointStatusHistory } from './checkpoint-status-history.entity';
import { CreateCheckpointDto } from './create-checkpoint.dto';
import { UpdateCheckpointDto } from './update-checkpoint.dto';
import { AddCheckpointStatusDto } from './add-checkpoint-status.dto';
import {
  QueryCheckpointHistoryDto,
  QueryCheckpointsDto,
} from './query-checkpoints.dto';

@Injectable()
export class CheckpointsService {
  constructor(
    @InjectRepository(Checkpoint)
    private readonly checkpointsRepo: Repository<Checkpoint>,
    @InjectRepository(CheckpointStatusHistory)
    private readonly historyRepo: Repository<CheckpointStatusHistory>,
  ) {}

  async create(dto: CreateCheckpointDto, changedByUserId: number) {
    const checkpoint = this.checkpointsRepo.create({
      name: dto.name,
      locationLat: dto.locationLat as unknown as string,
      locationLong: dto.locationLong as unknown as string,
      description: dto.description ?? null,
      isActive: dto.isActive ?? true,
    });
    const saved = await this.checkpointsRepo.save(checkpoint);

    if (dto.initialStatus?.trim()) {
      const row = this.historyRepo.create({
        checkpointId: saved.id,
        status: dto.initialStatus.trim(),
        reason: dto.initialStatusReason?.trim() ?? null,
        changedById: changedByUserId,
      });
      await this.historyRepo.save(row);
    }

    return this.findOne(saved.id);
  }

  async findAll(query: QueryCheckpointsDto) {
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const qb = this.checkpointsRepo.createQueryBuilder('cp');

    if (query.isActive !== undefined) {
      qb.andWhere('cp.isActive = :isActive', { isActive: query.isActive });
    }
    if (query.nameContains?.trim()) {
      qb.andWhere('LOWER(cp.name) LIKE LOWER(:name)', {
        name: `%${query.nameContains.trim()}%`,
      });
    }

    const sortField =
      query.sortBy === 'id'
        ? 'cp.id'
        : query.sortBy === 'name'
          ? 'cp.name'
          : 'cp.createdAt';
    qb.orderBy(sortField, query.order ?? 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      data: items,
      meta: { total, page, limit, pageCount: Math.ceil(total / limit) || 1 },
    };
  }

  async findOne(id: number) {
    const checkpoint = await this.checkpointsRepo.findOne({ where: { id } });
    if (!checkpoint) {
      throw new NotFoundException(`Checkpoint ${id} not found`);
    }
    const recentStatusHistory = await this.historyRepo.find({
      where: { checkpointId: id },
      order: { changedAt: 'DESC' },
      take: 20,
      relations: ['changedBy'],
    });
    return { ...checkpoint, recentStatusHistory };
  }

  async getHistory(checkpointId: number, query: QueryCheckpointHistoryDto) {
    await this.ensureCheckpointExists(checkpointId);
    const page = Math.max(1, query.page ?? 1);
    const limit = Math.min(100, Math.max(1, query.limit ?? 20));
    const sortField =
      query.sortBy === 'id' ? 'h.id' : 'h.changedAt';
    const qb = this.historyRepo
      .createQueryBuilder('h')
      .leftJoinAndSelect('h.changedBy', 'changedBy')
      .where('h.checkpointId = :checkpointId', { checkpointId })
      .orderBy(sortField, query.order ?? 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return {
      data: items,
      meta: { total, page, limit, pageCount: Math.ceil(total / limit) || 1 },
    };
  }

  async update(id: number, dto: UpdateCheckpointDto) {
    const checkpoint = await this.checkpointsRepo.findOne({ where: { id } });
    if (!checkpoint) {
      throw new NotFoundException(`Checkpoint ${id} not found`);
    }
    if (dto.name !== undefined) checkpoint.name = dto.name;
    if (dto.locationLat !== undefined) {
      checkpoint.locationLat = dto.locationLat as unknown as string;
    }
    if (dto.locationLong !== undefined) {
      checkpoint.locationLong = dto.locationLong as unknown as string;
    }
    if (dto.description !== undefined) {
      checkpoint.description = dto.description ?? null;
    }
    if (dto.isActive !== undefined) checkpoint.isActive = dto.isActive;

    await this.checkpointsRepo.save(checkpoint);
    return this.findOne(id);
  }

  async addStatus(
    checkpointId: number,
    dto: AddCheckpointStatusDto,
    changedByUserId: number,
  ) {
    await this.ensureCheckpointExists(checkpointId);
    const row = this.historyRepo.create({
      checkpointId,
      status: dto.status.trim(),
      reason: dto.reason?.trim() ?? null,
      changedById: changedByUserId,
    });
    await this.historyRepo.save(row);
    return this.findOne(checkpointId);
  }

  private async ensureCheckpointExists(id: number) {
    const exists = await this.checkpointsRepo.exist({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Checkpoint ${id} not found`);
    }
  }
}
