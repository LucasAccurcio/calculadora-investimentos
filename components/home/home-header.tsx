import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Palette = (typeof import('@/constants/theme').Colors)['light'];

type HomeHeaderProps = {
  palette: Palette;
  onOpenDrawer?: () => void;
};

export function HomeHeader({ palette, onOpenDrawer }: HomeHeaderProps) {
  return (
    <ThemedView style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Abrir menu"
        onPress={onOpenDrawer}
        style={styles.iconButton}>
        <IconSymbol name="line.3.horizontal" color={palette.text} size={22} />
      </Pressable>
      <ThemedView style={styles.titleWrapper}>
        <ThemedText type="title" style={styles.appName}>
          RendaFixa Pro
        </ThemedText>
        <ThemedText style={styles.tagline}>Seus investimentos, simplificados</ThemedText>
      </ThemedView>
      <Pressable accessibilityRole="button" style={styles.iconButton}>
        <IconSymbol name="bell.fill" color={palette.text} size={22} />
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleWrapper: {
    flex: 1,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  appName: {
    fontSize: 20,
    letterSpacing: 0.3,
  },
  tagline: {
    fontSize: 13,
    opacity: 0.5,
    marginTop: 2,
  },
  iconButton: {
    height: 44,
    width: 44,
    borderWidth: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
