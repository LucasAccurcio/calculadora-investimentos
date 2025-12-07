import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { ProjectionSummary } from '@/features/calculators/cdb/projection-summary';
import { styles } from '@/features/calculators/cdb/style';
import { CalculatorInput } from '@/features/calculators/components/calculator-input';
import { PresetChips, type PresetOption } from '@/features/calculators/components/preset-chips';
import {
	type CalculableField,
	CalculatorFieldKey,
	type ProjectionInputs,
	type ProjectionResult,
	calculateProjection,
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
} from '@/features/calculators/utils';
import { type CDBShareData } from '@/features/shared/share';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useCallback, useEffect, useState } from 'react';
import { Platform, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

const INITIAL_FIELDS: Record<CalculatorFieldKey, string> = {
	initial: '',
	monthly: '',
	months: '',
	cdi: '',
	percent: '100',
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
	{ label: '100% CDI', value: '100' },
	{ label: '110% CDI', value: '110' },
	{ label: '120% CDI', value: '120' },
	{ label: '130% CDI', value: '130' },
];

const extraScrollHeight = Platform.select({ ios: 32, android: 64, default: 48 }) ?? 48;

export default function CdbCalculatorScreen() {
	const colorScheme = useColorScheme() ?? 'light';
	const palette = Colors[colorScheme];

	const [fields, setFields] = useState<Record<CalculatorFieldKey, string>>(INITIAL_FIELDS);
	const [error, setError] = useState<string | null>(null);
	const [info, setInfo] = useState<string | null>(null);
	const [isFetchingCdi, setIsFetchingCdi] = useState(true);
	const [storedCdiRate, setStoredCdiRate] = useState<number | null>(null);
	const [projectionDetails, setProjectionDetails] = useState<ProjectionResult | null>(null);
	const [shareData, setShareData] = useState<CDBShareData | null>(null);

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
			percent: '100',
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
			const result = calculateProjection(projectionInputs);
			setFields((prev) => ({ ...prev, final: formatCurrencyFromNumber(result.gross) }));
			setInfo('Valor bruto final calculado com base nas demais entradas.');
			setProjectionDetails(result);
			setShareData({
				productName: 'CDB',
				invested: projectionInputs.initial,
				monthlyContribution: projectionInputs.monthly,
				deadline: projectionInputs.months,
				grossResult: result.gross,
				netResult: result.net,
				cdiRate: projectionInputs.cdi,
				cdiPercent: projectionInputs.percent,
				taxRate: result.taxRate,
				taxAmount: result.taxAmount,
			});
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

		(values as Record<CalculatorFieldKey, number | undefined>)[missing] = solved;
		const projection = calculateProjection(values as ProjectionInputs);
		const formattedValue = formatFieldValue(missing, solved);
		setFields((prev) => ({ ...prev, [missing]: formattedValue }));
		setInfo('Campo calculado com sucesso.');
		setProjectionDetails(projection);
		setShareData({
			productName: 'CDB',
			invested: (values.initial as number) ?? 0,
			monthlyContribution: (values.monthly as number) ?? 0,
			deadline: (values.months as number) ?? 0,
			grossResult: projection.gross,
			netResult: projection.net,
			cdiRate: (values.cdi as number) ?? 0,
			cdiPercent: (values.percent as number) ?? 0,
			taxRate: projection.taxRate,
			taxAmount: projection.taxAmount,
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
					placeholder="Ex: 110"
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
						borderColor={palette.tint}
						cardStyle={styles.summaryCard}
						labelStyle={styles.summaryLabel}
						valueStyle={styles.summaryValue}
						shareData={shareData ?? undefined}
					/>
				) : null}

				{error ? <ThemedText style={styles.error}>{error}</ThemedText> : null}
				{info ? <ThemedText style={styles.info}>{info}</ThemedText> : null}

				{!projectionDetails ? (
					<ThemedView style={[styles.tipCard, { borderColor: palette.tint }]}>
						<IconSymbol name="info.circle" size={20} color={palette.tint} />
						<ThemedText style={[styles.tipText, { color: palette.text }]}>
							Deixe um campo em branco para que possamos calculá-lo para você.
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
