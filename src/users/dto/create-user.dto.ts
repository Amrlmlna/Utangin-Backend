import { IsEmail, IsOptional, IsString, IsPhoneNumber, IsNumber, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  ktp_number?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reputation_score?: number = 0;
}