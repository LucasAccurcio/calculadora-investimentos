import { ScrollView, StyleSheet } from 'react-native';

import { CalculatorMenuList } from '@/components/home/calculator-menu-list';
import { HomeHeader } from '@/components/home/home-header';
import { PreferencesAccordion } from '@/components/home/preferences-accordion';
import { SectionHeading } from '@/components/home/section-heading';
import { SubscriptionBanner } from '@/components/home/subscription-banner';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { CALCULATORS } from '@/features/home/calculators';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HomeHeader palette={palette} />
        <SectionHeading
          title="Simulações rápidas"
          description="Escolha uma modalidade para abrir a calculadora específica."
          descriptionColor={palette.icon}
        />
        <CalculatorMenuList items={CALCULATORS} palette={palette} />
        <SubscriptionBanner palette={palette} onPress={() => {}} />
        <SectionHeading
          title="Preferências do app"
          description="Defina tema e tamanho das fontes para personalizar sua experiência."
          descriptionColor={palette.icon}
        />
        <PreferencesAccordion palette={palette} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 24,
  },
});
