import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { AgreementsModule } from '../agreements/agreements.module';

@Module({
  imports: [AgreementsModule],
  providers: [NotificationsService, NotificationSchedulerService],
  controllers: [NotificationsController],
  exports: [NotificationsService]
})
export class NotificationsModule {}
