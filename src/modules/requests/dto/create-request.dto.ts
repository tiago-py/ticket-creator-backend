import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, MaxLength, MinLength } from 'class-validator';
export class CreateRequestDto {
  @ApiProperty() @IsString() @Length(4, 100) title!: string;
  @ApiProperty() @IsString() @MinLength(10) @MaxLength(1000) description!: string;
  @ApiProperty({ example: 'TI' }) @IsString() @Length(2, 50) category!: string;
}
