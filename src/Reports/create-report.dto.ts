import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ReportCategory } from './reports.entity';

export class CreateReportDto {
  @IsEnum(ReportCategory)
  category: ReportCategory;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  locationLat: number;

  @IsNumber()
  locationLong: number;
}