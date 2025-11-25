import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { Pressable, StyleSheet } from 'react-native';

type ShareResultFooterProps = {
  palette: (typeof Colors)['light'];
  onShare: () => void;
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export function ShareResultFooter({ palette, onShare }: ShareResultFooterProps) {
  return (
    <ThemedView style={[styles.footer, { borderTopColor: palette.icon }]}>
      <Pressable
        onPress={onShare}
        style={styles.button}
        accessibilityRole="button"
        accessibilityLabel="Compartilhar simulação">
        <IconSymbol name="square.and.arrow.up" size={16} color={palette.tint} />
        <ThemedText style={[styles.buttonText, { color: palette.tint }]}>Compartilhar</ThemedText>
      </Pressable>
    </ThemedView>
  );
}
