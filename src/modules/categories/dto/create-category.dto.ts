import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';
export class CreateCategoryDto {
  @ApiProperty({ example: 'Jurídico' }) @IsString() @Length(2, 50) name!: string;
}
