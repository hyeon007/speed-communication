import { IsNotEmpty, IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({
    minLength: 3,
    maxLength: 64,
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 64)
  username!: string;

  @ApiProperty({
    minLength: 6,
    maxLength: 128,
    example: 'change-me-please',
  })
  @IsString()
  @IsNotEmpty()
  @Length(6, 128)
  password!: string;
}
