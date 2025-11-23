import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function TesouroCalculatorScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Tesouro Direto</ThemedText>
      <ThemedText>
        Escolha entre Tesouro Selic, IPCA+ ou prefixado e calcule o valor final esperado, duration e
        marcação a mercado. Interface definitiva ainda em construção.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    padding: 24,
  },
});
