import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { CalculatorInput } from '@/features/calculators/components/calculator-input';
import { PresetChips, type PresetOption } from '@/features/calculators/components/preset-chips';
import { styles } from '@/features/calculators/lci-lca/style';
import { TaxFreeSummary } from '@/features/calculators/lci-lca/tax-free-summary';
import {
  CalculatorFieldKey,
  calculateLciLcaProjection,
  currencyFields,
  fetchLatestCdiRate,
  formatCurrencyFromNumber,
  formatCurrencyInput,
  formatDecimal,
  formatFieldValue,
  parseInputs,
  persistCdiRate,
  readStoredCdiRate,
  solveForMissingField,
  type CalculableField,
  type LciLcaProjectionResult,
  type ProjectionInputs,
} from '@/features/calculators/utils';
import { type LCILCAShareData } from '@/features/shared/share';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const INITIAL_FIELDS: Record<CalculatorFieldKey, string> = {
  initial: '',
  monthly: '',
  months: '',
  cdi: '',
  percent: '95',
  final: '',
};

const MONTHS_PRESETS: PresetOption[] = [
  { label: '12m', value: '12' },
  { label: '24m', value: '24' },
  { label: '36m', value: '36' },
  { label: '60m', value: '60' },
  { label: '120m', value: '120' },
];

const PERCENT_PRESETS: PresetOption[] = [
  { label: '85% CDI', value: '85' },
  { label: '90% CDI', value: '90' },
  { label: '95% CDI', value: '95' },
  { label: '100% CDI', value: '100' },
];

const extraScrollHeight = Platform.select({ ios: 32, android: 64, default: 48 }) ?? 48;

