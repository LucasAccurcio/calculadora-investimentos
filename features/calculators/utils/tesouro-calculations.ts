import type { ProjectionResult } from './cdb-calculations';
import { getIncomeTaxRate } from './cdb-calculations';

export type TesouroModality = 'selic' | 'prefixado' | 'ipca';

export type TesouroRateInputs = {
  modality: TesouroModality;
  selicRate?: number;
  prefixRate?: number;
  ipcaRate?: number;
  realRate?: number;
};

export type TesouroProjectionInputs = TesouroRateInputs & {
  initial: number;
  monthly: number;
  months: number;
};

export type TesouroProjectionResult = ProjectionResult & {
  modality: TesouroModality;
  annualRate: number;
};

export type TesouroSolverInputs = TesouroRateInputs & {
  final: number;
  initial?: number;
  monthly?: number;
  months?: number;
};

export type TesouroSolvableField = 'initial' | 'monthly' | 'months';

export function calculateTesouroProjection(
  inputs: TesouroProjectionInputs,
): TesouroProjectionResult {
  const monthlyRate = computeMonthlyRate(inputs);
  const annualRate = Math.pow(1 + monthlyRate, 12) - 1;
  const growthFactor = Math.pow(1 + monthlyRate, inputs.months);
  const annuityFactor = monthlyRate === 0 ? inputs.months : (growthFactor - 1) / monthlyRate;

  const futurePrincipal = inputs.initial * growthFactor;
  const futureContributions = inputs.monthly * annuityFactor;
  const gross = futurePrincipal + futureContributions;
  const contributions = inputs.initial + inputs.monthly * inputs.months;
  const earnings = gross - contributions;
  const taxRate = getIncomeTaxRate(inputs.months);
  const taxAmount = earnings * taxRate;
  const net = gross - taxAmount;

  return {
    modality: inputs.modality,
    net,
    gross,
    contributions,
    earnings,
    monthlyRate,
    taxRate,
    taxAmount,
    annualRate,
  };
}

export function solveTesouroMissingField(field: TesouroSolvableField, inputs: TesouroSolverInputs) {
  const monthlyRate = computeMonthlyRate(inputs);
  if (!Number.isFinite(monthlyRate) || monthlyRate <= -1) {
    return null;
  }

  switch (field) {
    case 'initial':
      return solveInitialTarget({
        final: inputs.final,
        monthly: inputs.monthly ?? 0,
        months: Math.max(1, Math.round(inputs.months ?? 0)),
        monthlyRate,
      });
    case 'monthly':
      return solveMonthlyTarget({
        final: inputs.final,
        initial: inputs.initial ?? 0,
        months: Math.max(1, Math.round(inputs.months ?? 0)),
        monthlyRate,
      });
    case 'months':
      return solveMonthsTarget({
        final: inputs.final,
        initial: inputs.initial ?? 0,
        monthly: inputs.monthly ?? 0,
        monthlyRate,
      });
    default:
      return null;
  }
}

function computeMonthlyRate(inputs: TesouroRateInputs) {
  switch (inputs.modality) {
    case 'selic': {
      const annual = Math.max(0, (inputs.selicRate ?? 0) / 100);
      return convertAnnualToMonthly(annual);
    }
    case 'prefixado': {
      const annual = Math.max(0, (inputs.prefixRate ?? 0) / 100);
      return convertAnnualToMonthly(annual);
    }
    case 'ipca': {
      const inflation = Math.max(0, (inputs.ipcaRate ?? 0) / 100);
      const realRate = Math.max(0, (inputs.realRate ?? 0) / 100);
      const combinedAnnual = (1 + inflation) * (1 + realRate) - 1;
      return convertAnnualToMonthly(combinedAnnual);
    }
    default:
      return 0;
  }
}

function convertAnnualToMonthly(annualRate: number) {
  if (annualRate <= -1) {
    return -1;
  }
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

function computeGrossValue(initial: number, monthly: number, months: number, monthlyRate: number) {
  const growthFactor = Math.pow(1 + monthlyRate, months);
  const annuityFactor = monthlyRate === 0 ? months : (growthFactor - 1) / monthlyRate;
  const futurePrincipal = initial * growthFactor;
  const futureContributions = monthly * annuityFactor;
  return futurePrincipal + futureContributions;
}

function solveInitialTarget({
  final,
  monthly,
  months,
  monthlyRate,
}: {
  final: number;
  monthly: number;
  months: number;
  monthlyRate: number;
}) {
  const growthFactor = Math.pow(1 + monthlyRate, months);
  const annuityFactor = monthlyRate === 0 ? months : (growthFactor - 1) / monthlyRate;
  if (growthFactor === 0) {
    return null;
  }
  return (final - monthly * annuityFactor) / growthFactor;
}

function solveMonthlyTarget({
  final,
  initial,
  months,
  monthlyRate,
}: {
  final: number;
  initial: number;
  months: number;
  monthlyRate: number;
}) {
  const growthFactor = Math.pow(1 + monthlyRate, months);
  const annuityFactor = monthlyRate === 0 ? months : (growthFactor - 1) / monthlyRate;
  if (annuityFactor === 0) {
    return null;
  }
  return (final - initial * growthFactor) / annuityFactor;
}

function solveMonthsTarget({
  final,
  initial,
  monthly,
  monthlyRate,
}: {
  final: number;
  initial: number;
  monthly: number;
  monthlyRate: number;
}) {
  return solveByBisection(
    (months) => computeGrossValue(initial, monthly, Math.max(1, months), monthlyRate) - final,
    1,
    600,
    true,
  );
}

function solveByBisection(
  fn: (value: number) => number,
  start: number,
  end: number,
  roundResult = false,
) {
  let low = start;
  let high = end;
  let fLow = fn(low);
  let fHigh = fn(high);

  let attempts = 0;
  while (fLow * fHigh > 0 && attempts < 5) {
    low = Math.max(0.001, low * 0.5);
    high = high * 1.5 + 1;
    fLow = fn(low);
    fHigh = fn(high);
    attempts += 1;
  }

  if (fLow * fHigh > 0) {
    return null;
  }

  for (let i = 0; i < 80; i += 1) {
    const mid = (low + high) / 2;
    const fMid = fn(mid);
    if (Math.abs(fMid) < 0.01) {
      return roundResult ? Math.round(mid) : mid;
    }
    if (fLow * fMid < 0) {
      high = mid;
      fHigh = fMid;
    } else {
      low = mid;
      fLow = fMid;
    }
  }

  const result = (low + high) / 2;
  return roundResult ? Math.round(result) : result;
}
