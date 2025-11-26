import { IsUUID, IsString, IsEnum, IsBoolean, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { DeliveryMethod } from '../../agreements/dto/create-agreement.dto';

export enum NotificationType {
  REMINDER = 'reminder',
  CONFIRMATION = 'confirmation',
  PAYMENT = 'payment',
  ESCALATION = 'escalation',
  SUMMARY = 'summary',
}

export class CreateNotificationDto {
  @IsUUID()
  user_id: string;

  @IsOptional()
  @IsUUID()
  agreement_id?: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsBoolean()
  read_status?: boolean = false;

  @IsEnum(DeliveryMethod)
  delivery_method: DeliveryMethod;

  @IsOptional()
  @IsDateString()
  scheduled_time?: string;

  @IsOptional()
  @IsNumber()
  escalation_level?: number = 0;
}