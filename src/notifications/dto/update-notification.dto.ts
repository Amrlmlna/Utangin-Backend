import { IsUUID, IsString, IsEnum, IsBoolean, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { NotificationType } from './create-notification.dto';
import { DeliveryMethod } from '../../agreements/dto/create-agreement.dto';

export class UpdateNotificationDto {
  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsUUID()
  agreement_id?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsBoolean()
  read_status?: boolean;

  @IsOptional()
  @IsEnum(DeliveryMethod)
  delivery_method?: DeliveryMethod;

  @IsOptional()
  @IsDateString()
  scheduled_time?: string;

  @IsOptional()
  @IsNumber()
  escalation_level?: number;
}