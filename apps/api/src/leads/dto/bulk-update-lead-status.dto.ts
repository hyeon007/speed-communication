import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
} from 'class-validator';
import type { LeadStatus } from '../entities/lead.entity';
import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateLeadStatusDto {
  @ApiProperty({
    type: [Number],
    minItems: 1,
    maxItems: 200,
    example: [1, 2, 3],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(200)
  @IsInt({ each: true })
  ids!: number[];

  @ApiProperty({
    enum: ['new', 'in_progress', 'completed'],
    example: 'completed',
  })
  @IsIn(['new', 'in_progress', 'completed'])
  status!: LeadStatus;
}
