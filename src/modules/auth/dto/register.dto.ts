import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
export class RegisterDto {
  @ApiProperty({ example: 'Marina Costa' }) @IsString() @MinLength(3) name!: string;
  @ApiProperty({ example: 'marina@empresa.com' }) @IsEmail() email!: string;
  @ApiProperty({ example: '123456' }) @IsString() @MinLength(6) password!: string;
  @ApiProperty({ enum: UserRole }) @IsEnum(UserRole) role!: UserRole;
}
