/**
 * Series Generation Utilities
 * Functions to generate chart data from calculator projection results
 * Used by GrowthChart and ComparisonChart components
 */

import type { ChartDataPoint } from '@/features/calculators/components/growth-chart';
import {
  type CalculatorInputs,
  type LciLcaProjectionResult,
  type ProjectionInputs,
  type ProjectionResult,
  type TesouroProjectionInputs,
  type TesouroProjectionResult,
  calculateLciLcaProjection,
  calculateProjection,
  calculateTesouroProjection,
} from './index';

/**
 * Build data series for CDB growth chart
 * Samples data points to maintain chart performance
 */
export function buildCdbSeries(
  projection: ProjectionResult,
  inputs: ProjectionInputs,
): ChartDataPoint[] {
  if (!projection || !inputs) return [];

  const series: ChartDataPoint[] = [];

  // Sample interval: keep max 30 points for smooth rendering
  const maxPoints = 30;
  const totalMonths = inputs.months;
  const interval = Math.max(1, Math.ceil(totalMonths / maxPoints));

  // Calculate projection for each sample month
  for (let month = 0; month <= totalMonths; month += interval) {
    // Recalculate projection for intermediate month
    const intermediate = calculateProjection({
      ...inputs,
      months: month,
    });

    series.push({
      month,
      gross: intermediate.gross,
      net: intermediate.net,
      monthLabel: formatMonthLabel(month),
    });
  }

  // Always include final point if not already included
  if (series.length === 0 || series[series.length - 1].month !== totalMonths) {
    series.push({
      month: totalMonths,
      gross: projection.gross,
      net: projection.net,
      monthLabel: formatMonthLabel(totalMonths),
    });
  }

  return series;
}

/**
 * Build data series for LCI/LCA growth chart
 */
export function buildLciLcaSeries(
  projection: LciLcaProjectionResult,
  inputs: CalculatorInputs,
): ChartDataPoint[] {
  if (!projection || !inputs) return [];

  const series: ChartDataPoint[] = [];

  const maxPoints = 30;
  const totalMonths = inputs.months;
  const interval = Math.max(1, Math.ceil(totalMonths / maxPoints));

  // For LCI/LCA, recalculate projections at intervals
  for (let month = 0; month <= totalMonths; month += interval) {
    const intermediate = calculateLciLcaProjection({
      ...inputs,
      months: month,
    });

    series.push({
      month,
      gross: intermediate.gross,
      net: intermediate.net,
      monthLabel: formatMonthLabel(month),
    });
  }

  // Always include final point
  if (series.length === 0 || series[series.length - 1].month !== totalMonths) {
    series.push({
      month: totalMonths,
      gross: projection.gross,
      net: projection.net,
      monthLabel: formatMonthLabel(totalMonths),
    });
  }

  return series;
}

/**
 * Build data series for Tesouro Direto growth chart
 */
export function buildTesouroSeries(
  projection: TesouroProjectionResult,
  inputs: TesouroProjectionInputs,
): ChartDataPoint[] {
  if (!projection || !inputs) return [];

  const series: ChartDataPoint[] = [];

  const maxPoints = 30;
  const totalMonths = inputs.months;
  const interval = Math.max(1, Math.ceil(totalMonths / maxPoints));

  // For Tesouro, recalculate at intervals
  for (let month = 0; month <= totalMonths; month += interval) {
    const intermediate = calculateTesouroProjection({
      ...inputs,
      months: month,
    });

    series.push({
      month,
      gross: intermediate.gross,
      net: intermediate.net,
      monthLabel: formatMonthLabel(month),
    });
  }

  // Always include final point
  if (series.length === 0 || series[series.length - 1].month !== totalMonths) {
    series.push({
      month: totalMonths,
      gross: projection.gross,
      net: projection.net,
      monthLabel: formatMonthLabel(totalMonths),
    });
  }

  return series;
}

/**
 * Compare scenarios across all three products
 * Takes projections from CDB, LCI/LCA, and Tesouro
 * Returns normalized comparison data
 */
