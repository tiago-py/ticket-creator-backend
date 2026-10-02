import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../http/current-user.decorator';
import { JwtAuthGuard } from '../../http/jwt-auth.guard';
import { DashboardService } from './dashboard.service';
@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}
  @Get('summary') summary(@CurrentUser() user: AuthUser) {
    return this.service.summary(user);
  }
}
