import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../http/current-user.decorator';
import { JwtAuthGuard } from '../../http/jwt-auth.guard';
import { CreateRequestDto } from './dto/create-request.dto';
import { ListRequestsDto } from './dto/list-requests.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { RequestsService } from './requests.service';
import { AssignRequestDto } from './dto/assign-request.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
@ApiTags('requests')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}
  @Post() create(@Body() dto: CreateRequestDto, @CurrentUser() user: AuthUser) {
    return this.service.create(dto, user);
  }
  @Get() list(@Query() query: ListRequestsDto, @CurrentUser() user: AuthUser) {
    return this.service.list(query, user);
  }
  @Get(':id') get(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.get(id, user);
  }
  @Put(':id') update(
    @Param('id') id: string,
    @Body() dto: UpdateRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.update(id, dto, user);
  }
  @HttpCode(204) @Delete(':id') remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.remove(id, user);
  }
  @Patch(':id/status') status(
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateStatus(id, dto.status, user);
  }
  @Patch(':id/assignee') assign(
    @Param('id') id: string,
    @Body() dto: AssignRequestDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.assign(id, dto.assigneeId ?? null, user);
  }
  @Post(':id/comments') comment(
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.comment(id, dto.message, user);
  }
}
