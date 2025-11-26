import { IsString, IsEnum } from 'class-validator';

export enum ConfirmationParty {
  LENDER = 'lender',
  BORROWER = 'borrower',
}

export class ConfirmAgreementDto {
  @IsString()
  qr_data: string;

  @IsEnum(ConfirmationParty)
  confirmed_by: ConfirmationParty;
}