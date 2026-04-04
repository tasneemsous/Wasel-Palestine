import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';
import { ReportStatus } from './reports.entity';

const MODERATION_OUTCOMES = [
  ReportStatus.VERIFIED,
  ReportStatus.REJECTED,
  ReportStatus.DUPLICATE,
] as const;

export class ModerateReportDto {
  @IsIn(MODERATION_OUTCOMES)
  status: (typeof MODERATION_OUTCOMES)[number];

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  notes?: string;
}
