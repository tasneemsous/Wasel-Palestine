import { IsEnum, IsIn, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportCategory, ReportStatus } from './reports.entity';

export class QueryReportsDto {
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @IsOptional()
  @IsEnum(ReportCategory)
  category?: ReportCategory;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsIn(['created_at', 'id'])
  sortBy?: 'created_at' | 'id' = 'created_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
