import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { IncidentSeverity, IncidentType } from './incident.entity';

export class UpdateIncidentDto {
  @IsEnum(IncidentType)
  @IsOptional()
  type?: IncidentType;

  @IsEnum(IncidentSeverity)
  @IsOptional()
  severity?: IncidentSeverity;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @IsNumber()
  @IsOptional()
  locationLong?: number;

  @IsNumber()
  @IsOptional()
  sourceReportId?: number | null;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
