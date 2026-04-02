import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetLeadTrendQueryDto {
  @ApiPropertyOptional({
    minimum: 1,
    maximum: 90,
    default: 7,
    example: 30,
    description: 'Trend window in days',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  days?: number;
}
