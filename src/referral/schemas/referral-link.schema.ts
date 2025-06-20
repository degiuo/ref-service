import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ReferralLinkDocument = ReferralLink & Document;

@Schema({ timestamps: true })
export class ReferralLink {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, unique: true, index: true })
  referralCode!: string;

  @Prop({ required: true })
  referralLink!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: 0 })
  clickCount!: number;

  @Prop({ type: [String], default: [] })
  referredUsers!: string[];

  @Prop({ default: 0 })
  totalCommissionEarned!: number;

  @Prop({ default: Date.now })
  createdAt!: Date;

  @Prop({ default: Date.now })
  updatedAt!: Date;
}

export const ReferralLinkSchema = SchemaFactory.createForClass(ReferralLink); 