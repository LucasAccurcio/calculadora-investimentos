/**
 * ProGate Component
 * Gates premium content with different UI modes:
 * - 'free': Blur + CTA to start trial
 * - 'trial': Full access (shows remaining days)
 * - 'pro': Full access (paid subscriber)
 * - 'trial-expired': Blur + CTA to subscribe
 */

import { BlurView } from 'expo-blur';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSubscription } from './context';

interface ProGateProps {
  children: React.ReactNode;
  onSubscribePress?: () => void;
}

export function ProGate({ children, onSubscribePress }: ProGateProps) {
  const { isPro, trial, canAccessPremiumFeatures, resetTrial } = useSubscription();

  // If user can access (Pro or in trial with remaining attempts), show content
  if (canAccessPremiumFeatures) {
    return <>{children}</>;
  }

  // Otherwise, show gated UI
  const mode = isPro ? 'pro' : trial?.hasReachedLimit ? 'trial-expired' : 'free';

  // Default handler: start trial by resetting (which gives 7 days + 3 calculations)
  const handlePress = onSubscribePress || resetTrial;

  return (
    <View style={styles.gateContainer}>
      {/* Keep children in-flow to provide height; layer blur + overlay above */}
      <View pointerEvents="none">{children}</View>
      <BlurView intensity={85} style={styles.blurView} pointerEvents="none" />
      <View style={styles.overlay}>
        <View style={styles.content}>
          {mode === 'free' && (
            <>
              <Text style={styles.title}>Teste o Plano Pro</Text>
              <Text style={styles.description}>
                Desbloqueie gráficos de evolução e comparativos por 7 dias
              </Text>
              <Pressable style={styles.button} onPress={handlePress}>
                <Text style={styles.buttonText}>Iniciar Trial Grátis</Text>
              </Pressable>
            </>
          )}

          {mode === 'trial-expired' && (
            <>
              <Text style={styles.title}>Trial Finalizado</Text>
              <Text style={styles.description}>
                Assine o Plano Pro para continuar acessando gráficos e análises avançadas
              </Text>
              <Pressable style={styles.button} onPress={handlePress}>
                <Text style={styles.buttonText}>Assinar Plano Pro</Text>
              </Pressable>
              {trial && (
                <Text style={styles.trialInfo}>
                  Cálculos usados: {trial.calculationsUsed}/{trial.maxCalculationsInTrial}
                </Text>
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const StyleSheet = {
  absoluteFillObject: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
};

const styles = {
  gateContainer: {
    position: 'relative' as const,
    overflow: 'hidden' as const,
    borderRadius: 16,
  },
  blurView: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    paddingHorizontal: 24,
    alignItems: 'center' as const,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#fff',
    textAlign: 'center' as const,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center' as const,
    lineHeight: 20,
  },
  button: {
    marginTop: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#fff',
    textAlign: 'center' as const,
  },
  trialInfo: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
  },
};
