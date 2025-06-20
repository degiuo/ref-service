import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { ReferralService } from '@referral/referral.service';
import { CreateReferralLinkDto } from '@dto/create-referral-link.dto';
import { ProcessCommissionDto } from '@dto/process-commission.dto';
import { 
  createSuccessResponse,
  createErrorResponse,
  ServiceResponse
} from '@common/interfaces/service-response.interface';

@Controller()
export class ReferralController {
  private readonly logger = new Logger(ReferralController.name);

  constructor(private readonly referralService: ReferralService) {}

  @MessagePattern('referral.link.create')
  async createReferralLink(
    @Payload() data: CreateReferralLinkDto
  ): Promise<ServiceResponse<{ referralCode: string; referralLink: string }>> {
    this.logger.log(`Processing referral.link.create for user: ${data.userId}`);
    
    try {
      const result = await this.referralService.createReferralLink(data);
      this.logger.log(`Referral link created successfully: ${result.referralCode}`);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error(`Failed to create referral link: ${error.message}`, error.stack);
      return createErrorResponse(error.message, 'REFERRAL_LINK_CREATION_FAILED');
    }
  }

  @MessagePattern('referral.stats.get')
  async getReferralStats(
    @Payload() data: { userId: string }
  ): Promise<ServiceResponse<any>> {
    this.logger.log(`Processing referral.stats.get for user: ${data.userId}`);
    
    try {
      const stats = await this.referralService.getReferralStats(data.userId);
      this.logger.log(`Referral stats retrieved for user: ${data.userId}`);
      return createSuccessResponse(stats);
    } catch (error) {
      this.logger.error(`Failed to get referral stats: ${error.message}`, error.stack);
      return createErrorResponse(error.message, 'REFERRAL_STATS_RETRIEVAL_FAILED');
    }
  }

  @MessagePattern('referral.commission.process')
  async processCommission(
    @Payload() data: ProcessCommissionDto
  ): Promise<ServiceResponse<{ success: boolean; commissionAmount: number }>> {
    this.logger.log(`Processing referral.commission.process for transaction: ${data.transactionId}`);
    
    try {
      const result = await this.referralService.processCommission(data);
      this.logger.log(`Commission processed: ${result.commissionAmount} for user ${data.userId}`);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error(`Failed to process commission: ${error.message}`, error.stack);
      return createErrorResponse(error.message, 'COMMISSION_PROCESSING_FAILED');
    }
  }

  @MessagePattern('referral.code.validate')
  async validateReferralCode(
    @Payload() data: { referralCode: string }
  ): Promise<ServiceResponse<{ valid: boolean; referrerId?: string }>> {
    this.logger.log(`Processing referral.code.validate for code: ${data.referralCode}`);
    
    try {
      const result = await this.referralService.validateReferralCode(data.referralCode);
      this.logger.log(`Referral code validation result: ${result.valid}`);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error(`Failed to validate referral code: ${error.message}`, error.stack);
      return createErrorResponse(error.message, 'REFERRAL_CODE_VALIDATION_FAILED');
    }
  }

  @MessagePattern('referral.register')
  async registerReferral(
    @Payload() data: { referralCode: string; userId: string }
  ): Promise<ServiceResponse<{ success: boolean; referrerId?: string }>> {
    this.logger.log(`Processing referral.register for user: ${data.userId} with code: ${data.referralCode}`);
    
    try {
      const result = await this.referralService.registerReferral(data.referralCode, data.userId);
      this.logger.log(`Referral registration result: ${result.success}`);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error(`Failed to register referral: ${error.message}`, error.stack);
      return createErrorResponse(error.message, 'REFERRAL_REGISTRATION_FAILED');
    }
  }

