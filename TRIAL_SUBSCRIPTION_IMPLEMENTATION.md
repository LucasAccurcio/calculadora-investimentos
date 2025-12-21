# Trial & Subscription Implementation

## Overview

Implementação da estratégia de monetização com trial de 7 dias e plano pago. O sistema rastreia o número de cálculos realizados e limita o acesso a conteúdo premium (gráficos e comparativos) após 3 cálculos na versão trial.

## Architecture

### 1. Core Components

#### `features/subscription/types.ts`

Define tipos TypeScript para estados de inscrição:

- `SubscriptionStatus`: TRIAL, ACTIVE, EXPIRED
- `TrialState`: Informações do período de trial (dias restantes, cálculos usados, limite)
- `SubscriptionState`: Estado completo da assinatura
- `UseSubscriptionReturn`: Return type do hook `useSubscription`

**Preparado para integração com auth**: campos `deviceId` e `userId` para device-locking futuro

#### `features/subscription/utils.ts`

Funções utilitárias para lógica de trial:

- `calculateTrialDaysRemaining()`: Calcula dias restantes do trial
- `isTrialActive()`: Verifica se trial está ativo
- `buildTrialState()`: Constrói objeto de estado do trial
- `determineSubscriptionStatus()`: Classifica status (TRIAL/ACTIVE/EXPIRED)
- `canAccessPremiumFeatures()`: Verifica se pode acessar premium
- `determinePremiumMode()`: Retorna modo ('free' | 'trial' | 'pro')

#### `features/subscription/context.tsx`

**SubscriptionProvider** e **useSubscription hook**

**Estado persistido em AsyncStorage:**

- `subscription:isPro`: Booleano - se usuário é subscriber pago
- `subscription:trialStartDate`: Timestamp - quando o trial começou
- `subscription:calculationsUsed`: Número de cálculos realizados
- `subscription:deviceId`: String - ID único do dispositivo (gerado com crypto.randomUUID)

**Métodos públicos:**

- `incrementCalculationCount()`: Incrementa contador (chamado após cada cálculo bem-sucedido)
- `toggleProMock()`: Para testes - alterna estado isPro
- `resetTrial()`: Para testes - reseta todos os valores

**Regras de acesso:**

```
canAccessPremiumFeatures = true se:
  - isPro = true (assinante pago)
  OU
  - trial ativo E calculationsUsed < 3 (na trial, antes do 4º cálculo)

Caso contrário: canAccessPremiumFeatures = false
```

#### `features/subscription/pro-gate.tsx`

Componente que gates conteúdo premium com blur + overlay

**Modos:**

1. `'free'`: Usuário novo → "Teste o Plano Pro por 7 dias" CTA
2. `'trial'`: Trial ativo → Conteúdo visível normalmente
3. `'trial-expired'`: Trial expirado → "Assine o Plano Pro" CTA + stat de cálculos usados
4. `'pro'`: Assinante pago → Sem restrições

**UI:**

- BlurView com intensity={85}
- Overlay semi-transparente
- Título, descrição e botão CTA
- Mostra contador de cálculos quando expirado (ex: "3/3")

### 2. Integration Points

#### `app/_layout.tsx`

**SubscriptionProvider** envolvendo todo o app tree:

```
SafeAreaProvider
  → GluestackUIProvider
    → ThemeProvider
      → SubscriptionProvider  ← Aqui
        → SafeAreaView
          → Stack (navegação)
```

Garante que todos os calculadores têm acesso ao `useSubscription` hook.

#### Calculadores: `app/calculators/{cdb,lci-lca,tesouro-direto}/index.tsx`

Cada calculador foi atualizado com:

1. **Import do hook:**

   ```typescript
   import { useSubscription } from '@/features/subscription';
   ```

2. **Dentro do componente:**

   ```typescript
   const { incrementCalculationCount } = useSubscription();
   ```

3. **Increment na conclusão do cálculo:**
   ```typescript
   useEffect(() => {
     if (projectionDetails) {
       // Increment calculation count for trial tracking
       incrementCalculationCount().catch((err) => {
         console.warn('Failed to increment calculation count:', err);
       });

       // Auto-scroll to results...
       setTimeout(() => {
         /* scroll */
       }, 300);
     }
   }, [projectionDetails, incrementCalculationCount]);
   ```

