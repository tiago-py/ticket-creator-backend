import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type AuthUser } from '../../http/current-user.decorator';
import { JwtAuthGuard } from '../../http/jwt-auth.guard';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}
  @Post('register') register(@Body() dto: RegisterDto) {
    return this.service.register(dto);
  }
  @HttpCode(200) @Post('login') login(@Body() dto: LoginDto) {
    return this.service.login(dto);
  }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @Get('me') me(@CurrentUser() user: AuthUser) {
    return this.service.me(user.id);
  }
  @ApiBearerAuth() @UseGuards(JwtAuthGuard) @HttpCode(204) @Post('logout') logout() {
    return;
  }
}
