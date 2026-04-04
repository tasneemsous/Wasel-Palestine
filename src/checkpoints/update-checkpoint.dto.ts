import { IsBoolean, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCheckpointDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsNumber()
  @IsOptional()
  locationLat?: number;

  @IsNumber()
  @IsOptional()
  locationLong?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
