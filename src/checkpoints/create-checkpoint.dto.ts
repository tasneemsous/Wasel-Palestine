import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCheckpointDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsNumber()
  locationLat: number;

  @IsNumber()
  locationLong: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  /** If set, creates the first status-history row for this checkpoint. */
  @IsString()
  @IsOptional()
  @MaxLength(50)
  initialStatus?: string;

  @IsString()
  @IsOptional()
  initialStatusReason?: string;
}
