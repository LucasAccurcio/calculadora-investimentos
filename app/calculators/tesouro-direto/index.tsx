import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { CircleIcon } from '@/components/ui/icon';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { Colors } from '@/constants/theme';
import { CalculatorInput } from '@/features/calculators/components/calculator-input';
import { TesouroProjectionSummary } from '@/features/calculators/tesouro-direto/projection-summary';
import { styles } from '@/features/calculators/tesouro-direto/style';
import {
  calculateTesouroProjection,
  formatCurrencyFromNumber,
  formatCurrencyInput,
  normalizeNumericString,
  parseCurrency,
  solveTesouroMissingField,
  type TesouroModality,
  type TesouroProjectionResult,
  type TesouroSolvableField,
} from '@/features/calculators/utils';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCallback, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const MODALITY_OPTIONS: { value: TesouroModality; title: string; description: string }[] = [
  {
    value: 'selic',
    title: 'Tesouro Selic',
    description: 'Pós-fixado que acompanha 100% da taxa Selic. Ideal para reserva de emergência.',
  },
  {
    value: 'prefixado',
    title: 'Tesouro Prefixado',
    description: 'Taxa fixa conhecida no momento da compra. Bom para metas com data definida.',
  },
  {
    value: 'ipca',
    title: 'Tesouro IPCA+',
    description: 'Garante ganho real ao combinar IPCA estimado com uma taxa fixa adicional.',
  },
];

type TesouroFieldKey =
  | 'initial'
  | 'monthly'
  | 'months'
  | 'selicRate'
  | 'prefixRate'
  | 'ipcaRate'
  | 'realRate'
  | 'final';

const INITIAL_FIELDS: Record<TesouroFieldKey, string> = {
  initial: '',
  monthly: '',
  months: '',
  selicRate: '10.75',
  prefixRate: '9.50',
  ipcaRate: '4.00',
  realRate: '5.00',
  final: '',
};

