import type { CalculatorInputs, CalculatorParsedInputs } from './types';

export type ProjectionInputs = CalculatorInputs;

export type ProjectionResult = {
  net: number;
  gross: number;
  contributions: number;
  earnings: number;
  monthlyRate: number;
  taxRate: number;
  taxAmount: number;
};

export type CalculableField = 'initial' | 'monthly' | 'months' | 'cdi' | 'percent';

export function calculateProjection(inputs: ProjectionInputs): ProjectionResult {
  const { initial, monthly, months, cdi, percent } = inputs;
  const annualRate = (cdi / 100) * (percent / 100);
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  const growthFactor = Math.pow(1 + monthlyRate, months);
  const annuityFactor = monthlyRate === 0 ? months : (growthFactor - 1) / monthlyRate;

  const futurePrincipal = initial * growthFactor;
  const futureContributions = monthly * annuityFactor;
  const gross = futurePrincipal + futureContributions;
  const contributions = initial + monthly * months;
  const earnings = gross - contributions;
  const taxRate = getIncomeTaxRate(months);
  const taxAmount = earnings * taxRate;
  const net = gross - taxAmount;

  return { net, gross, contributions, earnings, monthlyRate, taxRate, taxAmount };
}

export function getIncomeTaxRate(months: number) {
  if (months <= 6) {
    return 0.225;
  }
  if (months <= 12) {
    return 0.2;
  }
  if (months <= 24) {
    return 0.175;
  }
  return 0.15;
}

export function solveForMissingField(field: CalculableField, inputs: CalculatorParsedInputs) {
  switch (field) {
    case 'initial':
      return solveInitial(inputs);
    case 'monthly':
      return solveMonthly(inputs);
    case 'months':
      return solveByBisection(
        (months) => {
          const gross = calculateProjection({
            ...(inputs as ProjectionInputs),
            months: Math.max(1, months),
          }).gross;
          return gross - (inputs.final ?? 0);
        },
        1,
        600,
        true,
      );
    case 'cdi':
      return solveByBisection(
        (cdi) => {
          const gross = calculateProjection({
            ...(inputs as ProjectionInputs),
            cdi,
          }).gross;
          return gross - (inputs.final ?? 0);
        },
        0.1,
        40,
      );
    case 'percent':
      return solveByBisection(
        (percent) => {
          const gross = calculateProjection({
            ...(inputs as ProjectionInputs),
            percent,
          }).gross;
          return gross - (inputs.final ?? 0);
        },
        10,
        500,
      );
    default:
      return null;
  }
}

export function computeMonthlyRate(cdi: number, percent: number) {
  const annualRate = (cdi / 100) * (percent / 100);
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

function solveInitial(inputs: CalculatorParsedInputs) {
  const { monthly = 0, months = 0, cdi = 0, percent = 0, final = 0 } = inputs;
  const monthlyRate = computeMonthlyRate(cdi, percent);
  const growthFactor = Math.pow(1 + monthlyRate, months);
  const annuityFactor = monthlyRate === 0 ? months : (growthFactor - 1) / monthlyRate;

  if (growthFactor === 0) {
    return null;
  }

  return (final - monthly * annuityFactor) / growthFactor;
}

function solveMonthly(inputs: CalculatorParsedInputs) {
  const { initial = 0, months = 0, cdi = 0, percent = 0, final = 0 } = inputs;
  const monthlyRate = computeMonthlyRate(cdi, percent);
  const growthFactor = Math.pow(1 + monthlyRate, months);
  const annuityFactor = monthlyRate === 0 ? months : (growthFactor - 1) / monthlyRate;

  if (annuityFactor === 0) {
    return null;
  }

  return (final - initial * growthFactor) / annuityFactor;
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
