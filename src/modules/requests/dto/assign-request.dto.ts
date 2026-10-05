import { IsOptional, IsUUID } from 'class-validator';

export class AssignRequestDto {
  @IsOptional() @IsUUID() assigneeId!: string | null;
}
