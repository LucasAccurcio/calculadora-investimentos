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
        style={[styles.iconButton, { borderColor: palette.icon }]}>
        <IconSymbol name="line.3.horizontal" color={palette.text} size={22} />
      </Pressable>
      <ThemedView style={styles.titleWrapper}>
        <ThemedText type="subtitle">Calculadora</ThemedText>
        <ThemedText type="title">Renda Fixa</ThemedText>
      </ThemedView>
      <Pressable
        accessibilityRole="button"
        style={[styles.iconButton, { borderColor: palette.icon }]}>
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
  },
  iconButton: {
    height: 44,
    width: 44,
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
