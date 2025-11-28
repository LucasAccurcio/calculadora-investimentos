import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '../ui/icon-symbol';

type Palette = (typeof import('@/constants/theme').Colors)['light'];

type SubscriptionBannerProps = {
  palette: Palette;
  onPress: () => void;
};

export function SubscriptionBanner({ palette, onPress }: SubscriptionBannerProps) {
  return (
    <ThemedView style={[styles.container, { borderColor: palette.tint }]}>
      <Pressable onPress={onPress}>
        <ThemedView style={styles.textGroup}>
          <ThemedView style={styles.titleWithIcon}>
            <IconSymbol name="crown.fill" size={24} color="#fbbf24" />
            <ThemedText type="subtitle">Assine o Premium</ThemedText>
          </ThemedView>
          <ThemedText style={styles.description}>
            Desbloqueie comparações ilimitadas, exporte relatórios em PDF e receba alertas de
            rentabilidade semanal.
          </ThemedText>
        </ThemedView>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(251, 191, 36, 0.08)',
    borderWidth: 0,
    gap: 12,
  },
  titleWithIcon: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 10,
  },
  textGroup: {
    gap: 8,
    backgroundColor: 'transparent',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    opacity: 0.7,
  },
});
