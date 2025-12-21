/**
 * Subscription types and enums
 * Future: Will extend with remote validation when integrating with auth service
 */

export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  EXPIRED = 'expired',
}

export interface TrialState {
  startDate: number; // timestamp when trial started
  daysRemaining: number;
  calculationsUsed: number;
  maxCalculationsInTrial: number; // 3 before showing gated content
  hasReachedLimit: boolean; // true when calculationsUsed >= maxCalculationsInTrial
}

export interface SubscriptionState {
  isPro: boolean;
  status: SubscriptionStatus;
  trial: TrialState | null;
  deviceId: string | null; // For future device-locking when integrating with auth
  userId: string | null; // For future device-locking when integrating with auth
}

export interface UseSubscriptionReturn extends SubscriptionState {
  isLoading: boolean;
  canAccessPremiumFeatures: boolean; // true if isPro OR (trial && !hasReachedLimit)
  incrementCalculationCount: () => Promise<void>;
  toggleProMock: () => Promise<void>; // For testing/mocking isPro state
  resetTrial: () => Promise<void>; // For testing
}
