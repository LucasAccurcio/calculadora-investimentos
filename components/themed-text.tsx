import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from 'react-native';

import { useFontScaleMultiplier } from '@/hooks/use-preferences';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');
  const fontScale = useFontScaleMultiplier();
  const typeStyle = TYPE_STYLES[type];
  const scaledTypeStyle = scaleTypography(typeStyle, fontScale);
  const scaledInlineStyle = scaleTypography(style, fontScale);

  return <Text style={[{ color }, scaledTypeStyle, scaledInlineStyle]} {...rest} />;
}

function scaleTypography(style: StyleProp<TextStyle> | undefined, multiplier: number) {
  if (!style) {
    return undefined;
  }

  if (multiplier === 1) {
    return style;
  }

  const flattened = StyleSheet.flatten(style);
  if (!flattened) {
    return style;
  }

  const scaled: TextStyle = { ...flattened };
  if (typeof flattened.fontSize === 'number') {
    scaled.fontSize = Number((flattened.fontSize * multiplier).toFixed(2));
  }
  if (typeof flattened.lineHeight === 'number') {
    scaled.lineHeight = Number((flattened.lineHeight * multiplier).toFixed(2));
  }

  return scaled;
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: '#0a7ea4',
  },
});

const TYPE_STYLES: Record<NonNullable<ThemedTextProps['type']>, StyleProp<TextStyle>> = {
  default: styles.default,
  title: styles.title,
  defaultSemiBold: styles.defaultSemiBold,
  subtitle: styles.subtitle,
  link: styles.link,
};
