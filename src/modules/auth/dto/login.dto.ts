import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';
export class LoginDto {
  @ApiProperty({ example: 'marina@empresa.com' }) @IsEmail() email!: string;
  @ApiProperty({ example: '123456' }) @IsString() @MinLength(6) password!: string;
}
