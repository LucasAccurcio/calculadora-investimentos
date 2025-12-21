# Trial & Subscription State Diagram

## User Journey

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      NEW USER INSTALLS APP                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  SubscriptionProvider initializes:                                           │
│  ├─ trialStartDate = Date.now()          [First install time]               │
│  ├─ calculationsUsed = 0                 [No calculations yet]              │
│  ├─ isPro = false                        [Not a paid subscriber]            │
│  ├─ deviceId = crypto.randomUUID()       [Generated for future use]         │
│  └─ userId = null                        [Will be set on auth]             │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     TRIAL STATE: ACTIVE                                       │
│                     Days Remaining: 7                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  canAccessPremiumFeatures = true                                             │
│  ├─ User can see all content                                                │
│  ├─ No blur on charts                                                       │
│  ├─ Full access to premium features                                         │
│  └─ Calculation counter starts: 0/3                                         │
│                                                                               │
│  [User makes 1st calculation]                                                │
│  └─ calculationsUsed = 1  (counter: 1/3)                                    │
│                                                                               │
│  [User makes 2nd calculation]                                                │
│  └─ calculationsUsed = 2  (counter: 2/3)                                    │
│                                                                               │
│  [User makes 3rd calculation]                                                │
│  └─ calculationsUsed = 3  (counter: 3/3)  ◄─── THRESHOLD REACHED            │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (4th calculation attempt)
┌─────────────────────────────────────────────────────────────────────────────┐
│              TRIAL ACTIVE BUT LIMIT REACHED (trial-expired mode)              │
│                     Days Remaining: 5-7                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                               │
│  canAccessPremiumFeatures = false  ◄─── KEY CHANGE                          │
│  ├─ Charts appear with BLUR overlay                                         │
│  ├─ Text: "Assine o Plano Pro"                                              │
│  ├─ Shows: "3/3 cálculos usados"                                            │
│  ├─ Button: "Assinar Plano Pro"                                             │
│  └─ User cannot proceed without upgrading                                   │
│                                                                               │
│  User Options:                                                               │
│  ├─ Tap "Assinar" → Opens subscription flow                                 │
│  │  └─ (Mock: calls toggleProMock())                                        │
│  ├─ Continue free → Can still use basic calculator                          │
│  │  └─ Charts remain blocked                                                │
│  └─ Wait 7 days → Trial expires completely                                  │
│                                                                               │
└─────────────────────────────────────────────────────────────────────────────┘
           ┌──────────────────────┬──────────────────────┐
           │                      │                      │
           ▼ (After 7 days)       ▼ (User subscribes)    ▼ (No action)

┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  TRIAL: EXPIRED      │ │  STATUS: ACTIVE      │ │  STATUS: EXPIRED     │
│  isPro = false       │ │  isPro = true        │ │  isPro = false       │
│  Days Left = 0       │ │  (Paid subscriber)   │ │  Days Left = 0       │
├──────────────────────┤ ├──────────────────────┤ ├──────────────────────┤
│                      │ │                      │ │                       │
│ canAccess = false    │ │ canAccess = true     │ │ canAccess = false     │
│ ├─ Blur all charts   │ │ ├─ See all charts    │ │ ├─ Blur all charts    │
│ ├─ CTA: "Assinar"    │ │ ├─ No restrictions   │ │ ├─ CTA: "Assinar"    │
│ ├─ Shows "7/3"       │ │ ├─ Unlimited calcs   │ │ ├─ Shows "7+/3"      │
│ └─ Can use free app  │ │ └─ Priority support  │ │ └─ Can use free app   │
│                      │ │                      │ │                       │
│ (Can subscribe anytime) │ (Renews monthly) │ (Can subscribe)         │
│                      │ │                      │ │                       │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

## State Transitions Logic

```
INITIAL STATE
    │
    ├─ First init: set trialStartDate = now
    │
    └─ On every app open:
       ├─ Calculate: isTrialActive = (now - trialStartDate < 7 days)
       ├─ Calculate: canAccessPremium = isPro OR (isTrialActive AND calcCount < 3)
       └─ Determine mode:
          ├─ If isPro → "pro" mode (full access)
          ├─ If isTrialActive AND calcCount < 3 → "trial" mode (full access)
          ├─ If isTrialActive AND calcCount >= 3 → "trial-expired" mode (blocked)
          └─ If NOT isTrialActive AND NOT isPro → "free" mode (blocked)

WHEN USER CALCULATES:
    │
    └─ handleCalculate() → successful result
       └─ useEffect: projectionDetails updated
          └─ incrementCalculationCount()
             ├─ calculationsUsed++
             ├─ Save to AsyncStorage
             └─ Re-evaluate: canAccessPremium = isPro OR (trial AND count < 3)

WHEN USER SUBSCRIBES (mock):
    │
    └─ toggleProMock() called
       ├─ isPro = true
       ├─ Save to AsyncStorage
       ├─ Re-evaluate: canAccessPremium = true (always, since isPro)
       └─ BlurView removed from all ProGate components
          └─ Charts visible to user

WHEN USER UNSUBSCRIBES (or subscription expires):
    │
    └─ Backend validation fails or mock toggle again
       ├─ isPro = false
       ├─ Re-evaluate: canAccessPremium = trial && count < 3
       └─ If trial expired and calc count >= 3:
          └─ Re-enable blur on ProGate components
```

