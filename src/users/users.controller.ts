import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  NotFoundException,
  Req
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../auth/interfaces/user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create({
      ...createUserDto,
      ktp_verified: false,
      selfie_verified: false,
      balance: 0,
      reputation_score: createUserDto.reputation_score ?? 0,
    });
  }

  @Post('verify')
  @UseGuards(AuthGuard('jwt'))
  async verify(@Body() verifyUserDto: VerifyUserDto, @Req() req): Promise<User> {
    const userId = req.user.id; // Get user ID from the JWT token
    return this.usersService.verifyUser(userId, verifyUserDto);
  }

  @Get('verify')
  @UseGuards(AuthGuard('jwt'))
  async checkVerification(@Req() req): Promise<{ isVerified: boolean }> {
    const userId = req.user.id; // Get user ID from the JWT token
    const isVerified = await this.usersService.isVerified(userId);
    return { isVerified };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      return await this.usersService.findOne(id);
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string): Promise<void> {
    return this.usersService.remove(id);
  }
}
