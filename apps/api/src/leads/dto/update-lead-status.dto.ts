import { IsIn } from 'class-validator';
import type { LeadStatus } from '../entities/lead.entity';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLeadStatusDto {
  @ApiProperty({
    enum: ['new', 'in_progress', 'completed'],
    example: 'in_progress',
  })
  @IsIn(['new', 'in_progress', 'completed'])
  status!: LeadStatus;
}
