import { IsOptional, IsString, MaxLength } from 'class-validator';

export class AddCheckpointStatusDto {
  @IsString()
  @MaxLength(50)
  status: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
