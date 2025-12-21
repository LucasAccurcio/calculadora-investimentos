# Phase 2-3: Graphics & Comparison Implementation Plan

## Overview

Após completar a Fase 1 (Trial + Subscription), o próximo passo é implementar componentes de gráficos e comparativos para completar o plano de monetização.

## Phase 2: Chart Foundation

### 2.1 - Choose & Setup Charting Library

**Current Options:**

1. **victory-native** ✅ Recomendado
   - Pros: Expo compatible, React Native native, TypeScript support
   - Cons: Bundle size (~400KB)
   - Status: Battle-tested, good React Native community

2. **react-native-chart-kit**
   - Pros: Lightweight, built-in themes
   - Cons: Less customization, older API

3. **react-native-svg + custom D3**
   - Pros: Full control, minimal deps
   - Cons: Complex to implement

**Recommendation:** `victory-native` (instalar com `npm install victory-native`)

### 2.2 - GrowthChart Component

**Path:** `features/calculators/components/growth-chart.tsx`

**Purpose:** Exibir evolução do investimento ao longo dos meses

**Inputs:**

```typescript
interface GrowthChartProps {
  data: ChartDataPoint[]; // { month: number, gross: number, net: number }
  title: string; // "Evolução do CDB"
  showNet?: boolean; // Show net after tax line
  currency?: string; // "BRL"
}

interface ChartDataPoint {
  month: number; // Mês 0, 1, 2, ..., N
  gross: number; // Valor bruto acumulado
  net: number; // Valor líquido (após IR)
  monthLabel?: string; // "Mês 1", "Mês 6", etc
}
```

**Features:**

- Linha dupla: gross (azul) vs net (verde)
- X-axis: meses
- Y-axis: valores em reais (formatado com separador de milhares)
- Tooltip ao hover: mostra valores exatos
- Legend: diferencia gross vs net
- Responsivo: adapta ao tamanho da tela

**Example Data Builder:**

```typescript
function buildCdbSeries(projection: ProjectionResult): ChartDataPoint[] {
  const series: ChartDataPoint[] = [];

  // Samples every N months to keep data reasonable
  const interval = Math.ceil(projection.months / 20); // Max 20 points

  for (let month = 0; month <= projection.months; month += interval) {
    // Recalculate projection for this intermediate month
    const intermediate = calculateProjection({
      ...projection.inputs,
      months: month,
    });

    series.push({
      month,
      gross: intermediate.gross,
      net: intermediate.net,
      monthLabel: `Mês ${month}`,
    });
  }

  return series;
}
```

### 2.3 - ComparisonChart Component

**Path:** `features/calculators/components/comparison-chart.tsx`

**Purpose:** Comparar retornos de 3 produtos lado a lado

**Inputs:**

```typescript
interface ComparisonChartProps {
  cdb: ProjectionResult;
  lciLca: LciLcaProjectionResult;
  tesouro: TesouroProjectionResult;
}
```

**Features:**

- Gráfico de barras lado a lado
- Cores por produto: CDB (azul), LCI/LCA (verde), Tesouro (laranja)
- Mostra: Gross, Net, Ganho Total
- Porcentagem de retorno abaixo de cada barra
- Destaca o melhor (com estrela ou destaque visual)

**Implementation:**

```typescript
export function ComparisonChart({
  cdb,
  lciLca,
  tesouro,
}: ComparisonChartProps) {
  const data = [
    { name: 'CDB', gross: cdb.gross, net: cdb.net },
    { name: 'LCI/LCA', gross: lciLca.gross, net: lciLca.net },
    { name: 'Tesouro', gross: tesouro.gross, net: tesouro.net },
  ];

  return (
    <VictoryChart>
      <VictoryGroup offset={40}>
        <VictoryBar data={data} x="name" y="gross" />
        <VictoryBar data={data} x="name" y="net" />
      </VictoryGroup>
    </VictoryChart>
  );
}
```

### 2.4 - Series Generation Utils

**Path:** `features/calculators/utils/series-generators.ts`

**Exports:**

```typescript
export function buildCdbSeries(projection: ProjectionResult): ChartDataPoint[];
export function buildLciSeries(projection: LciLcaProjectionResult): ChartDataPoint[];
export function buildTesouroSeries(projection: TesouroProjectionResult): ChartDataPoint[];

export function compareScenarios(
  cdb: ProjectionResult,
  lciLca: LciLcaProjectionResult,
  tesouro: TesouroProjectionResult,
): ComparisonData;
```

