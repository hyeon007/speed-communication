import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  ConsultationType,
  PreferredCarrier,
} from '../entities/lead.entity';

export class CreateLeadDto {
  @ApiProperty({ minLength: 2, maxLength: 40, example: '홍길동' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 40)
  name!: string;

  @ApiProperty({ example: '01012345678' })
  @Matches(/^01[0-9]-?\d{3,4}-?\d{4}$/)
  phone!: string;

  @ApiProperty({ minLength: 2, maxLength: 80, example: 'iPhone 16 Pro' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 80)
  interestDevice!: string;

  @ApiPropertyOptional({
    enum: ['number_transfer', 'device_change', 'new_subscription', 'undecided'],
    example: 'number_transfer',
  })
  @IsOptional()
  @IsIn(['number_transfer', 'device_change', 'new_subscription', 'undecided'])
  consultationType?: ConsultationType;

  @ApiPropertyOptional({
    enum: ['SKT', 'KT', 'LGU+', 'undecided'],
    example: 'KT',
  })
  @IsOptional()
  @IsIn(['SKT', 'KT', 'LGU+', 'undecided'])
  preferredCarrier?: PreferredCarrier;

  @ApiProperty({ minLength: 2, maxLength: 40, example: '오후 7시' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 40)
  contactTime!: string;
}
