import { ProjectionSummary } from '@/app/calculators/cdb/components/projection-summary';
import { styles } from '@/app/calculators/cdb/style';
import { CalculatorInput } from '@/app/calculators/components/calculator-input';
import {
  type CalculableField,
  type ParsedInputs,
  type ProjectionInputs,
  type ProjectionResult,
  calculateProjection,
  solveForMissingField,
} from '@/app/calculators/utils/cdb-calculations';
import {
  fetchLatestCdiRate,
  persistCdiRate,
  readStoredCdiRate,
} from '@/app/calculators/utils/cdi-rate';
import {
  formatCurrencyFromNumber,
  formatCurrencyInput,
  formatDecimal,
  normalizeNumericString,
  parseCurrency,
} from '@/app/calculators/utils/format';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

export type FieldKey = 'initial' | 'monthly' | 'months' | 'cdi' | 'percent' | 'final';

const INITIAL_FIELDS: Record<FieldKey, string> = {
  initial: '',
  monthly: '',
  months: '',
  cdi: '',
  percent: '100',
  final: '',
};

const currencyFields = new Set<FieldKey>(['initial', 'monthly', 'final']);

const extraScrollHeight = Platform.select({ ios: 32, android: 64, default: 48 }) ?? 48;

export default function CdbCalculatorScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const summaryBackground =
    colorScheme === 'light' ? 'rgba(10, 126, 164, 0.08)' : 'rgba(255, 255, 255, 0.06)';

  const [fields, setFields] = useState<Record<FieldKey, string>>(INITIAL_FIELDS);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isFetchingCdi, setIsFetchingCdi] = useState(true);
  const [storedCdiRate, setStoredCdiRate] = useState<number | null>(null);
  const [projectionDetails, setProjectionDetails] = useState<ProjectionResult | null>(null);

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

  const handleChange = useCallback((key: FieldKey, value: string) => {
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
      percent: '100',
      final: '',
    }));
    setError(null);
    setInfo(null);
    setProjectionDetails(null);
  }, []);

  const handleCalculate = useCallback(() => {
    setError(null);
    setInfo(null);
    setProjectionDetails(null);

    const emptyFields = (Object.entries(fields) as [FieldKey, string][]).filter(
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
      const result = calculateProjection(projectionInputs);
      setFields((prev) => ({ ...prev, final: formatCurrencyFromNumber(result.gross) }));
      setInfo('Valor bruto final calculado com base nas demais entradas.');
      setProjectionDetails(result);
      return;
    }

    if (values.final == null || values.final <= 0) {
      setError('Informe o Valor Bruto Final para que possamos calcular os demais campos.');
      return;
    }

    const solved = solveForMissingField(missing as CalculableField, values);
    if (solved == null || Number.isNaN(solved) || !Number.isFinite(solved)) {
      setError(
        'Não foi possível encontrar um valor consistente. Revise os dados e tente novamente.',
      );
      return;
    }

    (values as Record<FieldKey, number | undefined>)[missing] = solved;
    const projection = calculateProjection(values as ProjectionInputs);
    const formattedValue = formatFieldValue(missing, solved);
    setFields((prev) => ({ ...prev, [missing]: formattedValue }));
    setInfo('Campo calculado com sucesso.');
    setProjectionDetails(projection);
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
          placeholder="Ex: 10.000,00"
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
          placeholder="Ex: 1.000,00"
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
          placeholder="Ex: 24"
          onClear={() => handleChange('months', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
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
          placeholder="Ex: 110"
          onClear={() => handleChange('percent', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />
        <CalculatorInput
          label="Valor bruto final (R$)"
          value={fields.final}
          onChangeText={(text) => handleChange('final', text)}
          placeholder="Ex: 45.000,00"
          onClear={() => handleChange('final', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />

        {projectionDetails ? (
          <ProjectionSummary
            palette={palette}
            details={projectionDetails}
            backgroundColor={summaryBackground}
            borderColor={palette.tint}
            cardStyle={styles.summaryCard}
            labelStyle={styles.summaryLabel}
            valueStyle={styles.summaryValue}
          />
        ) : null}

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        {info ? <ThemedText style={styles.info}>{info}</ThemedText> : null}

        <ThemedView style={[styles.tipCard, { borderColor: palette.tint }]}>
          <IconSymbol name="info.circle" size={20} color={palette.tint} />
          <ThemedText style={[styles.tipText, { color: palette.text }]}>
            Deixe um campo em branco para que possamos calculá-lo para você.
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

function parseInputs(
  fields: Record<FieldKey, string>,
  missingField: FieldKey,
  fallbackCdi: number | null,
): { success: true; values: ParsedInputs } | { success: false; error: string } {
  const values: ParsedInputs = {};

  const parseNumber = (value: string) => {
    const normalized = normalizeNumericString(value);
    if (!normalized) {
      return null;
    }
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  if (missingField !== 'initial') {
    const parsed = parseCurrency(fields.initial);
    if (parsed == null || parsed < 0) {
      return { success: false, error: 'Informe um valor inicial válido.' };
    }
    values.initial = parsed;
  }

  if (missingField !== 'monthly') {
    const parsed = parseCurrency(fields.monthly);
    if (parsed == null || parsed < 0) {
      return { success: false, error: 'Informe um valor mensal válido.' };
    }
    values.monthly = parsed;
  }

  if (missingField !== 'months') {
    const parsed = parseInt(fields.months, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return { success: false, error: 'O prazo precisa ser um número inteiro maior que zero.' };
    }
    values.months = parsed;
  }

  if (missingField !== 'cdi') {
    const parsed = parseNumber(fields.cdi);
    const cdiValue = parsed ?? fallbackCdi;
    if (cdiValue == null || cdiValue <= 0) {
      return {
        success: false,
        error: 'Não foi possível identificar a taxa CDI. Digite-a manualmente.',
      };
    }
    values.cdi = cdiValue;
  }

  if (missingField !== 'percent') {
    const parsed = parseNumber(fields.percent);
    if (parsed == null || parsed <= 0) {
      return { success: false, error: 'Informe um percentual do CDI maior que zero.' };
    }
    values.percent = parsed;
  }

  if (missingField !== 'final') {
    const parsed = parseCurrency(fields.final);
    if (parsed == null || parsed <= 0) {
      return { success: false, error: 'Informe um valor bruto final válido.' };
    }
    values.final = parsed;
  }

  return { success: true, values };
}

function formatFieldValue(field: FieldKey, value: number) {
  if (currencyFields.has(field)) {
    return formatCurrencyFromNumber(value);
  }
  if (field === 'months') {
    return Math.max(1, Math.round(value)).toString();
  }
  if (field === 'percent' || field === 'cdi') {
    return formatDecimal(value);
  }
  return formatDecimal(value);
}
