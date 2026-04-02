import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateLeadMemoDto {
  @ApiPropertyOptional({
    maxLength: 1000,
    example: '고객이 금요일 오전 통화 요청',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  memo?: string;
}
