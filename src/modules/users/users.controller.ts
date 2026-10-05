import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../http/jwt-auth.guard';
import { UsersService } from './users.service';
import { CurrentUser, type AuthUser } from '../../http/current-user.decorator';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}
  @Get('attendants') attendants(@CurrentUser() user: AuthUser) {
    return this.service.attendants(user);
  }
}