  @MessagePattern('referral.history.get')
  async getReferralHistory(
    @Payload() data: { userId: string; limit?: number; offset?: number }
  ): Promise<ServiceResponse<{ transactions: any[]; total: number }>> {
    this.logger.log(`Processing referral.history.get for user: ${data.userId}`);
    
    try {
      const result = await this.referralService.getReferralHistory(
        data.userId, 
        data.limit || 50, 
        data.offset || 0
      );
      this.logger.log(`Retrieved ${result.transactions.length} referral transactions`);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error(`Failed to get referral history: ${error.message}`, error.stack);
      return createErrorResponse(error.message, 'REFERRAL_HISTORY_RETRIEVAL_FAILED');
    }
  }

  @MessagePattern('referral.status.update')
  async updateReferralStatus(
    @Payload() data: { userId: string; isActive: boolean }
  ): Promise<ServiceResponse<{ success: boolean }>> {
    this.logger.log(`Processing referral.status.update for user: ${data.userId} - active: ${data.isActive}`);
    
    try {
      const result = await this.referralService.updateReferralLinkStatus(data.userId, data.isActive);
      this.logger.log(`Referral status updated successfully for user: ${data.userId}`);
      return createSuccessResponse(result);
    } catch (error) {
      this.logger.error(`Failed to update referral status: ${error.message}`, error.stack);
      return createErrorResponse(error.message, 'REFERRAL_STATUS_UPDATE_FAILED');
    }
  }

  @MessagePattern('referral.stats.system')
  async getSystemStats(): Promise<ServiceResponse<any>> {
    this.logger.log('Processing referral.stats.system');
    
    try {
      const stats = await this.referralService.getSystemStats();
      this.logger.log('System referral stats retrieved successfully');
      return createSuccessResponse(stats);
    } catch (error) {
      this.logger.error(`Failed to get system stats: ${error.message}`, error.stack);
      return createErrorResponse(error.message, 'SYSTEM_STATS_RETRIEVAL_FAILED');
    }
  }

  @EventPattern('user.registered')
  async handleUserRegistered(
    @Payload() data: { userId: string; referralCode?: string; email: string; registeredAt: string }
  ): Promise<void> {
    this.logger.log(`Processing user.registered event for user: ${data.userId}`);
    
    try {
      if (data.referralCode) {
        const result = await this.referralService.registerReferral(data.referralCode, data.userId);
        if (result.success) {
          this.logger.log(`User ${data.userId} successfully registered via referral ${data.referralCode}`);
        }
      } else {
        this.logger.log(`User ${data.userId} registered without referral code`);
      }
    } catch (error) {
      this.logger.error(`Failed to process user registration event: ${error.message}`, error.stack);
    }
  }

  @EventPattern('transaction.completed')
  async handleTransactionCompleted(
    @Payload() data: { userId: string; transactionId: string; amount: number; currency: string }
  ): Promise<void> {
    this.logger.log(`Processing transaction.completed event: ${data.transactionId} for user: ${data.userId}`);
    
    try {
      const result = await this.referralService.processCommission({
        userId: data.userId,
        transactionId: data.transactionId,
        amount: data.amount,
        currency: data.currency
      });
      
      if (result.success) {
        this.logger.log(`Commission processed: ${result.commissionAmount} ${data.currency}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process transaction event: ${error.message}`, error.stack);
    }
  }

  @EventPattern('user.banned')
  async handleUserBanned(
    @Payload() data: { userId: string; reason: string; bannedAt: string }
  ): Promise<void> {
    this.logger.log(`Processing user.banned event for user: ${data.userId}`);
    
    try {
      await this.referralService.updateReferralLinkStatus(data.userId, false);
      this.logger.log(`Referral link deactivated for banned user: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to process user banned event: ${error.message}`, error.stack);
    }
  }

  @EventPattern('user.profile.updated')
  async handleUserProfileUpdated(
    @Payload() data: { userId: string; changes: Record<string, any>; updatedAt: string }
  ): Promise<void> {
    this.logger.log(`Processing user.profile.updated event for user: ${data.userId}`);
    
    try {
      this.logger.log(`User profile updated for: ${data.userId}`);
    } catch (error) {
      this.logger.error(`Failed to process user profile update event: ${error.message}`, error.stack);
    }
  }
} 