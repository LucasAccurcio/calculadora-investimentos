import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';

type Palette = (typeof import('@/constants/theme').Colors)['light'];

export type StepperOption = {
  label: string;
  value: number;
  icon?: 'plus' | 'minus';
};

type InputSteppersProps = {
  options: StepperOption[];
  onStep: (value: number) => void;
  palette: Palette;
};

export function InputSteppers({ options, onStep, palette }: InputSteppersProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.buttonGroup}>
        {options.map((option, index) => (
          <Pressable
            key={`${option.value}-${index}`}
            onPress={() => onStep(option.value)}
            style={[
              styles.button,
              {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Incrementar ${option.label}`}>
            {option.icon ? (
              <IconSymbol
                name={option.icon === 'plus' ? 'plus' : 'minus'}
                size={14}
                color={palette.text}
                style={styles.icon}
              />
            ) : null}
            <ThemedText
              style={[
                styles.buttonText,
                {
                  color: palette.text,
                  opacity: 0.7,
                },
              ]}>
              {option.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
    marginBottom: 4,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  icon: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
