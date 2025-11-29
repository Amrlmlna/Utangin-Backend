import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateUserDto } from '../users/dto/create-user.dto';

export class LoginDto {
  email: string;
  password: string;
}

class RegisterDto {
  email: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { email, password } = registerDto;
    const result = await this.authService.register(email, password);

    // If email confirmation is required, return a message instead of user data
    if (result.requiresConfirmation) {
      return { message: result.message };
    }

    // Otherwise return user and token as before
    return result;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
  }

  @Post('confirm-email')
  async confirmEmail(@Body() body: { email: string, password: string }) {
    // This endpoint is for users who have confirmed their email and want to get their token
    // It will try to login the user after confirmation
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Req() req) {
    // Get token from header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    await this.authService.logout(token);
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req) {
    // The user is already validated by the JWT guard
    return req.user;
  }
}