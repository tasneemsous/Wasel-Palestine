import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { IncidentSeverity, IncidentType } from './incident.entity';

export class CreateIncidentDto {
  @IsEnum(IncidentType)
  type: IncidentType;

  @IsEnum(IncidentSeverity)
  severity: IncidentSeverity;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  locationLat: number;

  @IsNumber()
  locationLong: number;

  /** When set, links this incident to an existing crowdsourced report. */
  @IsNumber()
  @IsOptional()
  sourceReportId?: number;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
