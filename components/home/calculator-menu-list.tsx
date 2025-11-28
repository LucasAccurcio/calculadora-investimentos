import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { CalculatorMenu } from '@/features/home/calculators';

type Palette = (typeof import('@/constants/theme').Colors)['light'];

type CalculatorMenuListProps = {
  items: CalculatorMenu[];
  palette: Palette;
};

export function CalculatorMenuList({ items, palette }: CalculatorMenuListProps) {
  return (
    <ThemedView style={styles.list}>
      {items.map((menu) => (
        <Link key={menu.title} href={menu.route} asChild>
          <Pressable>
            <ThemedView style={[styles.card, { borderColor: palette.icon }]}>
              <ThemedView style={styles.bodyContainer}>
                <ThemedView style={styles.titleContainer}>
                  <ThemedView style={[styles.iconContainer, { backgroundColor: menu.accent }]}>
                    <IconSymbol name={menu.icon} size={26} color="#ffffff" />
                  </ThemedView>
                  <ThemedText type="subtitle">{menu.title}</ThemedText>
                </ThemedView>

                <ThemedText style={[styles.description, { color: palette.icon }]}>
                  {menu.description}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.chevronContainer}>
                <IconSymbol name="chevron.right" size={20} color={palette.icon} />
              </ThemedView>
            </ThemedView>
          </Pressable>
        </Link>
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: 'transparent',
  },
  bodyContainer: {
    flex: 1,
    gap: 6,
    flexDirection: 'column',
    backgroundColor: 'transparent',
  },
  iconContainer: {
    height: 44,
    width: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronContainer: {
    width: 20,
    marginRight: 4,
    opacity: 0.4,
  },
  description: {
    fontSize: 13,
    flexWrap: 'wrap',
    opacity: 0.6,
    lineHeight: 18,
  },
});
