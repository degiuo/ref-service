import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ReferralSettingsDocument = ReferralSettings & Document;

@Schema({ timestamps: true })
export class ReferralSettings {
  @Prop({ required: true, unique: true })
  key!: string;

  @Prop({ required: true, default: 0.015 })
  defaultCommissionRate!: number;

  @Prop({ required: true, default: 0.1 })
  maxCommissionRate!: number;

  @Prop({ default: 0 })
  minTransactionAmount!: number;

  @Prop({ default: true })
  autoApproveCommissions!: boolean;

  @Prop({ default: true })
  steamEnabled!: boolean;

  @Prop()
  steamApiKey?: string;

  @Prop()
  steamBotAccountName?: string;

  @Prop()
  steamBotTradeUrl?: string;

  @Prop({ default: 0.02 })
  steamItemCommissionRate!: number;

  @Prop({ default: 0.025 })
  steamGameCommissionRate!: number;

  @Prop({ default: 0.03 })
  steamMarketCommissionRate!: number;

  @Prop({ default: 50 })
  minSteamItemValue!: number;

  @Prop({ default: 1000 })
  minGamePurchaseAmount!: number;

  @Prop({ type: [String], default: ['730', '440', '570'] })
  supportedSteamApps!: string[];

  @Prop({ type: [String], default: ['USD', 'EUR', 'RUB'] })
  supportedCurrencies!: string[];

  @Prop({ default: false })
  requireSteamVerification!: boolean;

  @Prop({ default: false })
  requireSteamGuard!: boolean;

  @Prop({ default: 30 })
  steamTradeOfferExpiration!: number;

  @Prop({ default: 7 })
  paymentProcessingDays!: number;

  @Prop({ default: null })
  linkExpirationDays?: number;

  @Prop({ default: 10000000 })
  maxDailyEarnings!: number;

  @Prop({ default: 100000000 })
  maxMonthlyEarnings!: number;

  @Prop({ default: 100 })
  maxReferralsPerUser!: number;

  @Prop({ default: 1000 })
  maxClicksPerDay!: number;

  @Prop({ default: true })
  enableEmailNotifications!: boolean;

  @Prop({ default: true })
  enableSteamNotifications!: boolean;

  @Prop({ default: false })
  enableWebhooks!: boolean;

  @Prop()
  webhookUrl?: string;

  @Prop({ type: Object, default: {} })
  itemQualityMultipliers?: {
    'Factory New'?: number;
    'Minimal Wear'?: number;
    'Field-Tested'?: number;
    'Well-Worn'?: number;
    'Battle-Scarred'?: number;
    'StatTrak'?: number;
    'Souvenir'?: number;
  };

  @Prop({ type: Object, default: {} })
  itemRarityMultipliers?: {
    'Consumer Grade'?: number;
    'Industrial Grade'?: number;
    'Mil-Spec'?: number;
    'Restricted'?: number;
    'Classified'?: number;
    'Covert'?: number;
    'Contraband'?: number;
  };

  @Prop({ type: Object })
  metadata?: {
    steamBotStatus?: 'online' | 'offline' | 'maintenance';
    lastSteamApiSync?: Date;
    steamRateLimitRemaining?: number;
    supportedLanguages?: string[];
    regionRestrictions?: string[];
    experimentalFeatures?: string[];
  };
}

export const ReferralSettingsSchema = SchemaFactory.createForClass(ReferralSettings); 