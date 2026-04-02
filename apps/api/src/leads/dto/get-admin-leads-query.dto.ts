import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
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
import type { LeadStatus } from '../entities/lead.entity';

export class GetAdminLeadsQueryDto {
  @ApiPropertyOptional({ minLength: 1, maxLength: 100, example: '홍길동' })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  search?: string;

  @ApiPropertyOptional({
    enum: ['new', 'in_progress', 'completed'],
    example: 'new',
  })
  @IsOptional()
  @IsIn(['new', 'in_progress', 'completed'])
  status?: LeadStatus;

  @ApiPropertyOptional({ minimum: 1, example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ minimum: 1, maximum: 50, example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number;

  @ApiPropertyOptional({ example: '2026-04-01' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2026-04-30' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    enum: ['createdAt', 'name', 'status'],
    example: 'createdAt',
  })
  @IsOptional()
  @IsIn(['createdAt', 'name', 'status'])
  sortBy?: 'createdAt' | 'name' | 'status';

  @ApiPropertyOptional({ enum: ['asc', 'desc'], example: 'desc' })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDirection?: 'asc' | 'desc';
}
