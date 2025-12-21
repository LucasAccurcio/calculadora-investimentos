/**
 * Trial and subscription calculation utilities
 * Handles trial period logic, calculation counting, and premium access rules
 */

import { SubscriptionStatus, TrialState } from './types';

const TRIAL_DURATION_DAYS = 7;
const MAX_CALCULATIONS_IN_TRIAL = 3;

/**
 * Calculate remaining days in trial
 */
export function calculateTrialDaysRemaining(trialStartDate: number): number {
  const now = Date.now();
  const trialEndDate = trialStartDate + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000;
  const daysRemaining = Math.ceil((trialEndDate - now) / (24 * 60 * 60 * 1000));
  return Math.max(0, daysRemaining);
}

/**
 * Determine if trial is still active
 */
export function isTrialActive(trialStartDate: number): boolean {
  return calculateTrialDaysRemaining(trialStartDate) > 0;
}

/**
 * Build trial state object
 */
export function buildTrialState(trialStartDate: number, calculationsUsed: number): TrialState {
  const daysRemaining = calculateTrialDaysRemaining(trialStartDate);
  const hasReachedLimit = calculationsUsed >= MAX_CALCULATIONS_IN_TRIAL;

  return {
    startDate: trialStartDate,
    daysRemaining,
    calculationsUsed,
    maxCalculationsInTrial: MAX_CALCULATIONS_IN_TRIAL,
    hasReachedLimit,
  };
}

/**
 * Determine subscription status
 */
export function determineSubscriptionStatus(
  isPro: boolean,
  trialStartDate: number | null,
): SubscriptionStatus {
  if (isPro) return SubscriptionStatus.ACTIVE;
  if (trialStartDate && isTrialActive(trialStartDate)) {
    return SubscriptionStatus.TRIAL;
  }
  return SubscriptionStatus.EXPIRED;
}

/**
 * Check if user can access premium features
 * Rules:
 * 1. If isPro → always true
 * 2. If trial active AND calculationsUsed < 3 → true
 * 3. Otherwise → false
 */
export function canAccessPremiumFeatures(
  isPro: boolean,
  trialStartDate: number | null,
  calculationsUsed: number,
): boolean {
  if (isPro) return true;

  if (trialStartDate && isTrialActive(trialStartDate)) {
    return calculationsUsed < MAX_CALCULATIONS_IN_TRIAL;
  }

  return false;
}

/**
 * Determine which mode to show for premium content
 * Returns: 'free' | 'trial' | 'pro'
 */
export function determinePremiumMode(
  isPro: boolean,
  trialStartDate: number | null,
  calculationsUsed: number,
): 'free' | 'trial' | 'pro' {
  if (isPro) return 'pro';

  if (trialStartDate && isTrialActive(trialStartDate)) {
    if (calculationsUsed < MAX_CALCULATIONS_IN_TRIAL) {
      return 'trial';
    }
  }

  return 'free';
}
