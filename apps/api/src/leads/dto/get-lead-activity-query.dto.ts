import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { LeadStatus } from '../entities/lead.entity';

export class GetLeadActivityQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 200,
    default: 20,
    example: 20,
    description: 'Maximum number of recent activity items',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @ApiPropertyOptional({
    minimum: 1,
    default: 1,
    example: 1,
    description: 'Activity page number',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minLength: 1, maxLength: 50, example: 'admin' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  changedBy?: string;

  @ApiPropertyOptional({
    enum: ['new', 'in_progress', 'completed'],
    example: 'new',
  })
  @IsOptional()
  @IsIn(['new', 'in_progress', 'completed'])
  previousStatus?: LeadStatus;

  @ApiPropertyOptional({
    enum: ['new', 'in_progress', 'completed'],
    example: 'completed',
  })
  @IsOptional()
  @IsIn(['new', 'in_progress', 'completed'])
  nextStatus?: LeadStatus;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
