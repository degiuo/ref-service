import { Injectable, Logger, BadRequestException, NotFoundException, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { ClientKafka } from '@nestjs/microservices';
import { ReferralLink } from '@schemas/referral-link.schema';
import { ReferralTransaction } from '@schemas/referral-transaction.schema';
import { ReferralSettings } from '@schemas/referral-settings.schema';
import { CreateReferralLinkDto } from '@dto/create-referral-link.dto';
import { ProcessCommissionDto } from '@dto/process-commission.dto';
import { ReferralStatsDto } from '@dto/referral-stats.dto';

@Injectable()
export class ReferralService {
  private readonly logger = new Logger(ReferralService.name);
  private readonly commissionRate = 0.015;

  constructor(
    @InjectModel(ReferralLink.name) private referralLinkModel: Model<ReferralLink>,
    @InjectModel(ReferralTransaction.name) private referralTransactionModel: Model<ReferralTransaction>,
    @InjectModel(ReferralSettings.name) private referralSettingsModel: Model<ReferralSettings>,
    private readonly configService: ConfigService,
    @Inject('KAFKA_CLIENT') private readonly kafkaClient: ClientKafka,
  ) {}

  async createReferralLink(dto: CreateReferralLinkDto): Promise<{ referralCode: string; referralLink: string }> {
    this.logger.log(`Creating referral link for user: ${dto.userId}`);
    
    try {
      let referralLink = await this.referralLinkModel.findOne({ userId: dto.userId }).exec();
      
      if (!referralLink) {
        const referralCode = this.generateReferralCode();
        const fullReferralLink = this.buildReferralLink(referralCode);
        
        referralLink = new this.referralLinkModel({
          userId: dto.userId,
          referralCode,
          referralLink: fullReferralLink,
          isActive: true,
          createdAt: new Date(),
          referredUsers: [],
          totalCommissionEarned: 0,
        });
        
        await referralLink.save();
        
        this.logger.log(`Referral link created: ${referralCode} for user ${dto.userId}`);
        
        await this.publishReferralLinkCreated(dto.userId, referralCode, fullReferralLink);
      }
      
      return {
        referralCode: referralLink.referralCode,
        referralLink: referralLink.referralLink,
      };
    } catch (error) {
      this.logger.error(`Failed to create referral link for user ${dto.userId}:`, error);
      throw new BadRequestException('Failed to create referral link');
    }
  }

  async getReferralStats(userId: string): Promise<ReferralStatsDto> {
    this.logger.log(`Getting referral stats for user: ${userId}`);
    
    try {
      const referralLink = await this.referralLinkModel.findOne({ userId }).exec();
      
      if (!referralLink) {
        return {
          referralCode: null,
          referralLink: null,
          totalReferrals: 0,
          totalCommissionEarned: 0,
          isActive: false,
        };
      }

      const transactions = await this.referralTransactionModel
        .find({ referrerId: userId })
        .sort({ earnedAt: -1 })
        .limit(10)
        .exec();

      return {
        referralCode: referralLink.referralCode,
        referralLink: referralLink.referralLink,
        totalReferrals: referralLink.referredUsers.length,
        totalCommissionEarned: referralLink.totalCommissionEarned,
        isActive: referralLink.isActive,
        recentTransactions: transactions,
      };
    } catch (error) {
      this.logger.error(`Failed to get referral stats for user ${userId}:`, error);
      throw new NotFoundException('User referral data not found');
    }
  }

  async processCommission(dto: ProcessCommissionDto): Promise<{ success: boolean; commissionAmount: number }> {
    this.logger.log(`Processing commission for transaction: ${dto.transactionId}`);
    
    try {
      const referralLink = await this.referralLinkModel.findOne({
        referredUsers: dto.userId,
      }).exec();

      if (!referralLink) {
        this.logger.log(`No referrer found for user ${dto.userId}`);
        return { success: false, commissionAmount: 0 };
      }

      const existingTransaction = await this.referralTransactionModel.findOne({
        transactionId: dto.transactionId,
      }).exec();

      if (existingTransaction) {
        this.logger.warn(`Transaction ${dto.transactionId} already processed`);
        return { success: false, commissionAmount: existingTransaction.commissionAmount };
      }

      const commissionAmount = dto.amount * this.commissionRate;
      
      const transaction = new this.referralTransactionModel({
        referrerId: referralLink.userId,
        referredUserId: dto.userId,
        transactionId: dto.transactionId,
        commissionAmount,
        commissionPercentage: this.commissionRate,
        originalAmount: dto.amount,
        currency: dto.currency || 'USD',
        earnedAt: new Date(),
      });
      
      await transaction.save();
      
      referralLink.totalCommissionEarned += commissionAmount;
      await referralLink.save();
      
      this.logger.log(
        `Commission ${commissionAmount} ${dto.currency} earned by ${referralLink.userId} from ${dto.userId}'s transaction`
      );

      await this.publishCommissionEarned(
        referralLink.userId,
        dto.userId,
        dto.transactionId,
        commissionAmount,
        dto.currency || 'USD'
      );

      return { success: true, commissionAmount };
    } catch (error) {
      this.logger.error(`Failed to process commission for transaction ${dto.transactionId}:`, error);
      throw new BadRequestException('Failed to process commission');
    }
  }

  async registerReferral(referralCode: string, userId: string): Promise<{ success: boolean; referrerId?: string }> {
    this.logger.log(`Registering referral: ${userId} with code ${referralCode}`);
    
    try {
      const referralLink = await this.referralLinkModel.findOne({ 
        referralCode,
        isActive: true 
      }).exec();
      
      if (!referralLink) {
        this.logger.warn(`Invalid referral code: ${referralCode}`);
        return { success: false };
      }

      if (referralLink.userId === userId) {
        this.logger.warn(`User ${userId} tried to use their own referral code`);
        return { success: false };
      }

      if (referralLink.referredUsers.includes(userId)) {
        this.logger.log(`User ${userId} already registered with this referral code`);
        return { success: true, referrerId: referralLink.userId };
      }

      referralLink.referredUsers.push(userId);
      await referralLink.save();
      
      this.logger.log(`User ${userId} registered via referral from ${referralLink.userId}`);
      
      await this.publishReferralUserRegistered(referralLink.userId, userId, referralCode);
      
      return { success: true, referrerId: referralLink.userId };
    } catch (error) {
      this.logger.error(`Failed to register referral for user ${userId}:`, error);
      throw new BadRequestException('Failed to register referral');
    }
  }

  async validateReferralCode(referralCode: string): Promise<{ valid: boolean; referrerId?: string }> {
    this.logger.log(`Validating referral code: ${referralCode}`);
    
    try {
      const referralLink = await this.referralLinkModel.findOne({ 
        referralCode,
        isActive: true 
      }).exec();
      
      if (!referralLink) {
        return { valid: false };
      }

      return { valid: true, referrerId: referralLink.userId };
    } catch (error) {
      this.logger.error(`Failed to validate referral code ${referralCode}:`, error);
      return { valid: false };
    }
  }

  async updateReferralLinkStatus(userId: string, isActive: boolean): Promise<{ success: boolean }> {
    this.logger.log(`Updating referral link status for user ${userId}: ${isActive}`);
    
    try {
      const result = await this.referralLinkModel.updateOne(
        { userId },
        { isActive, updatedAt: new Date() }
      ).exec();

      if (result.matchedCount === 0) {
        throw new NotFoundException('Referral link not found');
      }

      await this.publishReferralStatusUpdated(userId, isActive);

      return { success: true };
    } catch (error) {
      this.logger.error(`Failed to update referral link status for user ${userId}:`, error);
      throw error;
    }
  }

  async getReferralHistory(userId: string, limit = 50, offset = 0): Promise<{ transactions: any[]; total: number }> {
    this.logger.log(`Getting referral history for user: ${userId}`);
    
    try {
      const [transactions, total] = await Promise.all([
        this.referralTransactionModel
          .find({ referrerId: userId })
          .sort({ earnedAt: -1 })
          .skip(offset)
          .limit(limit)
          .exec(),
        this.referralTransactionModel.countDocuments({ referrerId: userId }).exec(),
      ]);

      return { transactions, total };
    } catch (error) {
      this.logger.error(`Failed to get referral history for user ${userId}:`, error);
      throw new BadRequestException('Failed to get referral history');
    }
  }

  private async publishReferralLinkCreated(userId: string, referralCode: string, referralLink: string): Promise<void> {
    try {
      const event = {
        eventId: `referral-link-${userId}-${Date.now()}`,
        userId,
        referralCode,
        referralLink,
        createdAt: new Date().toISOString(),
        timestamp: Date.now(),
      };

      this.kafkaClient.emit('referral.link.created', event);
      this.logger.log(`Published referral.link.created event for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to publish referral.link.created event:`, error);
    }
  }

  private async publishCommissionEarned(
    referrerId: string,
    referredUserId: string,
    transactionId: string,
    commissionAmount: number,
    currency: string
  ): Promise<void> {
    try {
      const event = {
        eventId: `commission-${transactionId}-${Date.now()}`,
        referrerId,
        referredUserId,
        transactionId,
        commissionAmount,
        currency,
        earnedAt: new Date().toISOString(),
        timestamp: Date.now(),
      };

      this.kafkaClient.emit('referral.commission.earned', event);
      this.logger.log(`Published referral.commission.earned event: ${commissionAmount} ${currency}`);
    } catch (error) {
      this.logger.error(`Failed to publish referral.commission.earned event:`, error);
    }
  }

  private async publishReferralUserRegistered(referrerId: string, userId: string, referralCode: string): Promise<void> {
    try {
      const event = {
        eventId: `referral-registration-${userId}-${Date.now()}`,
        referrerId,
        referredUserId: userId,
        referralCode,
        registeredAt: new Date().toISOString(),
        timestamp: Date.now(),
      };

      this.kafkaClient.emit('referral.user.registered', event);
      this.logger.log(`Published referral.user.registered event for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to publish referral.user.registered event:`, error);
    }
  }

  private async publishReferralStatusUpdated(userId: string, isActive: boolean): Promise<void> {
    try {
      const event = {
        eventId: `referral-status-${userId}-${Date.now()}`,
        userId,
        isActive,
        updatedAt: new Date().toISOString(),
        timestamp: Date.now(),
      };

      this.kafkaClient.emit('referral.status.updated', event);
      this.logger.log(`Published referral.status.updated event for user: ${userId}`);
    } catch (error) {
      this.logger.error(`Failed to publish referral.status.updated event:`, error);
    }
  }

  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private buildReferralLink(referralCode: string): string {
    const baseUrl = this.configService.get<string>('FRONTEND_URL', 'https://inskins.gg');
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  async getSystemStats(): Promise<{
    totalLinks: number;
    activeLinks: number;
    totalTransactions: number;
    totalCommission: number;
  }> {
    this.logger.log('Getting system referral stats');
    
    try {
      const [totalLinks, activeLinks, totalTransactions, commissionStats] = await Promise.all([
        this.referralLinkModel.countDocuments().exec(),
        this.referralLinkModel.countDocuments({ isActive: true }).exec(),
        this.referralTransactionModel.countDocuments().exec(),
        this.referralTransactionModel.aggregate([
          { $group: { _id: null, total: { $sum: '$commissionAmount' } } }
        ]).exec(),
      ]);

      return {
        totalLinks,
        activeLinks,
        totalTransactions,
        totalCommission: commissionStats[0]?.total || 0,
      };
    } catch (error) {
      this.logger.error('Failed to get system stats:', error);
      throw new BadRequestException('Failed to get system stats');
    }
  }
} 