import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type {
  DeviceBrand,
  DevicePublicationStatus,
} from '../entities/device.entity';

export class UpdateDeviceDto {
  @ApiPropertyOptional({ enum: ['apple', 'samsung'] })
  @IsOptional()
  @IsIn(['apple', 'samsung'])
  brand?: DeviceBrand;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 80)
  name?: string;

  @ApiPropertyOptional({ example: 'galaxy-s26-ultra' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @Length(2, 100)
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 120)
  tagline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 2000)
  description?: string;

  @ApiPropertyOptional({
    example: '/images/devices/galaxy-s26-ultra.jpg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\//)
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsUrl({ require_tld: true, protocols: ['https'] })
  @MaxLength(500)
  sourceUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  colors?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  storageOptions?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @Length(2, 160, { each: true })
  highlights?: string[];

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: DevicePublicationStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 9999 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(9999)
  sortOrder?: number;

  @ApiPropertyOptional({ example: '2026-02-26' })
  @IsOptional()
  @IsDateString()
  releasedAt?: string;
}
