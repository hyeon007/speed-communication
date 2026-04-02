import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ minLength: 2, maxLength: 40, example: '오후 7시' })
  @IsString()
  @IsNotEmpty()
  @Length(2, 40)
  contactTime!: string;
}
