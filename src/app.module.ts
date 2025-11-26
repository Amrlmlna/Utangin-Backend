import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AgreementsModule } from './agreements/agreements.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AuthModule } from './auth/auth.module';
import { QrModule } from './qr/qr.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    UsersModule,
    AgreementsModule,
    NotificationsModule,
    AuthModule,
    QrModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
