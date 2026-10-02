import { ApiProperty } from '@nestjs/swagger';
import { RequestStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';
export class UpdateStatusDto {
  @ApiProperty({ enum: RequestStatus }) @IsEnum(RequestStatus) status!: RequestStatus;
}
