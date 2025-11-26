import type { Href } from 'expo-router';

import type { IconSymbolName } from '@/components/ui/icon-symbol';

export type CalculatorMenu = {
  route: Href;
  title: string;
  description: string;
  icon: IconSymbolName;
  accent: string;
};

export const CALCULATORS: CalculatorMenu[] = [
  {
    route: '/calculators/cdb' as Href,
    title: 'CDB',
    description: 'Projeção líquida considerando IR e carência.',
    icon: 'chart.line.uptrend.xyaxis',
    accent: 'rgba(50, 135, 30, 1)',
  },
  {
    route: '/calculators/lci-lca' as Href,
    title: 'LCI / LCA',
    description: 'Simulação isenta para metas de curto e médio prazo.',
    icon: 'building.columns.fill',
    accent: 'rgba(50, 120, 250, 1)',
  },
  {
    route: '/calculators/tesouro-direto' as Href,
    title: 'Tesouro Direto',
    description: 'Compare prefixados, IPCA+ e Selic em um só lugar.',
    icon: 'banknote.fill',
    accent: 'rgba(251, 191, 0, 1)',
  },
];
