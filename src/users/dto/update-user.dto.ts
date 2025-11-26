import { IsEmail, IsOptional, IsString, IsPhoneNumber, IsNumber, Min, Max, IsBoolean } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsString()
  ktp_number?: string;

  @IsOptional()
  @IsBoolean()
  ktp_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  selfie_verified?: boolean;

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reputation_score?: number;

  @IsOptional()
  @IsNumber()
  balance?: number;
}