## User Flow

### Novo Usuário (0 cálculos)

1. Instala app → SubscriptionProvider inicializa
2. `trialStartDate` setado para agora
3. `calculationsUsed` = 0
4. `isPro` = false
5. Acesso total ao app (trial está ativo)

### Primeiro ao Terceiro Cálculo

- Faz cálculo → `projectionDetails` atualiza
- `incrementCalculationCount()` chamado automaticamente
- Gráficos (ProGate envolvido) mostrados normalmente (canAccessPremiumFeatures = true)

### Quarto Cálculo em Diante

- `calculationsUsed` = 3
- `canAccessPremiumFeatures` = false
- **Gráficos bloqueados com ProGate:**
  - BlurView sobre conteúdo premium
  - Overlay com "Assine o Plano Pro"
  - Mostra "3/3 cálculos usados"

### Passados 7 Dias

- `isTrialActive()` retorna false
- `status` = EXPIRED
- Mesmo que `isPro` = false, gráficos permanecem bloqueados

### Após Assinatura (Mock ou Real)

- `isPro` = true
- `canAccessPremiumFeatures` = true
- Gráficos desbloqueados
- Permanece assim enquanto `isPro` = true

## Testing

### Mock Pro Toggle

Para testes, usar:

```typescript
const { toggleProMock } = useSubscription();
toggleProMock(); // Alterna entre free → pro
```

### Reset Trial

Para recomeçar teste:

```typescript
const { resetTrial } = useSubscription();
resetTrial(); // Reseta tudo (trial, contador, isPro)
```

### Simulação de Trial Expirado

1. Fazer 3 cálculos (para atingir limite)
2. Para simular expiração: modificar `trialStartDate` em AsyncStorage para 8 dias atrás

## Future Integration: Device-Locking

### Quando integrar com serviço de autenticação:

1. **Na autenticação do usuário:**
   - Obter `userId` do serviço
   - Obter/gerar `deviceId` via native modules (ex: @react-native-device-info)
   - Salvar ambos em `SubscriptionProvider`

2. **Na validação de assinatura:**
   - Servidor retorna: `{ isPro, expiresAt, validatedDeviceId, validatedUserId }`
   - Comparar `validatedDeviceId === deviceId` local
   - Se não corresponder → mostrar erro "Assinatura em outro dispositivo"

3. **Estrutura já preparada:**

   ```typescript
   deviceId: string | null; // Gerado automaticamente no init
   userId: string | null; // Será preenchido na auth
   ```

4. **Validação server-side:**

   ```
   POST /api/validate-subscription
   {
     userId: string,
     deviceId: string,
     subscriptionToken: string
   }

   Retorna:
   {
     isPro: boolean,
     deviceId: string (validado),
     expiresAt: number
   }
   ```

## File Structure

```
features/subscription/
  ├── types.ts          # Type definitions
  ├── utils.ts          # Trial logic utilities
  ├── context.tsx       # SubscriptionProvider + useSubscription
  ├── pro-gate.tsx      # ProGate component
  └── index.ts          # Exports
```

## Next Steps (Implementação de Gráficos)

1. **GrowthChart Component**
   - Exibir evolução do investimento ao longo do tempo
   - Envolver em `<ProGate>` para gating

2. **ComparisonChart Component**
   - Comparar CDB vs LCI/LCA vs Tesouro
   - Envolver em `<ProGate>` para gating

3. **Integração nos Calculadores**
   - Adicionar após `ProjectionSummary`
   - Passar dados de `projectionDetails`

4. **CTA Modal/Sheet**
   - Modal ao clicar no botão "Assinar Plano Pro"
   - Listar benefícios: gráficos, comparativos, alertas, etc.
   - Botão "Assinar" chama `toggleProMock()` (depois será integração real)

## Notes

- **Trial = 7 dias** contados a partir da primeira instalação
- **Limite trial = 3 cálculos** antes de gating
- **AsyncStorage** persiste entre aberturas do app
- **deviceId** gerado automaticamente para future device-locking
- **Lint status**: ✅ Exit Code 0 (sem erros)
