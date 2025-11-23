import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import {
  formatCurrencyFromNumber,
  formatPercent,
  LciLcaProjectionResult,
} from '@/features/calculators/utils';
import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { styles } from './style';

export type TaxFreeSummaryProps = {
  palette: (typeof Colors)['light'];
  details: LciLcaProjectionResult;
  borderColor: string;
  cardStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

export function TaxFreeSummary({
  palette,
  details,
  borderColor,
  cardStyle,
  labelStyle,
  valueStyle,
}: TaxFreeSummaryProps) {
  return (
    <ThemedView
      style={[cardStyle, { borderColor, backgroundColor: styles.tipCard.backgroundColor }]}
      accessibilityLabel="Resumo da projeção para LCI/LCA">
      <ThemedText style={[labelStyle, { color: palette.icon }]}>Valor final estimado</ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatCurrencyFromNumber(details.net)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>Total investido</ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatCurrencyFromNumber(details.contributions)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>Rendimento estimado</ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatCurrencyFromNumber(details.earnings)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>Rentabilidade mensal</ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatPercent(details.monthlyRate * 100)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>
        Rentabilidade anual equivalente
      </ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatPercent((Math.pow(1 + details.monthlyRate, 12) - 1) * 100)}
      </ThemedText>
    </ThemedView>
  );
}
