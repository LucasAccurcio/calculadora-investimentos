import type { ProjectionResult } from '@/app/calculators/utils/cdb-calculations';
import { formatCurrencyFromNumber, formatPercent } from '@/app/calculators/utils/format';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

export type ProjectionSummaryProps = {
  palette: (typeof Colors)['light'];
  details: ProjectionResult;
  backgroundColor: string;
  borderColor: string;
  cardStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
};

export function ProjectionSummary({
  palette,
  details,
  backgroundColor,
  borderColor,
  cardStyle,
  labelStyle,
  valueStyle,
}: ProjectionSummaryProps) {
  return (
    <ThemedView
      style={[cardStyle, { borderColor, backgroundColor }]}
      accessibilityLabel="Resumo da projeção do investimento">
      <ThemedText style={[labelStyle, { color: palette.icon }]}>Alíquota de IR</ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatPercent(details.taxRate * 100)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>
        {'Imposto de Renda estimado'}
      </ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatCurrencyFromNumber(details.taxAmount)}
      </ThemedText>
      <ThemedText style={[labelStyle, { color: palette.icon }]}>
        {'Valor líquido estimado'}
      </ThemedText>
      <ThemedText style={[valueStyle, { color: palette.text }]}>
        {formatCurrencyFromNumber(details.net)}
      </ThemedText>
    </ThemedView>
  );
}
