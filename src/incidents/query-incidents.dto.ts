import { IsEnum, IsNumber, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { IncidentSeverity, IncidentType } from './incident.entity';

export class QueryIncidentsDto {
  @IsOptional()
  @IsEnum(IncidentType)
  type?: IncidentType;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  sourceReportId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 20;

  @IsOptional()
  @IsIn(['starts_at', 'id', 'severity'])
  sortBy?: 'starts_at' | 'id' | 'severity' = 'starts_at';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order?: 'ASC' | 'DESC' = 'DESC';
}
