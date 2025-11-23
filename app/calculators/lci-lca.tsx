import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function LciLcaCalculatorScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">LCI / LCA</ThemedText>
      <ThemedText>
        Configure metas isentas de IR informando taxa, prazo e aportes. Aqui você poderá comparar o
        retorno com outras classes para validar a melhor alocação.
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
