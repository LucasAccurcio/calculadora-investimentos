import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import {
  ProjectionResult,
  formatCurrencyFromNumber,
  formatPercent,
} from '@/features/calculators/utils';
import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { styles } from './style';

export type ProjectionSummaryProps = {
  palette: (typeof Colors)['light'];
  details: ProjectionResult;
  borderColor: string;
  cardStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

export function ProjectionSummary({
  palette,
  details,
  borderColor,
  cardStyle,
  labelStyle,
  valueStyle,
}: ProjectionSummaryProps) {
  const annualEquivalentRate = Math.pow(1 + details.monthlyRate, 12) - 1;

  return (
    <ThemedView
      style={[cardStyle, { borderColor, backgroundColor: styles.tipCard.backgroundColor }]}
      accessibilityLabel="Resumo da projeção do investimento">
      <ThemedText style={[labelStyle, { color: palette.icon }]}>Valor líquido estimado</ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatCurrencyFromNumber(details.net)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>Valor bruto estimado</ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatCurrencyFromNumber(details.gross)}
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
        {formatPercent(annualEquivalentRate * 100)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>Alíquota de IR</ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatPercent(details.taxRate * 100)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>
        Imposto de Renda estimado
      </ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatCurrencyFromNumber(details.taxAmount)}
      </ThemedText>
    </ThemedView>
  );
}
