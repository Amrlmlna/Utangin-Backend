import { IsUUID, IsEmail, IsNumber, IsDateString, IsEnum, IsOptional, IsString, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export enum AgreementStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  PAID = 'paid',
  OVERDUE = 'overdue',
  DISPUTED = 'disputed',
}

export enum DeliveryMethod {
  PUSH = 'push',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
}

export class RepaymentScheduleItem {
  @IsNumber()
  amount: number;

  @IsDateString()
  due_date: string;
}

export class CreateAgreementDto {
  @IsUUID()
  lender_id: string;

  @IsUUID()
  borrower_id: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  interest_rate?: number = 0;

  @IsDateString()
  due_date: string;

  @IsOptional()
  @IsString()
  qr_code?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RepaymentScheduleItem)
  repayment_schedule?: RepaymentScheduleItem[];

  @IsOptional()
  @IsString()
  escalation_settings?: string;
}