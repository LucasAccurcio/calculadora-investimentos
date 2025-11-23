import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input, InputField as UIInputField, InputSlot as UIInputSlot } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import type { ComponentProps } from 'react';
import { Pressable, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

export type CalculatorInputProps = ComponentProps<typeof UIInputField> & {
  label: string;
  helper?: string;
  onClear?: () => void;
  palette: (typeof Colors)['light'];
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
  inputWrapperProps?: Partial<ComponentProps<typeof Input>>;
};

export function CalculatorInput({
  label,
  helper,
  onClear,
  palette,
  containerStyle,
  labelStyle,
  helperStyle,
  inputWrapperProps,
  ...inputProps
}: CalculatorInputProps) {
  const showClear = Boolean(inputProps.value);
  const { variant = 'outline', size = 'lg', ...restWrapperProps } = inputWrapperProps ?? {};

  return (
    <ThemedView style={containerStyle}>
      <ThemedText style={labelStyle}>{label}</ThemedText>
      <Input variant={variant} size={size} {...restWrapperProps}>
        <UIInputField
          {...inputProps}
          keyboardType={inputProps.keyboardType ?? 'numeric'}
          className={inputProps.className ?? 'text-base'}
          placeholderTextColor={inputProps.placeholderTextColor ?? '#9BA1A6'}
        />
        {showClear && onClear ? (
          <UIInputSlot className="pr-3">
            <Pressable
              accessibilityLabel={`Limpar campo ${label}`}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={onClear}
              style={{ justifyContent: 'center', alignItems: 'center' }}>
              <IconSymbol name="xmark.circle.fill" size={18} color={palette.icon} />
            </Pressable>
          </UIInputSlot>
        ) : null}
      </Input>
      {helper ? <ThemedText style={helperStyle}>{helper}</ThemedText> : null}
    </ThemedView>
  );
}
