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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  DeviceBrand,
  DevicePublicationStatus,
} from '../entities/device.entity';

export class CreateDeviceDto {
  @ApiProperty({ enum: ['apple', 'samsung'], example: 'samsung' })
  @IsIn(['apple', 'samsung'])
  brand!: DeviceBrand;

  @ApiProperty({ example: 'Galaxy S26 Ultra' })
  @IsString()
  @Length(2, 80)
  name!: string;

  @ApiProperty({ example: 'galaxy-s26-ultra' })
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @Length(2, 100)
  slug!: string;

  @ApiProperty({ example: '최신 울트라 플래그십' })
  @IsString()
  @Length(2, 120)
  tagline!: string;

  @ApiProperty({
    example:
      '색상과 용량, 가입 조건을 확인한 뒤 당일 정책 기준으로 안내드립니다.',
  })
  @IsString()
  @Length(2, 2000)
  description!: string;

  @ApiPropertyOptional({ example: '/images/devices/galaxy-s26-ultra.jpg' })
  @IsOptional()
  @IsString()
  @Matches(/^\//)
  @MaxLength(500)
  imageUrl?: string;

  @ApiPropertyOptional({
    example: 'https://www.samsung.com/sec/smartphones/galaxy-s26-ultra/',
  })
  @IsOptional()
  @IsUrl({ require_tld: true, protocols: ['https'] })
  @MaxLength(500)
  sourceUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ['코발트 바이올렛', '블랙'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(12)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  colors?: string[];

  @ApiPropertyOptional({ type: [String], example: ['256GB', '512GB'] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  storageOptions?: string[];

  @ApiProperty({
    type: [String],
    example: [
      '카메라와 성능을 우선으로 찾는 분께 추천',
      '당일 정책 기준 상담 안내',
    ],
  })
  @IsArray()
  @ArrayMaxSize(8)
  @IsString({ each: true })
  @Length(2, 160, { each: true })
  highlights!: string[];

  @ApiPropertyOptional({
    enum: ['draft', 'published', 'archived'],
    example: 'draft',
  })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: DevicePublicationStatus;

  @ApiPropertyOptional({ minimum: 0, maximum: 9999, example: 10 })
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
