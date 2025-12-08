import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Input, InputField as UIInputField, InputSlot as UIInputSlot } from '@/components/ui/input';
import { Colors } from '@/constants/theme';
import type { ComponentProps } from 'react';
import { forwardRef, useState } from 'react';
import { Pressable, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

export type CalculatorInputProps = ComponentProps<typeof UIInputField> & {
  label: string;
  helper?: string;
  tooltip?: string;
  onClear?: () => void;
  palette: (typeof Colors)['light'];
  containerStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  helperStyle?: StyleProp<TextStyle>;
  inputWrapperProps?: Partial<ComponentProps<typeof Input>>;
  onSubmitEditing?: () => void;
};

export const CalculatorInput = forwardRef<any, CalculatorInputProps>(
  (
    {
      label,
      helper,
      tooltip,
      onClear,
      palette,
      containerStyle,
      labelStyle,
      helperStyle,
      inputWrapperProps,
      onSubmitEditing,
      ...inputProps
    },
    ref,
  ) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const showClear = Boolean(inputProps.value);
    const { variant = 'outline', size = 'lg', ...restWrapperProps } = inputWrapperProps ?? {};

    return (
      <ThemedView style={containerStyle}>
        <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <ThemedText style={labelStyle}>{label}</ThemedText>
          {tooltip ? (
            <Pressable
              accessibilityLabel="Ver informação"
              accessibilityRole="button"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => setShowTooltip(!showTooltip)}>
              <ThemedText style={{ fontSize: 16, fontWeight: '600', marginTop: -2 }}>ⓘ</ThemedText>
            </Pressable>
          ) : null}
        </ThemedView>

        {showTooltip && tooltip ? (
          <Pressable
            onPress={() => setShowTooltip(false)}
            style={{
              backgroundColor: palette.tint,
              borderRadius: 8,
              padding: 10,
              marginBottom: 8,
            }}>
            <ThemedText
              style={{
                fontSize: 12,
                lineHeight: 16,
                color: '#fff',
                fontWeight: '500',
              }}>
              💡 {tooltip}
            </ThemedText>
          </Pressable>
        ) : null}
        <Input variant={variant} size={size} {...restWrapperProps}>
          <UIInputField
            ref={ref}
            {...inputProps}
            keyboardType={inputProps.keyboardType ?? 'numeric'}
            className={inputProps.className ?? 'text-base'}
            placeholderTextColor={inputProps.placeholderTextColor ?? '#9BA1A6'}
            onSubmitEditing={onSubmitEditing}
            returnKeyType="next"
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
  },
);

CalculatorInput.displayName = 'CalculatorInput';
