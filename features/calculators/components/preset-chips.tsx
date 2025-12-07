import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type Palette = (typeof import('@/constants/theme').Colors)['light'];

export type PresetOption = {
  label: string;
  value: string;
};

type PresetChipsProps = {
  options: PresetOption[];
  onSelect: (value: string) => void;
  palette: Palette;
  selectedValue?: string;
};

export function PresetChips({ options, onSelect, palette, selectedValue }: PresetChipsProps) {
  return (
    <ThemedView style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {options.map((option) => {
          const isSelected = selectedValue === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: isSelected ? 'rgba(37, 99, 235, 0.12)' : 'rgba(0, 0, 0, 0.04)',
                  borderColor: isSelected ? '#2563EB' : 'transparent',
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Preset ${option.label}`}>
              <ThemedText
                style={[
                  styles.chipText,
                  {
                    color: isSelected ? '#2563EB' : palette.text,
                    opacity: isSelected ? 1 : 0.7,
                  },
                ]}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  scrollContent: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
