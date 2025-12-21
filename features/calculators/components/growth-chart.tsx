/**
 * GrowthChart Component
 * Displays the evolution of an investment over time with dual lines (gross vs net)
 * Uses Victory Native for charting
 *
 * Future: Will be gated with <ProGate> in production
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ChartDataPoint {
  month: number; // Month 0, 1, 2, ..., N
  gross: number; // Gross value accumulated
  net: number; // Net value after tax
  monthLabel?: string; // "Mês 1", "Mês 6", etc
}

interface GrowthChartProps {
  data: ChartDataPoint[];
  title: string;
  showNet?: boolean; // Show net after tax line
  currency?: string; // "BRL"
}

export function GrowthChart({ data, title, showNet = true, currency = 'BRL' }: GrowthChartProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  // Prepare data for display
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sample data to keep chart readable (max 20 points)
    const maxPoints = 20;
    if (data.length <= maxPoints) {
      return data;
    }

    const interval = Math.ceil(data.length / maxPoints);
    const sampled: ChartDataPoint[] = [];

    for (let i = 0; i < data.length; i += interval) {
      sampled.push(data[i]);
    }

    // Always include last point
    if (sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1]);
    }

    return sampled;
  }, [data]);

  // Calculate stats
  const stats = useMemo(() => {
    if (!chartData || chartData.length === 0) {
      return { minGross: 0, maxGross: 0, minNet: 0, maxNet: 0 };
    }

    const grossValues = chartData.map((p) => p.gross);
    const netValues = chartData.map((p) => p.net);

    return {
      minGross: Math.min(...grossValues),
      maxGross: Math.max(...grossValues),
      minNet: Math.min(...netValues),
      maxNet: Math.max(...netValues),
    };
  }, [chartData]);

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate final values
  const finalGross = chartData.length > 0 ? chartData[chartData.length - 1].gross : 0;
  const finalNet = chartData.length > 0 ? chartData[chartData.length - 1].net : 0;
  const gain = finalGross - (chartData[0]?.gross || 0);

  return (
    <ThemedView style={styles.container}>
      {/* Title */}
      <ThemedText style={styles.title}>{title}</ThemedText>

      {/* Chart Container - Placeholder for Victory Native */}
      <View
        style={[
          styles.chartPlaceholder,
          {
            backgroundColor: palette.background,
            borderColor: palette.tint,
          },
        ]}>
        {/* Simple Text Representation (temporary) */}
        <Text style={[styles.placeholderText, { color: palette.text }]}>
          📊 Gráfico de Evolução
        </Text>
        <Text style={[styles.placeholderSubtext, { color: palette.text + '99' }]}>
          {chartData.length > 0 ? `${chartData.length} pontos de dados` : 'Sem dados'}
        </Text>
      </View>

      {/* Stats Footer */}
      {chartData.length > 0 && (
        <View style={styles.statsContainer}>
          <StatItem
            label="Valor Final (Bruto)"
            value={formatCurrency(finalGross)}
            color={palette.tint}
          />
          {showNet && (
            <StatItem
              label="Valor Final (Líquido)"
              value={formatCurrency(finalNet)}
              color="#00C853"
            />
          )}
          <StatItem
            label="Ganho Total"
            value={formatCurrency(gain)}
            color={gain >= 0 ? '#00C853' : '#FF1744'}
          />
        </View>
      )}
    </ThemedView>
  );
}

interface StatItemProps {
  label: string;
  value: string;
  color: string;
}

function StatItem({ label, value, color }: StatItemProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <View style={styles.statItem}>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  chartPlaceholder: {
    height: 280,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  placeholderText: {
    fontSize: 28,
    marginBottom: 8,
  },
  placeholderSubtext: {
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'rgba(100, 100, 100, 0.05)',
    borderRadius: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
});
