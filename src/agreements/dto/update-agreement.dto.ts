import { IsUUID, IsOptional, IsNumber, IsDateString, IsEnum, IsString, ValidateNested, IsBoolean } from 'class-validator';
import { AgreementStatus, DeliveryMethod } from './create-agreement.dto';
import { Type } from 'class-transformer';

export class RepaymentScheduleItem {
  @IsNumber()
  amount: number;

  @IsDateString()
  due_date: string;
}

export class UpdateAgreementDto {
  @IsOptional()
  @IsUUID()
  lender_id?: string;

  @IsOptional()
  @IsUUID()
  borrower_id?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsNumber()
  interest_rate?: number;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsEnum(AgreementStatus)
  status?: AgreementStatus;

  @IsOptional()
  @IsString()
  qr_code?: string;

  @IsOptional()
  @IsBoolean()
  lender_confirmed?: boolean;

  @IsOptional()
  @IsBoolean()
  borrower_confirmed?: boolean;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => RepaymentScheduleItem)
  repayment_schedule?: RepaymentScheduleItem[];

  @IsOptional()
  @IsString()
  escalation_settings?: string;
}