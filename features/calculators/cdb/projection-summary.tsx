import { ShareResultFooter } from '@/components/share-result';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Badge } from '@/features/calculators/components/badge';
import { GrowthChart } from '@/features/calculators/components/growth-chart';
import {
  ProjectionInputs,
  ProjectionResult,
  formatCurrencyFromNumber,
  formatPercent,
} from '@/features/calculators/utils';
import { buildCdbSeries } from '@/features/calculators/utils/series-generators';
import { formatShareText, shareProjection, type CDBShareData } from '@/features/shared/share';
import { ProGate } from '@/features/subscription';
import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import { styles } from './style';

export type ProjectionSummaryProps = {
  palette: (typeof Colors)['light'];
  details: ProjectionResult;
  inputs: ProjectionInputs;
  borderColor: string;
  cardStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  shareData?: CDBShareData;
};

export function ProjectionSummary({
  palette,
  details,
  inputs,
  borderColor,
  cardStyle,
  labelStyle,
  valueStyle,
  shareData,
}: ProjectionSummaryProps) {
  const annualEquivalentRate = Math.pow(1 + details.monthlyRate, 12) - 1;

  const handleShare = async () => {
    if (!shareData) return;
    const text = formatShareText('cdb', shareData);
    await shareProjection(text);
  };

  return (
    <ThemedView
      style={[cardStyle, { borderColor, backgroundColor: styles.tipCard.backgroundColor }]}
      accessibilityLabel="Resumo da projeção do investimento">
      <ThemedView style={{ gap: 8, backgroundColor: 'transparent' }}>
        <Badge label="Tributado" variant="warning" palette={palette} />
        <ThemedText style={[labelStyle, { color: palette.icon }]}>
          Valor líquido estimado
        </ThemedText>
        <ThemedText style={[valueStyle, { color: palette.text }]}>
          {formatCurrencyFromNumber(details.net)}
        </ThemedText>
      </ThemedView>
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
      {shareData ? <ShareResultFooter palette={palette} onShare={handleShare} /> : null}

      {/* Premium: Growth Chart */}
      <ThemedView style={{ marginTop: 16, backgroundColor: 'transparent' }}>
        <ProGate>
          <GrowthChart
            data={buildCdbSeries(details, inputs)}
            title="Evolução do Investimento CDB"
          />
        </ProGate>
      </ThemedView>
    </ThemedView>
  );
}
