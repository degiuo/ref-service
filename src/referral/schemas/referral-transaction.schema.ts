import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ReferralTransactionDocument = ReferralTransaction & Document;

export enum ReferralTransactionStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
}

export enum ReferralTransactionType {
  COMMISSION = 'commission',
  BONUS = 'bonus',
  WITHDRAWAL = 'withdrawal',
}

@Schema({ timestamps: true })
export class ReferralTransaction {
  @Prop({ required: true, index: true })
  referrerId!: string;

  @Prop({ required: true, index: true })
  referredUserId!: string;

  @Prop({ required: true, unique: true })
  transactionId!: string;

  @Prop({ required: true })
  commissionAmount!: number;

  @Prop({ required: true })
  originalAmount!: number;

  @Prop({ required: true })
  commissionPercentage!: number;

  @Prop({ type: String, enum: ReferralTransactionStatus, default: ReferralTransactionStatus.APPROVED })
  status!: ReferralTransactionStatus;

  @Prop({ type: String, enum: ReferralTransactionType, default: ReferralTransactionType.COMMISSION })
  type!: ReferralTransactionType;

  @Prop({ default: 'USD' })
  currency!: string;

  @Prop()
  description?: string;

  @Prop({ default: Date.now })
  earnedAt!: Date;

  @Prop()
  paidAt?: Date;
}

export const ReferralTransactionSchema = SchemaFactory.createForClass(ReferralTransaction); 