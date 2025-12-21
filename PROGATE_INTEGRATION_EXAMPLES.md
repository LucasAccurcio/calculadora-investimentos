/\*\*

- Example: How to Use ProGate in Calculator Summaries
-
- This is a reference implementation showing how to gate premium features
- like charts and comparisons using the ProGate component.
-
- Integration into actual calculator summaries happens in Phase 2-3.
  \*/

// =====================================================
// EXAMPLE 1: Gate a Chart Component
// =====================================================

import React from 'react';
import { ThemedView } from '@/components/themed-view';
import { ProGate } from '@/features/subscription';
import { GrowthChart } from '@/features/calculators/components/growth-chart'; // Future component

export function ProjectionSummaryWithChart() {
return (
<ThemedView>
{/_ Regular content - always visible _/}
<ThemedText>Resumo do Cálculo</ThemedText>
<ResultsGrid data={...} />

      {/* Premium content - gated */}
      <ProGate onSubscribePress={handleSubscribePress}>
        <GrowthChart
          data={projectionData}
          title="Evolução do Investimento"
        />
      </ProGate>
    </ThemedView>

);
}

// =====================================================
// EXAMPLE 2: Multiple Premium Sections
// =====================================================

export function AdvancedCalculatorSummary() {
const handleSubscribePress = () => {
// Abrir modal de assinatura
openSubscriptionModal();
};

return (
<ThemedView style={styles.container}>
{/_ Free section _/}
<BaseResults data={data} />

      {/* Premium section 1: Growth chart */}
      <ProGate onSubscribePress={handleSubscribePress}>
        <GrowthChart data={data.series} />
      </ProGate>

      {/* Premium section 2: Comparison */}
      <ProGate onSubscribePress={handleSubscribePress}>
        <ComparisonChart
          cdbData={cdbResults}
          lciData={lciResults}
          tesouroData={tesouroResults}
        />
      </ProGate>

      {/* Premium section 3: Tax breakdown */}
      <ProGate onSubscribePress={handleSubscribePress}>
        <TaxBreakdownChart data={data.taxAnalysis} />
      </ProGate>
    </ThemedView>

);
}

// =====================================================
// EXAMPLE 3: Subscription Modal Handler
// =====================================================

function useSubscriptionModal() {
const { isPro, canAccessPremiumFeatures, toggleProMock } = useSubscription();
const [isModalVisible, setIsModalVisible] = useState(false);

const openSubscriptionModal = useCallback(() => {
setIsModalVisible(true);
}, []);

const handleSubscribe = useCallback(async () => {
// In production, this integrates with:
// - Payment processor (Apple In-App Purchase, Google Play Billing, etc.)
// - Auth service
// - Backend subscription validation

    // For now: mock
    await toggleProMock();
    setIsModalVisible(false);

    // Show success toast
    showToast('Parabéns! Você agora tem acesso ao Plano Pro');

}, [toggleProMock]);

const SubscriptionModal = () => {
if (!isModalVisible) return null;

    return (
      <Modal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
      >
        <ThemedView style={styles.modalContent}>
          <ThemedText style={styles.title}>
            Desbloqueie todo o Potencial
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Com o Plano Pro você tem acesso a:
          </ThemedText>

          <FeatureList>
            <Feature icon="chart" title="Gráficos de Evolução">
              Visualize a evolução do seu investimento ao longo do tempo
            </Feature>
            <Feature icon="compare" title="Comparativo">
              Compare CDB, LCI/LCA e Tesouro Direto lado a lado
            </Feature>
            <Feature icon="notification" title="Alertas">
              Receba alertas sobre oportunidades de investimento
            </Feature>
            <Feature icon="export" title="Exportar">
              Exporte seus cálculos em PDF
            </Feature>
          </FeatureList>

          <Button
            onPress={handleSubscribe}
            title="Assinar - R$ 9,99/mês"
          />

          <Button
            variant="secondary"
            onPress={() => setIsModalVisible(false)}
            title="Talvez Depois"
          />
        </ThemedView>
      </Modal>
    );

};

return {
openSubscriptionModal,
SubscriptionModal,
};
}

// =====================================================
// EXAMPLE 4: Integration in CDB Calculator
// =====================================================

// app/calculators/cdb/index.tsx

export default function CdbCalculatorScreen() {
const { openSubscriptionModal, SubscriptionModal } = useSubscriptionModal();

return (
<KeyboardAwareScrollView>
{/_ Input fields _/}
<InputSection>
<CalculatorInput ... />
</InputSection>

      {/* Results - mix of free and premium */}
      {projectionDetails && (
        <ThemedView style={styles.resultsSection}>
          {/* Always visible: Key metrics */}
          <ProjectionSummary data={projectionDetails} />

          {/* Premium: Growth chart */}
          <ProGate
            onSubscribePress={openSubscriptionModal}
          >
            <GrowthChart
              data={buildCdbSeries(projectionDetails)}
              title="Evolução do Investimento"
            />
          </ProGate>

          {/* Premium: Comparison */}
          <ProGate
            onSubscribePress={openSubscriptionModal}
          >
            <ComparisonChart
              data={getCdbComparisonData(projectionDetails)}
            />
          </ProGate>
        </ThemedView>
      )}

      {/* Modal for subscription */}
      <SubscriptionModal />
    </KeyboardAwareScrollView>

);
}

// =====================================================
// EXAMPLE 5: Conditional Rendering Without ProGate
// =====================================================

// Alternative: Hide entirely for non-pro users

export function AdvancedAnalytics() {
const { canAccessPremiumFeatures } = useSubscription();

if (!canAccessPremiumFeatures) {
return null; // Hide until user upgrades
}

return (
<ThemedView>
<GrowthChart data={data} />
<ComparisonChart data={compareData} />
</ThemedView>
);
}

// =====================================================
// EXAMPLE 6: Per-Feature Gating
// =====================================================

// Different premium levels could gate different features

export function CalculatorResults() {
const { trial, canAccessPremiumFeatures } = useSubscription();

return (
<ThemedView>
{/_ Basic results: always free _/}
<BasicMetrics data={data} />

      {/* Chart: Gated in trial after 3 calculations */}
      {trial && trial.hasReachedLimit ? (
        <ProGate>
          <GrowthChart data={data} />
        </ProGate>
      ) : canAccessPremiumFeatures ? (
        <GrowthChart data={data} />
      ) : null}

      {/* Detailed breakdown: Pro only */}
      <ProGate>
        <DetailedBreakdown data={data} />
      </ProGate>
    </ThemedView>

);
}

// =====================================================
// Notes:
// =====================================================
//
// 1. ProGate automatically:
// - Shows content if canAccessPremiumFeatures = true
// - Shows blur + CTA if canAccessPremiumFeatures = false
//
// 2. onSubscribePress callback:
// - Called when user taps CTA in ProGate
// - Usually opens subscription modal
// - Can be custom per component
//
// 3. BlurView intensity:
// - Currently set to 85 (moderate blur)
// - Can be adjusted in ProGate component
//
// 4. Future enhancements:
// - Different CTA messages per context
// - Animated transitions on upgrade
// - Progressive feature unlock (basic trial, extended trial, pro)
//
