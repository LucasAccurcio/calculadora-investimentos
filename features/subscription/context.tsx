/**
 * SubscriptionProvider and useSubscription hook
 * Manages trial period, calculation count, and premium access
 *
 * Structure prepared for future device-locking when integrating auth service:
 * - deviceId can be populated from native modules
 * - userId will come from auth service
 * - Validation rules can then be enforced (1 user = 1 device)
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { SubscriptionStatus, UseSubscriptionReturn } from './types';
import { buildTrialState, canAccessPremiumFeatures, determineSubscriptionStatus } from './utils';

const STORAGE_KEYS = {
  IS_PRO: 'subscription:isPro',
  TRIAL_START_DATE: 'subscription:trialStartDate',
  CALCULATIONS_USED: 'subscription:calculationsUsed',
  DEVICE_ID: 'subscription:deviceId',
};

interface SubscriptionContextType extends UseSubscriptionReturn {
  // Context provides the hook return type
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

interface SubscriptionProviderProps {
  children: React.ReactNode;
}

/**
 * SubscriptionProvider - Initialize and manage subscription state
 */
export function SubscriptionProvider({ children }: SubscriptionProviderProps) {
  const [isPro, setIsPro] = useState(false);
  const [trialStartDate, setTrialStartDate] = useState<number | null>(null);
  const [calculationsUsed, setCalculationsUsed] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from storage on mount
  useEffect(() => {
    const initializeSubscription = async () => {
      try {
        // Load from AsyncStorage
        const [storedIsPro, storedTrialDate, storedCalcCount, storedDeviceId] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.IS_PRO),
          AsyncStorage.getItem(STORAGE_KEYS.TRIAL_START_DATE),
          AsyncStorage.getItem(STORAGE_KEYS.CALCULATIONS_USED),
          AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID),
        ]);

        // Restore subscription state
        setIsPro(storedIsPro === 'true');
        setCalculationsUsed(parseInt(storedCalcCount || '0', 10));

        // Initialize trial if first time
        let trial = storedTrialDate ? parseInt(storedTrialDate, 10) : null;
        if (!storedTrialDate) {
          // First time user - initialize trial
          trial = Date.now();
          await AsyncStorage.setItem(STORAGE_KEYS.TRIAL_START_DATE, trial.toString());
        }
        setTrialStartDate(trial);

        // Initialize device ID if not exists (for future auth integration)
        let device = storedDeviceId;
        if (!storedDeviceId) {
          device = await generateDeviceId();
          await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, device);
        }
        setDeviceId(device);
      } catch (error) {
        console.error('Failed to initialize subscription:', error);
        // Graceful degradation: assume trial on error
        const now = Date.now();
        setTrialStartDate(now);
        await AsyncStorage.setItem(STORAGE_KEYS.TRIAL_START_DATE, now.toString());
      } finally {
        setIsLoading(false);
      }
    };

    initializeSubscription();
  }, []);

  // Calculate derived states
  const status = determineSubscriptionStatus(isPro, trialStartDate);
  const trial =
    trialStartDate && status === SubscriptionStatus.TRIAL
      ? buildTrialState(trialStartDate, calculationsUsed)
      : null;
  const canAccessPremium = canAccessPremiumFeatures(isPro, trialStartDate, calculationsUsed);

  // Increment calculation count and persist
  const incrementCalculationCount = useCallback(async () => {
    const newCount = calculationsUsed + 1;
    setCalculationsUsed(newCount);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CALCULATIONS_USED, newCount.toString());
    } catch (error) {
      console.error('Failed to persist calculation count:', error);
    }
  }, [calculationsUsed]);

  // Mock toggle for testing isPro state
  const toggleProMock = useCallback(async () => {
    const newValue = !isPro;
    setIsPro(newValue);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.IS_PRO, newValue.toString());
    } catch (error) {
      console.error('Failed to toggle Pro mock:', error);
    }
  }, [isPro]);

  // Reset trial for testing
  const resetTrial = useCallback(async () => {
    const now = Date.now();
    setTrialStartDate(now);
    setCalculationsUsed(0);
    setIsPro(false);
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.TRIAL_START_DATE, now.toString()),
        AsyncStorage.setItem(STORAGE_KEYS.CALCULATIONS_USED, '0'),
        AsyncStorage.setItem(STORAGE_KEYS.IS_PRO, 'false'),
      ]);
    } catch (error) {
      console.error('Failed to reset trial:', error);
    }
  }, []);

  const value: SubscriptionContextType = {
    isPro,
    status,
    trial,
    deviceId,
    userId: null, // Will be populated when auth service is integrated
    isLoading,
    canAccessPremiumFeatures: canAccessPremium,
    incrementCalculationCount,
    toggleProMock,
    resetTrial,
  };

  return <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>;
}

/**
 * useSubscription hook - Access subscription state in any component
 */
export function useSubscription(): UseSubscriptionReturn {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

/**
 * Generate device ID for future device-locking mechanism
 * Currently uses crypto.randomUUID, can be replaced with native device ID
 * when integrating with auth service
 */
async function generateDeviceId(): Promise<string> {
  try {
    const deviceId = await Crypto.randomUUID();
    return deviceId;
  } catch {
    // Fallback if crypto fails
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
