import * as FileSystem from 'expo-file-system/legacy';

const CDI_STORAGE_PATH =
  (FileSystem.documentDirectory ?? FileSystem.cacheDirectory)
    ? `${FileSystem.documentDirectory ?? FileSystem.cacheDirectory}cdi-rate.json`
    : null;

export async function readStoredCdiRate() {
  if (!CDI_STORAGE_PATH) {
    return null;
  }
  try {
    const info = await FileSystem.getInfoAsync(CDI_STORAGE_PATH);
    if (!info.exists) {
      return null;
    }
    const raw = await FileSystem.readAsStringAsync(CDI_STORAGE_PATH);
    const parsed = JSON.parse(raw);
    return typeof parsed.cdi === 'number' ? parsed.cdi : null;
  } catch {
    return null;
  }
}

export async function persistCdiRate(value: number) {
  if (!CDI_STORAGE_PATH) {
    return;
  }
  try {
    await FileSystem.writeAsStringAsync(
      CDI_STORAGE_PATH,
      JSON.stringify({ cdi: Number(value.toFixed(4)), updatedAt: Date.now() }),
    );
  } catch (error) {
    if (__DEV__) {
      console.warn('Failed to persist CDI rate', error);
    }
  }
}

export async function fetchLatestCdiRate() {
  const { startDate, endDate } = getMonthlyCdiDateRange();
  const params = new URLSearchParams({
    formato: 'json',
    dataInicial: formatDateForBcb(startDate),
    dataFinal: formatDateForBcb(endDate),
  });
  const response = await fetch(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.4391/dados?${params.toString()}`,
  );
  if (!response.ok) {
    throw new Error('Failed to fetch CDI rate');
  }
  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid CDI payload');
  }

  const monthlyRates = data
    .map((entry: { valor?: string }) => Number(String(entry?.valor ?? '').replace(',', '.')))
    .filter((value) => Number.isFinite(value));

  if (monthlyRates.length === 0) {
    throw new Error('Invalid CDI payload');
  }

  const accumulatedFactor = monthlyRates.reduce((acc: number, rate) => acc * (1 + rate / 100), 1);

  const accumulatedPercent = (accumulatedFactor - 1) * 100;
  if (!Number.isFinite(accumulatedPercent) || accumulatedPercent <= 0) {
    throw new Error('Invalid CDI accumulation');
  }

  return Number(accumulatedPercent.toFixed(2));
}

function getMonthlyCdiDateRange() {
  const now = new Date();
  const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
  const startDate = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), 1));
  startDate.setUTCMonth(startDate.getUTCMonth() - 11);
  return { startDate, endDate };
}

function formatDateForBcb(date: Date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}