const currencyFields = new Set<TesouroFieldKey>(['initial', 'monthly', 'final']);
function parsePercentField(value: string) {
  const normalized = normalizeNumericString(value);
  if (!normalized) {
    return null;
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

const extraScrollHeight = Platform.select({ ios: 32, android: 64, default: 48 }) ?? 48;

export default function TesouroCalculatorScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const [fields, setFields] = useState<Record<TesouroFieldKey, string>>(INITIAL_FIELDS);
  const [modality, setModality] = useState<TesouroModality>('selic');
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [projectionDetails, setProjectionDetails] = useState<TesouroProjectionResult | null>(null);

  const handleChange = useCallback((key: TesouroFieldKey, value: string) => {
    let nextValue = value;
    if (currencyFields.has(key)) {
      nextValue = formatCurrencyInput(value);
    } else if (key === 'months') {
      nextValue = value.replace(/[^0-9]/g, '');
    }
    setFields((prev) => ({ ...prev, [key]: nextValue }));
    setError(null);
    setInfo(null);
    setProjectionDetails(null);
  }, []);

  const handleCalculate = useCallback(() => {
    setError(null);
    setInfo(null);
    setProjectionDetails(null);

    const finalTrimmed = fields.final.trim();
    const wantsReverse = finalTrimmed.length > 0;
    const parsedFinal = wantsReverse ? parseCurrency(fields.final) : null;
    if (wantsReverse && (parsedFinal == null || parsedFinal <= 0)) {
      setError('Informe um Valor Bruto Final válido.');
      return;
    }

    try {
      const selicRate =
        modality === 'selic' ? (parsePercentField(fields.selicRate) ?? undefined) : undefined;
      if (modality === 'selic' && (selicRate == null || selicRate <= 0)) {
        setError('Informe a taxa Selic anual em porcentagem.');
        return;
      }

      const prefixRate =
        modality === 'prefixado' ? (parsePercentField(fields.prefixRate) ?? undefined) : undefined;
      if (modality === 'prefixado' && (prefixRate == null || prefixRate <= 0)) {
        setError('Informe a taxa prefixada anual.');
        return;
      }

      const ipcaRate =
        modality === 'ipca' ? (parsePercentField(fields.ipcaRate) ?? undefined) : undefined;
      const realRate =
        modality === 'ipca' ? (parsePercentField(fields.realRate) ?? undefined) : undefined;
      if (
        modality === 'ipca' &&
        (ipcaRate == null || realRate == null || ipcaRate <= 0 || realRate <= 0)
      ) {
        setError('Preencha IPCA estimado e taxa adicional do IPCA.');
        return;
      }

      const rateConfig = {
        modality,
        selicRate,
        prefixRate,
        ipcaRate,
        realRate,
      };

      if (!wantsReverse) {
        const initial = parseCurrency(fields.initial);
        if (initial == null || initial < 0) {
          setError('Informe um valor inicial válido.');
          return;
        }

        const hasMonthly = fields.monthly.trim().length > 0;
        const monthlyValue = hasMonthly ? parseCurrency(fields.monthly) : 0;
        if (hasMonthly && monthlyValue == null) {
          setError('Não foi possível interpretar o aporte mensal.');
          return;
        }
        const monthly = Math.max(0, monthlyValue ?? 0);

        const months = parseInt(fields.months, 10);
        if (!Number.isFinite(months) || months <= 0) {
          setError('O prazo precisa ser um número inteiro maior que zero.');
          return;
        }

        const result = calculateTesouroProjection({
          ...rateConfig,
          initial,
          monthly,
          months,
        });

        if (!Number.isFinite(result.monthlyRate) || result.monthlyRate < -1) {
          throw new Error('Não foi possível calcular a taxa mensal.');
        }

        setProjectionDetails(result);
        setFields((prev) => ({ ...prev, final: formatCurrencyFromNumber(result.gross) }));
        setInfo('Estimativa considera a taxa informada e a tabela regressiva de IR.');
        return;
      }

      const missingCandidates: TesouroSolvableField[] = ['initial', 'monthly', 'months'];
      const missing = missingCandidates.filter((key) => fields[key].trim().length === 0);

      if (missing.length !== 1 || parsedFinal == null) {
        setError(
          'Quando informar o valor final, deixe apenas um dos demais campos vazio para recalcular.',
        );
        return;
      }

      const missingField = missing[0] as TesouroSolvableField;

      const initialValue = missingField === 'initial' ? null : parseCurrency(fields.initial);
      if (missingField !== 'initial' && (initialValue == null || initialValue < 0)) {
        setError('Informe um valor inicial válido.');
        return;
      }

      const monthlyValue = missingField === 'monthly' ? null : parseCurrency(fields.monthly);
      if (missingField !== 'monthly' && (monthlyValue == null || monthlyValue < 0)) {
        setError('Informe um aporte mensal válido.');
        return;
      }

      const monthsValue = missingField === 'months' ? null : parseInt(fields.months, 10);
      if (missingField !== 'months' && (!Number.isFinite(monthsValue) || (monthsValue ?? 0) <= 0)) {
        setError('O prazo precisa ser um número inteiro maior que zero.');
        return;
      }

      const solved = solveTesouroMissingField(missingField, {
        ...rateConfig,
        final: parsedFinal,
        initial: initialValue ?? undefined,
        monthly: monthlyValue ?? undefined,
        months: monthsValue ?? undefined,
      });

      if (solved == null || !Number.isFinite(solved)) {
        setError(
          'Não foi possível encontrar um valor consistente. Revise os dados e tente novamente.',
        );
        return;
      }

      if ((missingField === 'initial' || missingField === 'monthly') && solved < 0) {
        setError('O valor calculado não pode ser negativo. Ajuste o alvo ou demais campos.');
        return;
      }

      if (missingField === 'months' && solved <= 0) {
        setError('O prazo calculado precisa ser maior que zero.');
        return;
      }

      const resolvedInitial = missingField === 'initial' ? solved : (initialValue ?? 0);
      const resolvedMonthly = missingField === 'monthly' ? solved : (monthlyValue ?? 0);
      const resolvedMonths =
        missingField === 'months' ? Math.max(1, Math.round(solved)) : (monthsValue as number);

      const projection = calculateTesouroProjection({
        ...rateConfig,
        initial: resolvedInitial,
        monthly: resolvedMonthly,
        months: resolvedMonths,
      });

      setProjectionDetails(projection);
      setFields((prev) => ({
        ...prev,
        initial: formatCurrencyFromNumber(resolvedInitial),
        monthly: formatCurrencyFromNumber(resolvedMonthly),
        months: resolvedMonths.toString(),
        final: formatCurrencyFromNumber(parsedFinal),
      }));
      setInfo('Campo recalculado a partir do Valor Bruto Final desejado.');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível calcular o cenário. Revise as taxas e tente novamente.',
      );
    }
  }, [fields, modality]);

  const handleReset = useCallback(() => {
    setFields({ ...INITIAL_FIELDS });
    setModality('selic');
    setError(null);
    setInfo(null);
    setProjectionDetails(null);
  }, []);

  const summaryBackground =
    modality === 'ipca'
      ? colorScheme === 'light'
        ? 'rgba(34, 197, 94, 0.12)'
        : 'rgba(255, 255, 255, 0.08)'
      : colorScheme === 'light'
        ? 'rgba(10, 126, 164, 0.08)'
        : 'rgba(255, 255, 255, 0.06)';

  const modalityHelper = {
    selic: 'Use a projeção da taxa Selic média para o período desejado.',
    prefixado: 'Informe a taxa contratada do título prefixado.',
    ipca: 'Some a estimativa de IPCA com a taxa fixa oferecida pelo título.',
  } satisfies Record<TesouroModality, string>;

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        enableOnAndroid
        extraScrollHeight={extraScrollHeight}
        style={styles.flex}>
        <ThemedView style={[styles.optionCard, { borderColor: palette.icon }]}>
          <ThemedText style={styles.label}>Modalidade</ThemedText>
          <RadioGroup
            value={modality}
            onChange={(value) => {
              setModality(value as TesouroModality);
              setProjectionDetails(null);
              setInfo(null);
              setError(null);
            }}
            className="gap-3">
            {MODALITY_OPTIONS.map((option) => (
              <Radio key={option.value} value={option.value}>
                <RadioIndicator>
                  <RadioIcon as={CircleIcon} />
                </RadioIndicator>
                <ThemedView>
                  <RadioLabel>{option.title}</RadioLabel>
                  <ThemedText style={styles.optionDescription}>{option.description}</ThemedText>
                </ThemedView>
              </Radio>
            ))}
          </RadioGroup>
        </ThemedView>

        <CalculatorInput
          label="Valor inicial (R$)"
          value={fields.initial}
          onChangeText={(text) => handleChange('initial', text)}
          placeholder="Ex: 5.000,00"
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
          placeholder="Ex: 300,00"
          onClear={() => handleChange('monthly', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />
        <CalculatorInput
          label="Prazo em meses"
          value={fields.months}
          onChangeText={(text) => handleChange('months', text)}
          placeholder="Ex: 60"
          onClear={() => handleChange('months', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />
        <CalculatorInput
          label="Valor bruto final (R$)"
          value={fields.final}
          onChangeText={(text) => handleChange('final', text)}
          placeholder="Ex: 80.000,00"
          helper="Opcional: deixe um campo vazio para resolvê-lo a partir do valor final."
          onClear={() => handleChange('final', '')}
          palette={palette}
          containerStyle={styles.inputGroup}
          labelStyle={styles.label}
          helperStyle={styles.helper}
        />

        {modality === 'selic' ? (
          <CalculatorInput
            label="Taxa Selic anual (%)"
            value={fields.selicRate}
            onChangeText={(text) => handleChange('selicRate', text)}
            placeholder="Ex: 10.75"
            helper={modalityHelper[modality]}
            onClear={() => handleChange('selicRate', '')}
            palette={palette}
            containerStyle={styles.inputGroup}
            labelStyle={styles.label}
            helperStyle={styles.helper}
          />
        ) : null}

        {modality === 'prefixado' ? (
          <CalculatorInput
            label="Taxa prefixada anual (%)"
            value={fields.prefixRate}
            onChangeText={(text) => handleChange('prefixRate', text)}
            placeholder="Ex: 9.50"
            helper={modalityHelper[modality]}
            onClear={() => handleChange('prefixRate', '')}
            palette={palette}
            containerStyle={styles.inputGroup}
            labelStyle={styles.label}
            helperStyle={styles.helper}
          />
        ) : null}

        {modality === 'ipca' ? (
          <>
            <CalculatorInput
              label="IPCA anual estimado (%)"
              value={fields.ipcaRate}
              onChangeText={(text) => handleChange('ipcaRate', text)}
              placeholder="Ex: 4.00"
              helper="Use a projeção de inflação para o período."
              onClear={() => handleChange('ipcaRate', '')}
              palette={palette}
              containerStyle={styles.inputGroup}
              labelStyle={styles.label}
              helperStyle={styles.helper}
            />
            <CalculatorInput
              label="Taxa adicional do IPCA (% a.a)"
              value={fields.realRate}
              onChangeText={(text) => handleChange('realRate', text)}
              placeholder="Ex: 5.00"
              helper={modalityHelper[modality]}
              onClear={() => handleChange('realRate', '')}
              palette={palette}
              containerStyle={styles.inputGroup}
              labelStyle={styles.label}
              helperStyle={styles.helper}
            />
          </>
        ) : null}

        {projectionDetails ? (
          <TesouroProjectionSummary
            palette={palette}
            details={projectionDetails}
            borderColor={palette.tint}
            cardStyle={[styles.summaryCard, { backgroundColor: summaryBackground }]}
            labelStyle={styles.summaryLabel}
            valueStyle={styles.summaryValue}
          />
        ) : null}

        {error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
        {info ? <ThemedText style={styles.info}>{info}</ThemedText> : null}

        {!projectionDetails ? (
          <ThemedView style={[styles.tipCard, { borderColor: palette.tint }]}>
            <IconSymbol name="info.circle" size={20} color={palette.tint} />
            <ThemedText style={[styles.tipText, { color: palette.text }]}>
              Preencha os valores ou informe o Valor Bruto Final e deixe um campo vazio para
              recalcular aportes ou prazo.
            </ThemedText>
          </ThemedView>
        ) : null}

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
