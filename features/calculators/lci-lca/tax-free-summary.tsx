import { ShareResultFooter } from '@/components/share-result';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { Badge } from '@/features/calculators/components/badge';
import { GrowthChart } from '@/features/calculators/components/growth-chart';
import {
  formatCurrencyFromNumber,
  formatPercent,
  LciLcaProjectionResult,
  ProjectionInputs,
} from '@/features/calculators/utils';
import { buildLciLcaSeries } from '@/features/calculators/utils/series-generators';
import { formatShareText, shareProjection, type LCILCAShareData } from '@/features/shared/share';
import { ProGate } from '@/features/subscription';
import { type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { styles } from './style';

export type TaxFreeSummaryProps = {
  palette: (typeof Colors)['light'];
  details: LciLcaProjectionResult;
  inputs: ProjectionInputs;
  borderColor: string;
  cardStyle?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  valueStyle?: StyleProp<TextStyle>;
  shareData?: LCILCAShareData;
};

export function TaxFreeSummary({
  palette,
  details,
  inputs,
  borderColor,
  cardStyle,
  labelStyle,
  valueStyle,
  shareData,
}: TaxFreeSummaryProps) {
  const handleShare = async () => {
    if (!shareData) return;
    const text = formatShareText('lci-lca', shareData);
    await shareProjection(text);
  };
  return (
    <ThemedView
      style={[cardStyle, { borderColor, backgroundColor: styles.tipCard.backgroundColor }]}
      accessibilityLabel="Resumo da projeção para LCI/LCA">
      <ThemedView style={{ gap: 8, backgroundColor: 'transparent' }}>
        <Badge label="Isento de IR" variant="success" palette={palette} />
        <ThemedText style={[labelStyle, { color: palette.icon }]}>Valor final estimado</ThemedText>
        <ThemedText style={[valueStyle, { color: palette.text }]}>
          {formatCurrencyFromNumber(details.net)}
        </ThemedText>
      </ThemedView>
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
      {shareData ? <ShareResultFooter palette={palette} onShare={handleShare} /> : null}

      {/* Premium: Growth Chart */}
      <ThemedView style={{ marginTop: 16, backgroundColor: 'transparent' }}>
        <ProGate>
          <GrowthChart
            data={buildLciLcaSeries(details, inputs)}
            title="Evolução do Investimento LCI/LCA"
          />
        </ProGate>
      </ThemedView>
    </ThemedView>
  );
}
