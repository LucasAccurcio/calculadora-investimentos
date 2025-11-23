import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, ButtonText } from '@/components/ui/button';

type Palette = (typeof import('@/constants/theme').Colors)['light'];

type SubscriptionBannerProps = {
  palette: Palette;
  onPress: () => void;
};

export function SubscriptionBanner({ palette, onPress }: SubscriptionBannerProps) {
  return (
    <ThemedView style={[styles.container, { borderColor: palette.tint }]}>
      <ThemedView style={styles.textGroup}>
        <ThemedText type="subtitle">Assine o Premium</ThemedText>
        <ThemedText style={styles.description}>
          Desbloqueie comparações ilimitadas, exporte relatórios em PDF e receba alertas de
          rentabilidade semanal.
        </ThemedText>
      </ThemedView>
      <Button action="primary" size="lg" onPress={onPress}>
        <ButtonText>Assinar agora</ButtonText>
      </Button>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(41, 37, 255, 0.08)',
    borderWidth: 1,
    gap: 16,
  },
  textGroup: {
    gap: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
});
