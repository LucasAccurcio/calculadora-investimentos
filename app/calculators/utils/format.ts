const currencyFormatter =
  typeof Intl !== 'undefined'
    ? new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      })
    : null;

export function formatCurrencyFromNumber(value: number) {
  if (!currencyFormatter) {
    return `R$ ${value.toFixed(2)}`;
  }
  return currencyFormatter.format(value);
}

export function formatCurrencyInput(value: string) {
  const digits = extractCurrencyDigits(value);
  if (!digits) {
    return '';
  }
  const amount = Number(digits) / 100;
  if (!Number.isFinite(amount)) {
    return '';
  }
  return formatCurrencyFromNumber(amount);
}

export function normalizeNumericString(value: string) {
  const cleaned = value.replace(/[R$\s\u00A0]/gi, '').replace(/[^0-9.,-]/g, '');
  const hasComma = cleaned.includes(',');
  const hasDot = cleaned.includes('.');
  if (hasComma && hasDot) {
    return cleaned.replace(/\./g, '').replace(',', '.');
  }
  if (hasComma) {
    return cleaned.replace(',', '.');
  }
  if (hasDot) {
    return cleaned.replace(',', '.');
  }
  return cleaned;
}

export function parseCurrency(value: string) {
  const digits = extractCurrencyDigits(value);
  if (!digits) {
    return null;
  }
  const amount = Number(digits) / 100;
  return Number.isFinite(amount) ? amount : null;
}

export function extractCurrencyDigits(value: string) {
  if (!value) {
    return '';
  }
  return value.replace(/[^0-9]/g, '');
}

export function formatDecimal(value: number, fractionDigits = 2) {
  return value.toFixed(fractionDigits);
}

export function formatPercent(value: number) {
  const formatted = value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
  return `${formatted.replace('.', ',')}%`;
}
