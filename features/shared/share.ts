import { Share } from 'react-native';

export type ShareProductType = 'cdb' | 'lci-lca' | 'tesouro';

export type CDBShareData = {
  productName: string;
  invested: number;
  monthlyContribution: number;
  deadline: number;
  grossResult: number;
  netResult: number;
  cdiRate: number;
  cdiPercent: number;
  taxRate: number;
  taxAmount: number;
};

export type LCILCAShareData = {
  productName: string;
  invested: number;
  monthlyContribution: number;
  deadline: number;
  result: number;
  cdiRate: number;
  cdiPercent: number;
};

export type TesouroShareData = {
  productName: string;
  modality: 'selic' | 'prefixado' | 'ipca';
  invested: number;
  monthlyContribution: number;
  deadline: number;
  grossResult: number;
  netResult: number;
  rate?: number;
  taxRate: number;
  taxAmount: number;
};

export type ShareData = CDBShareData | LCILCAShareData | TesouroShareData;

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatCDBMessage(data: CDBShareData): string {
  const lines = [
    `Simulação – ${data.productName}`,
    '',
    '📊 Aportes:',
    `  Inicial: ${formatCurrency(data.invested)}`,
    data.monthlyContribution > 0
      ? `  Mensal: ${formatCurrency(data.monthlyContribution)} (${data.deadline}x)`
      : '',
    `  Total investido: ${formatCurrency(data.invested + data.monthlyContribution * data.deadline)}`,
    '',
    '💰 Rentabilidade:',
    `  Taxa CDI: ${data.cdiRate.toFixed(2)}% | ${data.cdiPercent.toFixed(0)}% do CDI`,
    `  Prazo: ${data.deadline} meses`,
    '',
    '💵 Resultado:',
    `  Valor bruto: ${formatCurrency(data.grossResult)}`,
    `  Alíquota de IR: ${(data.taxRate * 100).toFixed(1)}%`,
    `  Imposto de Renda: ${formatCurrency(data.taxAmount)}`,
    `  Valor líquido: ${formatCurrency(data.netResult)}`,
    '',
    '*Calculado com RendaFixa Pro*',
  ].filter((line) => line.length > 0);
  return lines.join('\n');
}

function formatLCILCAMessage(data: LCILCAShareData): string {
  const lines = [
    `Simulação – ${data.productName}`,
    '',
    '📊 Aportes:',
    `  Inicial: ${formatCurrency(data.invested)}`,
    data.monthlyContribution > 0
      ? `  Mensal: ${formatCurrency(data.monthlyContribution)} (${data.deadline}x)`
      : '',
    `  Total investido: ${formatCurrency(data.invested + data.monthlyContribution * data.deadline)}`,
    '',
    '💰 Rentabilidade:',
    `  Taxa CDI: ${data.cdiRate.toFixed(2)}% | ${data.cdiPercent.toFixed(0)}% do CDI`,
    `  Prazo: ${data.deadline} meses`,
    `  Status: Isento de Imposto de Renda (PF)`,
    '',
    '💵 Resultado:',
    `  Valor final: ${formatCurrency(data.result)}`,
    '',
    '*Calculado com RendaFixa Pro*',
  ].filter((line) => line.length > 0);
  return lines.join('\n');
}

function formatTesouroMessage(data: TesouroShareData): string {
  const modalityLabel = {
    selic: 'Tesouro Selic',
    prefixado: 'Tesouro Prefixado',
    ipca: 'Tesouro IPCA+',
  }[data.modality];

  const lines = [
    `Simulação – ${data.productName} (${modalityLabel})`,
    '',
    '📊 Aportes:',
    `  Inicial: ${formatCurrency(data.invested)}`,
    data.monthlyContribution > 0
      ? `  Mensal: ${formatCurrency(data.monthlyContribution)} (${data.deadline}x)`
      : '',
    `  Total investido: ${formatCurrency(data.invested + data.monthlyContribution * data.deadline)}`,
    '',
    '💰 Rentabilidade:',
    data.rate ? `  Taxa anual: ${data.rate.toFixed(2)}%` : '',
    `  Prazo: ${data.deadline} meses`,
    '',
    '💵 Resultado:',
    `  Valor bruto: ${formatCurrency(data.grossResult)}`,
    `  Alíquota de IR: ${(data.taxRate * 100).toFixed(1)}%`,
    `  Imposto de Renda: ${formatCurrency(data.taxAmount)}`,
    `  Valor líquido: ${formatCurrency(data.netResult)}`,
    '',
    '*Calculado com RendaFixa Pro*',
  ].filter((line) => line.length > 0);

  return lines.join('\n');
}

export function formatShareText(product: ShareProductType, data: ShareData): string {
  switch (product) {
    case 'cdb':
      return formatCDBMessage(data as CDBShareData);
    case 'lci-lca':
      return formatLCILCAMessage(data as LCILCAShareData);
    case 'tesouro':
      return formatTesouroMessage(data as TesouroShareData);
    default:
      return 'Simulação – Renda Fixa Pro';
  }
}

export async function shareProjection(text: string): Promise<void> {
  try {
    await Share.share({
      message: text,
      title: 'Simulação de Investimento',
    });
  } catch (error) {
    if (__DEV__) {
      console.warn('Share failed:', error);
    }
  }
}
