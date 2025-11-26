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

export class RegisterDto extends CreateUserDto {
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    return this.authService.register(email, password, name);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, password } = loginDto;
    return this.authService.login(email, password);
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