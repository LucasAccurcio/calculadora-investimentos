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
    borderRadius: 20,
    backgroundColor: 'rgba(41, 37, 255, 0.08)',
    borderWidth: 1,
    gap: 16,
  },
  titleWithIcon: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  textGroup: {
    gap: 6,
    backgroundColor: 'transparent',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
});
