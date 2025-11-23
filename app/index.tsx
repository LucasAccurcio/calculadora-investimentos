import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { CALCULATORS } from '@/app/calculators';
import { CalculatorMenuList } from '@/components/home/calculator-menu-list';
import { HomeHeader } from '@/components/home/home-header';
import { PreferencesAccordion } from '@/components/home/preferences-accordion';
import { SectionHeading } from '@/components/home/section-heading';
import { SubscriptionBanner } from '@/components/home/subscription-banner';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Drawer,
  DrawerBackdrop,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
} from '@/components/ui/drawer';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const [isDrawerOpen, setDrawerOpen] = useState(false);

  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HomeHeader palette={palette} onOpenDrawer={openDrawer} />
        <SectionHeading
          title="Simulações rápidas"
          description="Escolha uma modalidade para abrir a calculadora específica."
          descriptionColor={palette.icon}
        />
        <CalculatorMenuList items={CALCULATORS} palette={palette} />
        <SubscriptionBanner palette={palette} onPress={() => {}} />
      </ScrollView>

      <Drawer
        style={{ marginTop: 16 }}
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        anchor="left"
        size="lg">
        <DrawerBackdrop onPress={closeDrawer} />
        <DrawerContent>
          <DrawerHeader>
            <ThemedText type="subtitle">Preferências do app</ThemedText>
            <DrawerCloseButton onPress={closeDrawer} style={styles.closeButton}>
              <IconSymbol name="xmark" size={18} color={palette.text} />
            </DrawerCloseButton>
          </DrawerHeader>
          <DrawerBody>
            <PreferencesAccordion palette={palette} />
          </DrawerBody>
        </DrawerContent>
      </Drawer>
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
  closeButton: {
    height: 36,
    width: 36,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
