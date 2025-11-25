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
  const totalInvested = data.invested + data.monthlyContribution * data.deadline;
  const lines = [
    `Simulação – ${data.productName}`,
    `Investi: ${formatCurrency(totalInvested)}`,
    `Prazo: ${data.deadline} meses`,
    `Taxa CDI: ${data.cdiRate.toFixed(2)}% | ${data.cdiPercent.toFixed(0)}% do CDI`,
    `Valor bruto: ${formatCurrency(data.grossResult)}`,
    `Valor líquido: ${formatCurrency(data.netResult)}`,
    '',
    'Calculado com Renda Fixa Pro',
  ];
  return lines.join('\n');
}

function formatLCILCAMessage(data: LCILCAShareData): string {
  const totalInvested = data.invested + data.monthlyContribution * data.deadline;
  const lines = [
    `Simulação – ${data.productName}`,
    `Investi: ${formatCurrency(totalInvested)}`,
    `Prazo: ${data.deadline} meses`,
    `Taxa CDI: ${data.cdiRate.toFixed(2)}% | ${data.cdiPercent.toFixed(0)}% do CDI`,
    `Valor final (isento de IR): ${formatCurrency(data.result)}`,
    '',
    'Calculado com Renda Fixa Pro',
  ];
  return lines.join('\n');
}

function formatTesouroMessage(data: TesouroShareData): string {
  const totalInvested = data.invested + data.monthlyContribution * data.deadline;
  const modalityLabel = {
    selic: 'Tesouro Selic',
    prefixado: 'Tesouro Prefixado',
    ipca: 'Tesouro IPCA+',
  }[data.modality];

  const lines = [
    `Simulação – ${data.productName} (${modalityLabel})`,
    `Investi: ${formatCurrency(totalInvested)}`,
    `Prazo: ${data.deadline} meses`,
    data.rate ? `Taxa anual: ${data.rate.toFixed(2)}%` : '',
    `Valor bruto: ${formatCurrency(data.grossResult)}`,
    `Valor líquido: ${formatCurrency(data.netResult)}`,
    '',
    'Calculado com Renda Fixa Pro',
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
