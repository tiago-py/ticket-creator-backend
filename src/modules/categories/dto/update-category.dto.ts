import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional() @IsString() @Length(2, 50) name?: string;
  @IsOptional() @IsBoolean() active?: boolean;
}
