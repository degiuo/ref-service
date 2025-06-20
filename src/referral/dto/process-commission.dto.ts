import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class ProcessCommissionDto {
  @IsString()
  userId!: string;

  @IsString()
  transactionId!: string;

  @IsNumber()
  @Min(0)
  amount!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customCommissionRate?: number;
} 