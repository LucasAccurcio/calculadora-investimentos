import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { type StyleProp, type ViewStyle } from 'react-native';

export interface BadgeProps {
  label: string;
  variant?: 'info' | 'success' | 'warning' | 'primary';
  palette: (typeof Colors)['light'];
  style?: StyleProp<ViewStyle>;
}

const badgeVariants = {
  info: {
    bg: 'rgba(37, 99, 235, 0.1)',
    text: '#2563EB',
  },
  success: {
    bg: 'rgba(16, 185, 129, 0.1)',
    text: '#10B981',
  },
  warning: {
    bg: 'rgba(245, 158, 11, 0.1)',
    text: '#F59E0B',
  },
  primary: {
    bg: 'rgba(37, 99, 235, 0.1)',
    text: '#2563EB',
  },
};

export function Badge({ label, variant = 'primary', palette, style }: BadgeProps) {
  const colors = badgeVariants[variant];

  return (
    <ThemedView
      style={[
        {
          backgroundColor: colors.bg,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 6,
          alignSelf: 'flex-start',
        },
        style,
      ]}>
      <ThemedText
        style={{
          fontSize: 11,
          fontWeight: '600',
          color: colors.text,
          textTransform: 'uppercase',
          letterSpacing: 0.3,
        }}>
        {label}
      </ThemedText>
    </ThemedView>
  );
}