## Phase 3: Integration into Calculators

### 3.1 - Update CDB Projection Summary

**File:** `features/calculators/cdb/projection-summary.tsx`

**Changes:**

```typescript
export function ProjectionSummary({ data }: ProjectionSummaryProps) {
  const { canAccessPremiumFeatures } = useSubscription();

  return (
    <ThemedView>
      {/* Free content: Key metrics */}
      <MetricsGrid data={data} />

      {/* Premium: Growth chart */}
      <ProGate>
        <GrowthChart
          data={buildCdbSeries(data)}
          title="Evolução do Investimento"
        />
      </ProGate>
    </ThemedView>
  );
}
```

### 3.2 - Add Comparison Feature

**New Component:** `features/calculators/components/comparison-calculator.tsx`

**Purpose:** Permitir usuários comparar produtos com os mesmos inputs

**UI:**

```
┌────────────────────────────────────┐
│ Comparar CDB vs LCI/LCA vs Tesouro │
├────────────────────────────────────┤
│                                    │
│ [Input: Valor Inicial]             │
│ [Input: Período]                   │
│ [Button: Comparar]                 │
│                                    │
│ [Results Grid]                     │
│ [Comparison Chart]                 │
│                                    │
└────────────────────────────────────┘
```

### 3.3 - Settings/Debug Panel

**For internal testing and user testing:**

```typescript
// Add to Home or Settings
export function SubscriptionDebugPanel() {
  const {
    isPro,
    trial,
    calculationsUsed,
    toggleProMock,
    resetTrial,
  } = useSubscription();

  return (
    <ThemedView style={styles.debugPanel}>
      <ThemedText>Debug: Subscription State</ThemedText>

      <DebugRow label="isPro" value={isPro ? 'true' : 'false'} />
      <DebugRow label="Trial Days Left" value={trial?.daysRemaining ?? 'N/A'} />
      <DebugRow label="Calculations" value={`${calculationsUsed}/3`} />

      <Button onPress={toggleProMock} title="Toggle Pro" />
      <Button onPress={resetTrial} title="Reset Trial" />
    </ThemedView>
  );
}
```

## Phase 4: Advanced Features (Future)

### 4.1 - Alerts System

- Notify users when investments reach milestones
- Gated behind Pro subscription

### 4.2 - PDF Export

- Export calculation as detailed report
- Pro feature

### 4.3 - Simulation Scenarios

- "What if" analysis: compare with different rates
- Pro feature

### 4.4 - Historical Data

- Store previous calculations
- Track changes over time
- Pro feature

## Implementation Checklist

**Phase 2: Foundation**

- [ ] Install victory-native
- [ ] Create GrowthChart component
- [ ] Create ComparisonChart component
- [ ] Create series generator utilities
- [ ] Test with mock data

**Phase 3: Integration**

- [ ] Update CDB ProjectionSummary to include GrowthChart
- [ ] Update LCI ProjectionSummary to include GrowthChart
- [ ] Update Tesouro ProjectionSummary to include GrowthChart
- [ ] Add ProGate wrapper to all charts
- [ ] Create Comparison Calculator feature
- [ ] Add to navigation menu

**Phase 4: Polish**

- [ ] Animations on chart render
- [ ] Loading skeletons during calculation
- [ ] Error states
- [ ] Keyboard handling for comparison inputs
- [ ] Share comparison results

**Phase 5: Testing & QA**

- [ ] Test charts on iOS/Android
- [ ] Test trial flow (3 calcs + blocking)
- [ ] Test subscription toggle
- [ ] Test persistence across app restarts
- [ ] Performance testing (large datasets)

## Technical Considerations

### Performance

- Sample data points to keep chart smooth (max 30 points)
- Memoize series generation (cache by input hash)
- Use React.memo for chart components

### Accessibility

- Add ARIA labels to charts
- Keyboard navigation in comparison
- Contrast ratios for colors

### Localization

- All labels in `pt-BR`
- Decimal separator: `,` (comma)
- Thousand separator: `.` (dot)
- Currency: `R$`

### Cross-Platform

- Test iOS gestures (pinch zoom)
- Test Android landscape orientation
- Verify colors in dark mode

## Notes

- **Calculation Counting:** Already tracked in SubscriptionProvider
- **Persistence:** AsyncStorage handles state between sessions
- **Device-Locking:** Structure ready when auth service integrated
- **Future Payments:** Will integrate with Stripe/Apple Pay/Google Play
