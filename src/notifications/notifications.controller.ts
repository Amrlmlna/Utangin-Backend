import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UseGuards,
  NotFoundException
} from '@nestjs/common';
import { NotificationsService, Notification } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  async create(@Body() createNotificationDto: CreateNotificationDto): Promise<Notification> {
    return this.notificationsService.create(createNotificationDto);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async findAll(): Promise<Notification[]> {
    return this.notificationsService.findAll();
  }

  @Get('user/:userId')
  @UseGuards(AuthGuard('jwt'))
  async findByUser(@Param('userId') userId: string): Promise<Notification[]> {
    return this.notificationsService.findByUser(userId);
  }

  @Get('agreement/:agreementId')
  @UseGuards(AuthGuard('jwt'))
  async findByAgreement(@Param('agreementId') agreementId: string): Promise<Notification[]> {
    return this.notificationsService.findByAgreement(agreementId);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async findOne(@Param('id') id: string): Promise<Notification> {
    try {
      return await this.notificationsService.findOne(id);
    } catch (error) {
      throw new NotFoundException('Notification not found');
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    return this.notificationsService.update(id, updateNotificationDto);
  }

  @Put(':id/read')
  @UseGuards(AuthGuard('jwt'))
  async markAsRead(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsRead(id);
  }

  @Put(':id/unread')
  @UseGuards(AuthGuard('jwt'))
  async markAsUnread(@Param('id') id: string): Promise<Notification> {
    return this.notificationsService.markAsUnread(id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async remove(@Param('id') id: string): Promise<void> {
    return this.notificationsService.remove(id);
  }
}