export default function LciLcaCalculatorScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [fields, setFields] = useState<Record<CalculatorFieldKey, string>>(INITIAL_FIELDS);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isFetchingCdi, setIsFetchingCdi] = useState(true);
  const [storedCdiRate, setStoredCdiRate] = useState<number | null>(null);
  const [projectionDetails, setProjectionDetails] = useState<LciLcaProjectionResult | null>(null);
  const [shareData, setShareData] = useState<LCILCAShareData | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const cached = await readStoredCdiRate();
        if (cached && isMounted) {
          setStoredCdiRate(cached);
          setFields((prev) => (prev.cdi ? prev : { ...prev, cdi: formatDecimal(cached) }));
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('Failed to read cached CDI rate', err);
        }
      }

      try {
        const latest = await fetchLatestCdiRate();
        if (latest && isMounted) {
          setStoredCdiRate(latest);
          await persistCdiRate(latest);
          setFields((prev) => ({ ...prev, cdi: formatDecimal(latest) }));
        }
      } catch (err) {
        if (__DEV__) {
          console.warn('Failed to fetch CDI rate', err);
        }
      } finally {
        if (isMounted) {
          setIsFetchingCdi(false);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = useCallback((key: CalculatorFieldKey, value: string) => {
    const nextValue = currencyFields.has(key) ? formatCurrencyInput(value) : value;
    setFields((prev) => ({ ...prev, [key]: nextValue }));
    setError(null);
    setInfo(null);
    setProjectionDetails(null);
  }, []);

  const handleReset = useCallback(() => {
    setFields((prev) => ({
      initial: '',
      monthly: '',
      months: '',
      cdi: prev.cdi,
      percent: '95',
      final: '',
    }));
    setError(null);
    setInfo(null);
    setProjectionDetails(null);
    setShareData(null);
  }, []);

  const handleCalculate = useCallback(() => {
    setError(null);
    setInfo(null);
    setProjectionDetails(null);

    const emptyFields = (Object.entries(fields) as [CalculatorFieldKey, string][]).filter(
      ([, value]) => value.trim().length === 0,
    );

    if (emptyFields.length !== 1) {
      setError('Preencha todos os campos deixando apenas um em branco para calcular.');
      return;
    }

    const missing = emptyFields[0][0];
    const parsed = parseInputs(fields, missing, storedCdiRate);

    if (!parsed.success) {
      setError(parsed.error);
      return;
    }

    const values = parsed.values;

    if (missing === 'final') {
      const projectionInputs = values as ProjectionInputs;
      const result = calculateLciLcaProjection(projectionInputs);
      setFields((prev) => ({ ...prev, final: formatCurrencyFromNumber(result.net) }));
      setInfo('Valor final estimado com base na taxa informada (isento de IR).');
      setProjectionDetails(result);
      setShareData({
        productName: 'LCI/LCA',
        invested: projectionInputs.initial,
        monthlyContribution: projectionInputs.monthly,
        deadline: projectionInputs.months,
        result: result.net,
        cdiRate: projectionInputs.cdi,
        cdiPercent: projectionInputs.percent,
      });
      return;
    }

    if (values.final == null || values.final <= 0) {
      setError('Informe o Valor Final para que possamos calcular os demais campos.');
      return;
    }

    const solved = solveForMissingField(missing as CalculableField, values);
    if (solved == null || Number.isNaN(solved) || !Number.isFinite(solved)) {
      setError(
        'Não foi possível encontrar um valor consistente. Revise os dados e tente novamente.',
      );
      return;
    }

    (values as Record<CalculatorFieldKey, number | undefined>)[missing] = solved;
    const projection = calculateLciLcaProjection(values as ProjectionInputs);
    const formattedValue = formatFieldValue(missing, solved);
    setFields((prev) => ({ ...prev, [missing]: formattedValue }));
    setInfo('Campo calculado com sucesso (isenção automática considerada).');
    setProjectionDetails(projection);
    setShareData({
      productName: 'LCI/LCA',
      invested: (values.initial as number) ?? 0,
      monthlyContribution: (values.monthly as number) ?? 0,
      deadline: (values.months as number) ?? 0,
      result: projection.net,
      cdiRate: (values.cdi as number) ?? 0,
      cdiPercent: (values.percent as number) ?? 0,
    });
  }, [fields, storedCdiRate]);

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={extraScrollHeight}
        style={styles.flex}>
        <CalculatorInput
          label="Valor inicial (R$)"
          value={fields.initial}
          onChangeText={(text) => handleChange('initial', text)}
          placeholder="Ex: 15.000,00"
          onClear={() => handleChange('initial', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />
        <CalculatorInput
          label="Valor mensal (R$)"
          value={fields.monthly}
          onChangeText={(text) => handleChange('monthly', text)}
          placeholder="Ex: 800,00"
          onClear={() => handleChange('monthly', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />
        <CalculatorInput
          label="Prazo em meses"
          value={fields.months}
          onChangeText={(text) => handleChange('months', text.replace(/[^0-9]/g, ''))}
          placeholder="Ex: 36"
          onClear={() => handleChange('months', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />
        <PresetChips
          options={MONTHS_PRESETS}
          onSelect={(value) => handleChange('months', value)}
          palette={palette}
          selectedValue={fields.months}
        />
        <CalculatorInput
          label="Taxa (CDI anual %)"
          value={fields.cdi}
          onChangeText={(text) => handleChange('cdi', text)}
          placeholder={isFetchingCdi ? 'Carregando CDI...' : 'Ex: 13.65'}
          helper={
            storedCdiRate ? 'Atualizada automaticamente com a última taxa disponível.' : undefined
          }
          onClear={() => handleChange('cdi', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />
        <CalculatorInput
          label="Percentual do CDI (%)"
          value={fields.percent}
          onChangeText={(text) => handleChange('percent', text)}
          placeholder="Ex: 95"
          onClear={() => handleChange('percent', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />
        <PresetChips
          options={PERCENT_PRESETS}
          onSelect={(value) => handleChange('percent', value)}
          palette={palette}
          selectedValue={fields.percent}
        />
        <CalculatorInput
          label="Valor final (R$)"
          value={fields.final}
          onChangeText={(text) => handleChange('final', text)}
          placeholder="Ex: 32.500,00"
          onClear={() => handleChange('final', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />

        {projectionDetails ? (
          <TaxFreeSummary
            palette={palette}
            details={projectionDetails}
            borderColor={palette.tint}
            cardStyle={styles.summaryCard}
            labelStyle={styles.summaryLabel}
            valueStyle={styles.summaryValue}
            shareData={shareData ?? undefined}
          />
        ) : null}

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        {info ? <ThemedText style={styles.info}>{info}</ThemedText> : null}

        <ThemedView style={[styles.tipCard, { borderColor: palette.tint }]}>
          <IconSymbol name="info.circle" size={20} color={palette.tint} />
          <ThemedText style={[styles.tipText, { color: palette.text }]}>
            Lembre-se: LCI e LCA são isentos de IR para pessoas físicas.
          </ThemedText>
        </ThemedView>
        <Pressable
          accessibilityRole="button"
          style={styles.primaryButton}
          onPress={handleCalculate}>
          <ThemedText type="defaultSemiBold" style={styles.primaryButtonText}>
            Calcular
          </ThemedText>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.resetButton} onPress={handleReset}>
          <ThemedText style={styles.resetText}>Limpar formulário</ThemedText>
        </Pressable>
      </KeyboardAwareScrollView>
    </ThemedView>
  );
}