## Data Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                     AsyncStorage                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ subscription:isPro              = "true" | "false"              │ │
│  │ subscription:trialStartDate     = timestamp (ms)               │ │
│  │ subscription:calculationsUsed   = "0" | "1" | "2" | "3"...     │ │
│  │ subscription:deviceId           = UUID                         │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└──────────────────┬──────────────────────────────────────────────────┘
                   │ (on mount)
                   ▼
      ┌─────────────────────────────────┐
      │   SubscriptionProvider init      │
      ├─────────────────────────────────┤
      │ Load from AsyncStorage           │
      │ Compute derived states:          │
      │  - status                        │
      │  - trial                         │
      │  - canAccessPremiumFeatures      │
      └─────────────────────────────────┘
                   │
                   ├─────────────────────────┬──────────────────────┐
                   ▼                         ▼                      ▼
        ┌──────────────────┐    ┌──────────────────┐   ┌──────────────────┐
        │  Each Calculator │    │   ProGate Users  │   │  Test/Debug UI   │
        ├──────────────────┤    ├──────────────────┤   ├──────────────────┤
        │ useSubscription()│    │ useSubscription()│   │ useSubscription()│
        │ ├─ increment... │    │ ├─ canAccess...  │   │ ├─ toggleProMock│
        │ │  on calc      │    │ ├─ renders based │   │ ├─ resetTrial   │
        │ │              │    │ │  on access     │   │ │                │
        │ └─ Auto calls   │    │ └─ blur/CTA      │   │ └─ For testing  │
        │   async save    │    │                  │   │                │
        └──────────────────┘    └──────────────────┘   └──────────────────┘
```

## ProGate Component Logic

```
<ProGate onSubscribePress={handleSub}>
  <GrowthChart />
</ProGate>
  │
  ├─ canAccessPremiumFeatures = true
  │  └─ RENDER: <GrowthChart /> (no blur)
  │
  └─ canAccessPremiumFeatures = false
     ├─ RENDER: BlurView(opacity: 85%)
     ├─ RENDER: Overlay(rgba(0,0,0,0.4))
     └─ RENDER: Modal content
        ├─ IF mode = "free":
        │  ├─ Title: "Teste o Plano Pro"
        │  ├─ Description: "Desbloqueie gráficos por 7 dias"
        │  └─ Button: "Iniciar Trial Grátis"
        │
        └─ IF mode = "trial-expired":
           ├─ Title: "Trial Finalizado"
           ├─ Description: "Assine para continuar..."
           ├─ Button: "Assinar Plano Pro"
           └─ Info: "Cálculos usados: 3/3"
```

## Time Progression Example

```
Day 0 (Installation)
├─ trialStartDate = timestamp(0)
├─ daysRemaining = 7
└─ canAccess = true, calcCount = 0/3

Day 1
├─ User makes 3 calculations
├─ canAccess = false (calc limit reached)
├─ daysRemaining = 6
└─ Charts show: "Assine para ver" + Counter "3/3"

Day 3
├─ daysRemaining = 4
├─ canAccess = false (still at calc limit)
└─ CTA unchanged

Day 7 (7 days later)
├─ daysRemaining = 0
├─ isTrialActive = false
├─ canAccess = false
└─ CTA still shows: "Assine para continuar"
   (even though trial days weren't the limiting factor)

If user upgraded on Day 1:
├─ isPro = true
├─ canAccess = true (always)
└─ Charts visible regardless of:
   - Days remaining
   - Calculation count
```

## Error Handling

```
Scenario: AsyncStorage fails to read/write
├─ Try: Load from AsyncStorage
├─ Catch: Log warning, continue with graceful defaults
├─ Default: Assume new user (trial initialized)
└─ Result: Feature remains functional, just not persisted

Scenario: Device ID generation fails
├─ Try: Crypto.randomUUID()
├─ Catch: Fallback = `device_${timestamp}_${random}`
└─ Result: Still gets unique ID for future device-locking

Scenario: Subscription validation fails (future, with backend)
├─ Try: POST /api/validate-subscription
├─ Catch: Network error
├─ Fallback: Use last known state from AsyncStorage
└─ Result: Offline mode works with cached state
```

## Testing Scenarios

```
1. Fresh Install + Trial Flow
   ├─ Reset app data
   ├─ Open app → trial initialized
   ├─ Make 3 calculations → canAccess changes from true → false
   └─ Verify blur appears on 4th calculation attempt

2. Trial Expiration
   ├─ Reset app, modify trialStartDate to 8 days ago
   ├─ canAccess should be false
   └─ Verify CTA shows "Assine para continuar"

3. Pro Subscription Mock
   ├─ toggleProMock() → isPro flips
   ├─ canAccess should be true (regardless of calc count)
   └─ Verify blur removed from ProGate components

4. Persistence Test
   ├─ Make calculations, close app
   ├─ Reopen app → calculation count should persist
   └─ Verify state is maintained

5. Multiple Calculators
   ├─ Make 1 calc in CDB → count = 1
   ├─ Switch to LCI/LCA → make 1 calc → count = 2
   ├─ Switch to Tesouro → make 1 calc → count = 3
   ├─ Try to make 4th calculation → should be blocked
   └─ Verify counter shared across all calculators
```
