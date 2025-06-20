import { IsString, IsOptional } from 'class-validator';

export class CreateReferralLinkDto {
  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  expiresAt?: string;
} 