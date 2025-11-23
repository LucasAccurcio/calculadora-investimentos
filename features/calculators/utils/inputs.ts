import {
  formatCurrencyFromNumber,
  formatDecimal,
  normalizeNumericString,
  parseCurrency,
} from './format';

import type { CalculatorFieldKey, CalculatorParsedInputs } from './types';

export const currencyFields = new Set<CalculatorFieldKey>(['initial', 'monthly', 'final']);

export function parseInputs(
  fields: Record<CalculatorFieldKey, string>,
  missingField: CalculatorFieldKey,
  fallbackCdi: number | null,
): { success: true; values: CalculatorParsedInputs } | { success: false; error: string } {
  const values: CalculatorParsedInputs = {};

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

export function formatFieldValue(field: CalculatorFieldKey, value: number) {
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
