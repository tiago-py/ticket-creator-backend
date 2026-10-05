import { ApiProperty } from '@nestjs/swagger';
import { RequestPriority } from '@prisma/client';
import { IsEnum, IsString, Length, MaxLength, MinLength } from 'class-validator';
export class CreateRequestDto {
  @ApiProperty() @IsString() @Length(4, 100) title!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(1000) description!: string;
  @ApiProperty({ example: 'TI' }) @IsString() @Length(2, 50) category!: string;
  @ApiProperty({ enum: RequestPriority }) @IsEnum(RequestPriority) priority!: RequestPriority;
}
