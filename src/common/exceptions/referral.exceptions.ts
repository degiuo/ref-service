import { BaseException } from './base.exception';

export class SteamReferralLinkNotFoundException extends BaseException {
  constructor(code: string) {
    super(`Steam referral link with code "${code}" not found`, 'STEAM_REFERRAL_LINK_NOT_FOUND');
  }
}

export class SteamReferralLinkExpiredException extends BaseException {
  constructor(code: string) {
    super(`Steam referral link with code "${code}" has expired`, 'STEAM_REFERRAL_LINK_EXPIRED');
  }
}

export class InvalidSteamReferralCodeException extends BaseException {
  constructor(code: string) {
    super(`Invalid Steam referral code: "${code}"`, 'INVALID_STEAM_REFERRAL_CODE');
  }
}

export class InvalidSteamIdException extends BaseException {
  constructor(steamId: string) {
    super(`Invalid Steam ID format: "${steamId}". Steam ID must be a 17-digit number starting with 7656119`, 'INVALID_STEAM_ID');
  }
}

export class SelfSteamReferralException extends BaseException {
  constructor() {
    super('Cannot use your own Steam referral link', 'SELF_STEAM_REFERRAL_NOT_ALLOWED');
  }
}

export class SteamCommissionRateExceedsMaximumException extends BaseException {
  constructor(rate: number, maxRate: number) {
    super(
      `Steam commission rate ${rate} exceeds maximum allowed rate ${maxRate}`,
      'STEAM_COMMISSION_RATE_EXCEEDS_MAXIMUM'
    );
  }
}

export class SteamTransactionBelowMinimumException extends BaseException {
  constructor(amount: number, minAmount: number, type: string) {
    super(
      `Steam ${type} amount ${amount / 100} USD is below minimum threshold ${minAmount / 100} USD`,
      'STEAM_TRANSACTION_BELOW_MINIMUM'
    );
  }
}

export class SteamReferralCodeGenerationException extends BaseException {
  constructor() {
    super('Failed to generate unique Steam referral code', 'STEAM_REFERRAL_CODE_GENERATION_FAILED');
  }
}

export class SteamItemValueTooLowException extends BaseException {
  constructor(itemValue: number, minValue: number) {
    super(
      `Steam item value ${itemValue / 100} USD is below minimum ${minValue / 100} USD`,
      'STEAM_ITEM_VALUE_TOO_LOW'
    );
  }
}

export class SteamGamePurchaseTooLowException extends BaseException {
  constructor(purchaseAmount: number, minAmount: number) {
    super(
      `Steam game purchase amount ${purchaseAmount / 100} USD is below minimum ${minAmount / 100} USD`,
      'STEAM_GAME_PURCHASE_TOO_LOW'
    );
  }
}

export class SteamAppNotSupportedException extends BaseException {
  constructor(appId: string) {
    super(
      `Steam App ID "${appId}" is not supported for referral commissions`,
      'STEAM_APP_NOT_SUPPORTED'
    );
  }
}

export class SteamReferralSystemDisabledException extends BaseException {
  constructor() {
    super('Steam referral system is currently disabled', 'STEAM_REFERRAL_SYSTEM_DISABLED');
  }
}

export class SteamEarningsLimitExceededException extends BaseException {
  constructor(type: 'daily' | 'monthly', limit: number) {
    super(
      `Steam referral ${type} earnings limit of ${limit / 100} USD has been exceeded`,
      `STEAM_${type.toUpperCase()}_EARNINGS_LIMIT_EXCEEDED`
    );
  }
}

export class SteamApiException extends BaseException {
  constructor(message: string) {
    super(`Steam API error: ${message}`, 'STEAM_API_ERROR');
  }
}

export class SteamTradeOfferException extends BaseException {
  constructor(message: string) {
    super(`Steam trade offer error: ${message}`, 'STEAM_TRADE_OFFER_ERROR');
  }
}

export class MaxSteamReferralLinksExceededException extends BaseException {
  constructor(maxLinks: number) {
    super(
      `Maximum ${maxLinks} Steam referral links per user allowed`,
      'MAX_STEAM_REFERRAL_LINKS_EXCEEDED'
    );
  }
}

export const ReferralLinkNotFoundException = SteamReferralLinkNotFoundException;
export const ReferralLinkExpiredException = SteamReferralLinkExpiredException;
export const InvalidReferralCodeException = InvalidSteamReferralCodeException;
export const SelfReferralException = SelfSteamReferralException;
export const CommissionRateExceedsMaximumException = SteamCommissionRateExceedsMaximumException;
export const TransactionBelowMinimumException = SteamTransactionBelowMinimumException;
export const ReferralCodeGenerationException = SteamReferralCodeGenerationException; 