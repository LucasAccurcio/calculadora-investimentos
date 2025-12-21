/**
 * ComparisonChart Component
 * Compares investment returns across CDB, LCI/LCA, and Tesouro Direto
 * Displays gross, net, and gain for each product
 *
 * Future: Will be gated with <ProGate> in production
 */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface ComparisonProduct {
  name: string;
  gross: number;
  net: number;
  initialValue: number;
}

interface ComparisonChartProps {
  cdb: ComparisonProduct;
  lciLca: ComparisonProduct;
  tesouro: ComparisonProduct;
  title?: string;
}

export function ComparisonChart({
  cdb,
  lciLca,
  tesouro,
  title = 'Comparativo de Investimentos',
}: ComparisonChartProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  // Prepare comparison data
  const products = useMemo(() => {
    return [
      { ...cdb, color: '#007AFF', label: 'CDB' },
      { ...lciLca, color: '#00C853', label: 'LCI/LCA' },
      { ...tesouro, color: '#FF9100', label: 'Tesouro' },
    ];
  }, [cdb, lciLca, tesouro]);

  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Calculate gains and percentages
  const productStats = useMemo(() => {
    return products.map((p) => ({
      ...p,
      gain: p.gross - p.initialValue,
      gainPercent: ((p.gross - p.initialValue) / p.initialValue) * 100,
      gainNet: p.net - p.initialValue,
      gainPercentNet: ((p.net - p.initialValue) / p.initialValue) * 100,
    }));
  }, [products]);

  // Find best performer
  const bestNet = Math.max(...productStats.map((p) => p.net));
  const bestProduct = productStats.find((p) => p.net === bestNet);

  // Calculate max value for bar sizing
  const maxValue = Math.max(...productStats.map((p) => p.net));
  const scaleUnit = maxValue > 0 ? 100 / maxValue : 1;

  return (
    <ThemedView style={styles.container}>
      {/* Title */}
      <ThemedText style={styles.title}>{title}</ThemedText>

      {/* Comparison Table */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tableContainer}>
          {/* Header Row */}
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { width: 100 }]}>Produto</Text>
            <Text style={[styles.tableHeader, { width: 120 }]}>Valor Final</Text>
            <Text style={[styles.tableHeader, { width: 120 }]}>Líquido</Text>
            <Text style={[styles.tableHeader, { width: 100 }]}>Ganho</Text>
            <Text style={[styles.tableHeader, { width: 100 }]}>Rentabilidade</Text>
          </View>

          {/* Data Rows */}
          {productStats.map((product) => (
            <View key={product.label} style={styles.tableRow}>
              <View style={[styles.productName, { width: 100 }]}>
                <View style={[styles.productDot, { backgroundColor: product.color }]} />
                <Text style={styles.productLabel}>{product.label}</Text>
                {bestProduct?.label === product.label && <Text style={styles.bestBadge}>★</Text>}
              </View>
              <Text style={[styles.tableCell, { width: 120 }]}>
                {formatCurrency(product.gross)}
              </Text>
              <Text style={[styles.tableCell, { width: 120 }]}>{formatCurrency(product.net)}</Text>
              <Text
                style={[
                  styles.tableCell,
                  {
                    width: 100,
                    color: product.gain >= 0 ? '#00C853' : '#FF1744',
                  },
                ]}>
                {formatCurrency(product.gain)}
              </Text>
              <Text
                style={[
                  styles.tableCell,
                  {
                    width: 100,
                    color: product.gainPercent >= 0 ? '#00C853' : '#FF1744',
                  },
                ]}>
                {product.gainPercent.toFixed(2)}%
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bar Chart Comparison (Visual) */}
      <View style={styles.barChartContainer}>
        <ThemedText style={styles.barChartTitle}>Evolução do Valor Líquido</ThemedText>

        {productStats.map((product) => {
          const barWidth = (product.net * scaleUnit) / 100;
          return (
            <View key={`bar-${product.label}`} style={styles.barRow}>
              <Text style={styles.barLabel}>{product.label}</Text>
              <View style={styles.barWrapper}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${Math.min(100, barWidth * 100)}%`,
                      backgroundColor: product.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.barValue}>{formatCurrency(product.net)}</Text>
            </View>
          );
        })}
      </View>

      {/* Summary */}
      {bestProduct && (
        <View style={[styles.summary, { borderLeftColor: bestProduct.color }]}>
          <ThemedText style={styles.summaryLabel}>Melhor Opção</ThemedText>
          <View style={styles.summaryContent}>
            <Text style={[styles.summaryProductName, { color: bestProduct.color }]}>
              {bestProduct.label}
            </Text>
            <Text style={styles.summaryStat}>
              {formatCurrency(bestProduct.net)} ({bestProduct.gainPercentNet.toFixed(2)}%)
            </Text>
          </View>
        </View>
      )}
    </ThemedView>
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

  // Table Styles
  tableContainer: {
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tableHeader: {
    fontWeight: '600',
    fontSize: 12,
    marginRight: 16,
  },
  tableCell: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 16,
  },

  // Product Name Cell
  productName: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  productDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  productLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  bestBadge: {
    fontSize: 14,
    color: '#FFD700',
  },

  // Bar Chart Styles
  barChartContainer: {
    paddingTop: 12,
    gap: 12,
  },
  barChartTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  barLabel: {
    width: 60,
    fontSize: 12,
    fontWeight: '500',
  },
  barWrapper: {
    flex: 1,
    height: 28,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  barValue: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 100,
    textAlign: 'right',
  },

  // Summary Styles
  summary: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.7,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  summaryProductName: {
    fontSize: 16,
    fontWeight: '700',
  },
  summaryStat: {
    fontSize: 13,
    fontWeight: '600',
  },
});
