export class ReferralStatsDto {
  referralCode!: string | null;
  referralLink!: string | null;
  totalReferrals!: number;
  totalCommissionEarned!: number;
  isActive!: boolean;
  recentTransactions?: any[];
}

export class ReferralLinkStatsDto {
  code!: string;
  clickCount!: number;
  registrationCount!: number;
  totalEarnings!: number;
  steamInventoryEarnings!: number;
  isActive!: boolean;
  createdAt!: Date;
  expiresAt?: Date;
  currency!: string;
  allowedGames?: string[];
}

export class GameStatsDto {
  steamAppId!: string;
  gameName!: string;
  purchaseCount!: number;
  totalRevenue!: number;
  totalCommission!: number;
  averagePrice!: number;
  currency!: string;
}

export class ItemStatsDto {
  steamAppId!: string;
  gameName!: string;
  totalItems!: number;
  totalValue!: number;
  totalCommission!: number;
  averageItemValue!: number;
  topItems!: TopItemDto[];
  currency!: string;
}

export class TopItemDto {
  marketHashName!: string;
  count!: number;
  totalValue!: number;
  averageValue!: number;
  quality?: string;
  rarity?: string;
  iconUrl?: string;
}

export class ReferralHistoryDto {
  transactions!: ReferralTransactionHistoryDto[];
  totalCount!: number;
  totalEarnings!: number;
  totalSteamEarnings!: number;
  currency!: string;
  gameBreakdown!: GameCommissionDto[];
  itemBreakdown!: ItemCommissionDto[];
}

export class ReferralTransactionHistoryDto {
  id!: string;
  referralSteamId!: string;
  originalTransactionId!: string;
  commissionAmount!: number;
  originalAmount!: number;
  commissionRate!: number;
  status!: string;
  type!: string;
  currency!: string;
  steamAppId?: string;
  steamGameName?: string;
  steamItems?: SteamItemHistoryDto[];
  steamTradeOfferId?: string;
  description?: string;
  processedAt!: Date;
  createdAt!: Date;
  paidAt?: Date;
  steamTradeCompletedAt?: Date;
}

export class SteamItemHistoryDto {
  marketHashName!: string;
  appId!: string;
  amount!: number;
  marketValue!: number;
  quality?: string;
  rarity?: string;
  exterior?: string;
  iconUrl?: string;
  isStatTrak?: boolean;
  isSouvenir?: boolean;
}

export class GameCommissionDto {
  steamAppId!: string;
  gameName!: string;
  transactionCount!: number;
  totalCommission!: number;
  currency!: string;
}

export class ItemCommissionDto {
  steamAppId!: string;
  gameName!: string;
  itemCount!: number;
  totalCommission!: number;
  currency!: string;
} 