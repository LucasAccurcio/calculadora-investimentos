/**
 * Comparison Screen / Feature
 * Allows users to compare CDB, LCI/LCA, and Tesouro side-by-side
 * with the same input parameters
 *
 * This is a future feature to be integrated into the app navigation
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, Platform, Pressable } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { CalculatorInput } from '@/features/calculators/components/calculator-input';
import { ComparisonChart } from '@/features/calculators/components/comparison-chart';
import { PresetChips, type PresetOption } from '@/features/calculators/components/preset-chips';
import {
  calculateLciLcaProjection,
  calculateProjection,
  calculateTesouroProjection,
  formatCurrencyInput,
  formatDecimal,
  readStoredCdiRate,
  type LciLcaProjectionResult,
  type ProjectionInputs,
  type ProjectionResult,
  type TesouroProjectionInputs,
  type TesouroProjectionResult,
} from '@/features/calculators/utils';
import { ProGate } from '@/features/subscription';
import { useColorScheme } from '@/hooks/use-color-scheme';

const MONTHS_PRESETS: PresetOption[] = [
  { label: '1 ano', value: '12' },
  { label: '2 anos', value: '24' },
  { label: '5 anos', value: '60' },
  { label: '10 anos', value: '120' },
];

interface ComparisonState {
  initial: string;
  monthly: string;
  months: string;
  cdiRate: string;
  error: string | null;
}

const INITIAL_STATE: ComparisonState = {
  initial: '10000',
  monthly: '500',
  months: '12',
  cdiRate: '13.65',
  error: null,
};

export function ComparisonCalculator() {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];
  const scrollViewRef = useRef<KeyboardAwareScrollView>(null);

  const [fields, setFields] = useState<ComparisonState>(INITIAL_STATE);
  const [cdbResult, setCdbResult] = useState<ProjectionResult | null>(null);
  const [lciResult, setLciResult] = useState<LciLcaProjectionResult | null>(null);
  const [tesouroResult, setTesouroResult] = useState<TesouroProjectionResult | null>(null);
  const [storedCdiRate, setStoredCdiRate] = useState<number | null>(null);

  // Load CDI rate on mount
  useEffect(() => {
    const loadCdi = async () => {
      try {
        const cached = await readStoredCdiRate();
        if (cached) {
          setStoredCdiRate(cached);
          setFields((prev) => (prev.cdiRate ? prev : { ...prev, cdiRate: formatDecimal(cached) }));
        }
      } catch (err) {
        console.warn('Failed to load CDI:', err);
      }
    };
    loadCdi();
  }, []);

  const handleFieldChange = useCallback((field: keyof ComparisonState, value: string) => {
    let formatted = value;

    if (field === 'initial' || field === 'monthly') {
      formatted = formatCurrencyInput(value);
    } else if (field === 'cdiRate') {
      formatted = formatDecimal(parseFloat(value) || 0);
    }

    setFields((prev) => ({
      ...prev,
      [field]: formatted,
      error: null,
    }));
  }, []);

  const handleCalculate = useCallback(async () => {
    Keyboard.dismiss();
    setFields((prev) => ({ ...prev, error: null }));

    // Validate all fields
    const cdi = parseFloat(fields.cdiRate || '0') / 100;
    const initial = parseFloat(fields.initial.replace(/\D/g, '')) || 0;
    const monthly = parseFloat(fields.monthly.replace(/\D/g, '')) || 0;
    const months = parseInt(fields.months, 10) || 0;

    if (initial <= 0 || months <= 0) {
      setFields((prev) => ({
        ...prev,
        error: 'Informe valores válidos para capital inicial e período',
      }));
      return;
    }

    try {
      // Calculate CDB
      const projectionInputs: ProjectionInputs = {
        initial,
        monthly,
        months,
        cdi,
        percent: 1.0, // 100% of CDI
      };

      const cdb = calculateProjection(projectionInputs);
      setCdbResult(cdb);

      // Calculate LCI/LCA
      const lci = calculateLciLcaProjection(projectionInputs);
      setLciResult(lci);

      // Calculate Tesouro (simplified - would need modality selection in real app)
      const tesouroInputs: TesouroProjectionInputs = {
        initial,
        monthly,
        months,
        modality: 'selic',
        selicRate: cdi * 100, // Tesouro uses percentage
      };
      const tesouro = calculateTesouroProjection(tesouroInputs);
      setTesouroResult(tesouro);

      // Scroll to results
      setTimeout(() => {
        scrollViewRef.current?.scrollToPosition(0, 600, true);
      }, 300);
    } catch (err) {
      setFields((prev) => ({
        ...prev,
        error: 'Erro ao calcular. Revise os dados e tente novamente.',
      }));
    }
  }, [fields]);

  const extraScrollHeight = Platform.select({ ios: 32, android: 64, default: 48 }) ?? 48;

  return (
    <KeyboardAwareScrollView
      ref={scrollViewRef}
      contentContainerStyle={{ paddingBottom: 40 }}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={extraScrollHeight}>
      <ThemedView style={{ paddingHorizontal: 16, paddingVertical: 20, gap: 16 }}>
        <ThemedText style={{ fontSize: 24, fontWeight: '700' }}>Comparar Investimentos</ThemedText>

        {/* Input Section */}
        <ThemedView style={{ gap: 12, borderRadius: 12, padding: 12 }}>
          <CalculatorInput
            label="Capital Inicial"
            placeholder="Ex: 10000"
            keyboardType="decimal-pad"
            value={fields.initial}
            onChangeText={(v) => handleFieldChange('initial', v)}
            palette={palette}
          />

          <CalculatorInput
            label="Aporte Mensal"
            placeholder="Ex: 500"
            keyboardType="decimal-pad"
            value={fields.monthly}
            onChangeText={(v) => handleFieldChange('monthly', v)}
            palette={palette}
          />

          <CalculatorInput
            label="Período (meses)"
            placeholder="Ex: 12"
            keyboardType="number-pad"
            value={fields.months}
            onChangeText={(v) => handleFieldChange('months', v)}
            palette={palette}
          />

          <ThemedView style={{ marginVertical: 8 }}>
            <PresetChips
              options={MONTHS_PRESETS}
              selectedValue={fields.months}
              onSelect={(value) => handleFieldChange('months', value)}
              palette={palette}
            />
          </ThemedView>

          <CalculatorInput
            label="Taxa CDI Atual (%)"
            placeholder="Ex: 13.65"
            keyboardType="decimal-pad"
            value={fields.cdiRate}
            onChangeText={(v) => handleFieldChange('cdiRate', v)}
            palette={palette}
          />

          {fields.error && (
            <ThemedText style={{ color: '#FF1744', fontSize: 13, marginVertical: 8 }}>
              ⚠️ {fields.error}
            </ThemedText>
          )}

          <Pressable
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: palette.tint,
              borderRadius: 8,
              marginTop: 8,
            }}
            onPress={handleCalculate}>
            <ThemedText style={{ color: '#fff', fontWeight: '600', textAlign: 'center' }}>
              Comparar
            </ThemedText>
          </Pressable>
        </ThemedView>

        {/* Results */}
        {cdbResult && lciResult && tesouroResult && (
          <ProGate>
            <ComparisonChart
              cdb={{
                name: 'CDB',
                gross: cdbResult.gross,
                net: cdbResult.net,
                initialValue: cdbResult.contributions,
              }}
              lciLca={{
                name: 'LCI/LCA',
                gross: lciResult.gross,
                net: lciResult.net,
                initialValue: lciResult.contributions,
              }}
              tesouro={{
                name: 'Tesouro Direto',
                gross: tesouroResult.gross,
                net: tesouroResult.net,
                initialValue: tesouroResult.contributions,
              }}
            />
          </ProGate>
        )}
      </ThemedView>
    </KeyboardAwareScrollView>
  );
}
