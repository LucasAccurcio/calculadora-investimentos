import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import type { CalculatorMenu } from '@/app/calculators';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

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
                    <IconSymbol name={menu.icon} size={26} color={palette.tint} />
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
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bodyContainer: {
    flex: 1,
    gap: 4,
    flexDirection: 'column',
  },
  iconContainer: {
    height: 48,
    width: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronContainer: {
    width: 24,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    flexWrap: 'wrap',
  },
});