export function compareScenarios(
  cdbProjection: ProjectionResult,
  cdbInputs: ProjectionInputs,
  lciProjection: LciLcaProjectionResult,
  lciInputs: CalculatorInputs,
  tesouroProjection: TesouroProjectionResult,
  tesouroInputs: TesouroProjectionInputs,
) {
  return {
    cdb: {
      name: 'CDB',
      gross: cdbProjection.gross,
      net: cdbProjection.net,
      initialValue: cdbInputs.initial,
      gain: cdbProjection.gross - cdbInputs.initial,
      gainPercent: ((cdbProjection.gross - cdbInputs.initial) / cdbInputs.initial) * 100,
    },
    lciLca: {
      name: 'LCI/LCA',
      gross: lciProjection.gross,
      net: lciProjection.net,
      initialValue: lciInputs.initial,
      gain: lciProjection.gross - lciInputs.initial,
      gainPercent: ((lciProjection.gross - lciInputs.initial) / lciInputs.initial) * 100,
    },
    tesouro: {
      name: 'Tesouro Direto',
      gross: tesouroProjection.gross,
      net: tesouroProjection.net,
      initialValue: tesouroInputs.initial,
      gain: tesouroProjection.gross - tesouroInputs.initial,
      gainPercent:
        ((tesouroProjection.gross - tesouroInputs.initial) / tesouroInputs.initial) * 100,
    },
  };
}

/**
 * Format month label for display
 * Examples: "Mês 0", "Mês 12", "1 ano", "2 anos"
 */
function formatMonthLabel(month: number): string {
  if (month === 0) return 'Início';
  if (month < 12) return `Mês ${month}`;

  const years = month / 12;
  if (Number.isInteger(years)) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }

  return `Mês ${month}`;
}

/**
 * Calculate growth rate statistics from series
 */
export function calculateSeriesStats(series: ChartDataPoint[]) {
  if (!series || series.length === 0) {
    return {
      minValue: 0,
      maxValue: 0,
      finalValue: 0,
      totalGain: 0,
      averageMonthlyGain: 0,
    };
  }

  const values = series.map((p) => p.net);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const finalValue = series[series.length - 1].net;
  const initialValue = series[0].net;
  const totalGain = finalValue - initialValue;
  const months = series.length;
  const averageMonthlyGain = months > 1 ? totalGain / (months - 1) : 0;

  return {
    minValue,
    maxValue,
    finalValue,
    totalGain,
    averageMonthlyGain,
  };
}

/**
 * Aggregate multiple series for overlay comparison
 * Used when comparing multiple strategies on same chart
 */
export function aggregateSeries(
  seriesMap: Record<string, ChartDataPoint[]>,
): Record<string, ChartDataPoint[]> {
  // Find common month points across all series
  const allMonths = new Set<number>();

  Object.values(seriesMap).forEach((series) => {
    series.forEach((point) => {
      allMonths.add(point.month);
    });
  });

  // Sort months
  const sortedMonths = Array.from(allMonths).sort((a, b) => a - b);

  // Interpolate missing points for each series
  const aggregated: Record<string, ChartDataPoint[]> = {};

  Object.entries(seriesMap).forEach(([key, series]) => {
    const interpolated: ChartDataPoint[] = [];

    sortedMonths.forEach((month) => {
      const exact = series.find((p) => p.month === month);

      if (exact) {
        interpolated.push(exact);
      } else {
        // Simple linear interpolation
        const before = series.filter((p) => p.month < month).pop();
        const after = series.find((p) => p.month > month);

        if (before && after) {
          const ratio = (month - before.month) / (after.month - before.month);
          interpolated.push({
            month,
            gross: before.gross + (after.gross - before.gross) * ratio,
            net: before.net + (after.net - before.net) * ratio,
            monthLabel: formatMonthLabel(month),
          });
        } else if (before) {
          interpolated.push(before);
        } else if (after) {
          interpolated.push(after);
        }
      }
    });

    aggregated[key] = interpolated;
  });

  return aggregated;
}
