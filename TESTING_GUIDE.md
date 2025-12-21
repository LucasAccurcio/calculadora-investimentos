# Trial & Subscription Testing Guide

## Quick Start

### 1. Build & Run

```bash
cd /home/laccurcio/projects/calculadora-investimentos/calculadora-investimentos

# Install dependencies (if needed)
npm install

# Start dev server
npm start

# Or jump directly to platform
npm run android   # Android emulator
npm run ios       # iOS simulator
npm run web       # Web preview
```

### 2. Verify Implementation

```bash
# Check that all files exist
ls -la features/subscription/
# Should show: context.tsx, pro-gate.tsx, types.ts, utils.ts, index.ts

# Verify no lint errors
npm run lint
# Should exit with code 0
```

---

## Testing Scenarios

### Scenario 1: Fresh Install (Trial Flow)

**Goal:** Verify new user gets 7-day trial with 3 free calculations

**Steps:**

1. **Clear App Data**

   ```bash
   # Android
   adb shell pm clear com.laccurcio.calculadora

   # iOS
   # Simpler: just uninstall and reinstall from Xcode
   ```

2. **Launch App**
   - Navigate to CDB Calculator
   - Verify no blur on any content (trial is active)

3. **Make 1st Calculation**
   - Fill in: Initial = 1000, Monthly = 100, Months = 12, CDI = 13.65%, Rate = 100%
   - Tap "Calcular" or press Enter on last field
   - Verify: Calculation succeeds, projection shows, auto-scrolls to results
   - **Expected:** No blur, full content visible

4. **Make 2nd Calculation**
   - Change one field and calculate again
   - **Expected:** Still no blur

5. **Make 3rd Calculation**
   - Change another field and calculate
   - **Expected:** Still no blur (this is still within trial limit)

6. **Make 4th Calculation**
   - Change another field and calculate
   - **Expected:**
     - Calculation completes
     - Charts/Premium content shows blur + overlay
     - Text reads: "Assine o Plano Pro"
     - Shows: "3/3 cálculos usados"
     - Button: "Assinar Plano Pro"

7. **Tap "Assinar Plano Pro"**
   - Callback function called (currently just closes ProGate)
   - In future, will open subscription modal

**Verification Points:**

- ✅ Counter advances: 0/3 → 1/3 → 2/3 → 3/3
- ✅ Trial limit enforces correctly
- ✅ Blur/CTA appears on 4th calculation
- ✅ Other calculators share the same counter

---

### Scenario 2: Trial Expiration

**Goal:** Verify gating works when trial period expires

**Tools Needed:** AsyncStorage inspector or React Native Debugger

**Steps:**

1. **Modify Trial Start Date**
   - Install React Native Debugger or use Flipper
   - Navigate to AsyncStorage
   - Find key: `subscription:trialStartDate`
   - Change value to 8 days ago (timestamp in milliseconds)
   - Example: `Date.now() - (8 * 24 * 60 * 60 * 1000)`

2. **Reopen App**
   - Close and reopen app
   - Navigate to calculator

3. **Observe Gating**
   - Even though you haven't reached 3/3, charts are blurred
   - **Reason:** Trial expired (8 days > 7 days)
   - CTA: "Assine o Plano Pro"

**Why This Works:**

```typescript
canAccessPremiumFeatures = isPro OR (trialActive AND count < 3)
// When trial expires, first condition fails
// If isPro is false and trial is expired, gate activates
```

---

### Scenario 3: Pro Subscription Mock

**Goal:** Verify subscription toggle works and removes blur

**Tools Needed:** Developer console or debug panel

**Steps:**

1. **In Console/Debug Panel**

   ```typescript
   // If you add a debug panel to Home screen:
   const { toggleProMock } = useSubscription();

   // Button that calls:
   toggleProMock(); // isPro toggles: false → true
   ```

2. **Expected Behavior:**
   - Before: `isPro = false` → charts show blur
   - After: `isPro = true` → blur immediately disappears
   - **No calculator limit applies** when isPro is true

3. **Verify Persistence**
   - Close app completely
   - Reopen app
   - **Expected:** isPro still true (persisted in AsyncStorage)

**Code to Add (Temporary Debug Button):**

```typescript
// In app/index.tsx (Home screen), add to bottom:

import { useSubscription } from '@/features/subscription';

export default function Index() {
  // ... existing code ...
  const { isPro, trial, toggleProMock, resetTrial } = useSubscription();

  return (
    <View>
      {/* Existing home content */}

      {/* Temporary debug panel - remove before production */}
      <View style={styles.debugPanel}>
        <Text>Debug: isPro = {isPro ? 'true' : 'false'}</Text>
        <Text>Debug: Trial days left = {trial?.daysRemaining ?? 'N/A'}</Text>
        <Text>Debug: Calcs used = {trial?.calculationsUsed ?? 'N/A'}/3</Text>

        <Pressable onPress={toggleProMock} style={styles.debugButton}>
          <Text>Toggle Pro</Text>
        </Pressable>

        <Pressable onPress={resetTrial} style={styles.debugButton}>
          <Text>Reset Trial</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

---

### Scenario 4: Calculation Counter Persistence

**Goal:** Verify counter persists across app restarts

**Steps:**

1. **Make 2 Calculations**
   - In CDB, do 2 successful calculations
   - Verify counter working

2. **Close App Completely**
   - Not just background, fully close
   - (On Android: adb shell am force-stop)
   - (On iOS: close from app switcher)

3. **Reopen App**
   - Navigate to LCI/LCA (different calculator)

4. **Make 1 More Calculation**
   - Do calculation
   - **Expected:** Calc limit counter shows 3/3 (from previous session + this one)

5. **Try 4th Calculation in Different Calculator (Tesouro)**
   - Switch to Tesouro Direto
   - Try to calculate
   - **Expected:** Charts show blur (4th calculation)
   - **Verification:** Global counter is shared across calculators

---

### Scenario 5: Reset Trial Function

**Goal:** Verify testing utility works for QA

**Steps:**

1. **Set Up: Reach Calc Limit**
   - Make 3 calculations
   - Verify blur on 4th attempt

2. **Call resetTrial()**

   ```typescript
   const { resetTrial } = useSubscription();
   resetTrial(); // In button or console
   ```

3. **Expected Results:**
   - `trialStartDate` = Date.now() (reset to now)
   - `calculationsUsed` = 0
   - `isPro` = false
   - Device ID preserved

4. **Make Calculations Again**
   - First 3 calculations work free
   - 4th one shows blur
   - Counter starts from 0 again

**Use Case:** QA team can quickly reset state without clearing entire app

---

## Automated Testing Examples

### Test: Check AsyncStorage Persistence

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

async function testPersistence() {
  const value = await AsyncStorage.getItem('subscription:calculationsUsed');
  console.log('Persisted calc count:', value);
  // Should be "3" after 3 calculations
  expect(value).toBe('3');
}
```

### Test: Verify Trial Logic

```typescript
import {
  isTrialActive,
  calculateTrialDaysRemaining,
  canAccessPremiumFeatures,
} from '@/features/subscription/utils';

describe('Trial Logic', () => {
  it('should identify active trial', () => {
    const now = Date.now();
    const daysLeft = calculateTrialDaysRemaining(now);
    expect(daysLeft).toBeGreaterThan(0);
  });

  it('should block access after 3 calculations', () => {
    const result = canAccessPremiumFeatures(
      false, // isPro
      Date.now(), // trialStartDate
      3, // calculationsUsed
    );
    expect(result).toBe(false);
  });

  it('should allow access if isPro', () => {
    const result = canAccessPremiumFeatures(
      true, // isPro = true
      null, // trialStartDate (doesn't matter)
      999, // calculationsUsed (doesn't matter)
    );
    expect(result).toBe(true);
  });
});
```

---

## Debugging

### Enable Logging

Add to `features/subscription/context.tsx`:

```typescript
// Add in SubscriptionProvider useEffect
useEffect(() => {
  initializeSubscription();

  // Log state changes
  console.log('🔐 Subscription State:', {
    isPro,
    status,
    trialDaysLeft: trial?.daysRemaining,
    calculationsUsed: trial?.calculationsUsed,
    canAccessPremium: canAccessPremium,
  });
}, [isPro, trial, canAccessPremiumFeatures]);
```

### React Native Debugger

```bash
# Install
brew install react-native-debugger

# Start debugger
open "rndebugger://set-debugger-loc?host=localhost&port=8081"

# In debugger:
# - Redux tab → watch state
# - AsyncStorage tab → inspect persistence
```

### Flipper

```bash
# Native dev tools
# iOS: Cmd+D → Enable Flipper
# Android: Cmd+M → Enable Flipper

# In Flipper app:
# - Databases → SQLite → AsyncStorage
# - Logs → Filter by tag
```

---

## Common Issues & Solutions

### Issue: Counter not incrementing

**Diagnosis:**

```typescript
// Check if calculation succeeded
if (projectionDetails) {
  console.log('✅ Calculation succeeded, should increment');
} else {
  console.log('❌ Calculation failed or errored');
}
```

**Fix:** Ensure calculation has no errors (check error state in calculator)

---

### Issue: Blur not appearing on 4th calc

**Diagnosis:**

```typescript
const { trial, canAccessPremiumFeatures } = useSubscription();
console.log({
  calculationsUsed: trial?.calculationsUsed,
  maxAllowed: trial?.maxCalculationsInTrial,
  canAccess: canAccessPremiumFeatures,
});
```

**Fix:** Verify ProGate component wraps the content that should be gated

---

### Issue: State lost after app restart

**Diagnosis:**

```bash
# Check AsyncStorage persistence
adb shell
run-as com.laccurcio.calculadora
cat databases/RKStorage

# Or use Flipper to inspect
```

**Fix:** Ensure AsyncStorage.setItem() calls have no errors

---

### Issue: Device ID not unique

**Diagnosis:**

```typescript
const { deviceId } = useSubscription();
console.log('Device ID:', deviceId);
// Should be long UUID-like string, not null
```

**Fix:** Check Crypto.randomUUID() availability

---

## Performance Testing

### Measure Initialization Time

```typescript
useEffect(() => {
  const start = performance.now();

  // ... initialization code ...

  const end = performance.now();
  console.log(`⏱️ Subscription init took ${end - start}ms`);
}, []);
```

**Expected:** < 50ms (mostly I/O waiting)

### Monitor State Updates

```typescript
useEffect(() => {
  console.count('Subscription state update');
}, [isPro, trial, canAccessPremiumFeatures]);
```

**Expected:** Should not spam (prevent infinite loops)

---

## Device Testing Checklist

### iOS

- [ ] iPhone (any size)
- [ ] Light mode
- [ ] Dark mode
- [ ] Landscape orientation
- [ ] FaceID/TouchID enabled

### Android

- [ ] Phone (any size)
- [ ] Light mode
- [ ] Dark mode
- [ ] Landscape orientation
- [ ] Fingerprint enabled

### Both Platforms

- [ ] Make 3 calculations
- [ ] Verify blur on 4th
- [ ] Close and reopen app
- [ ] Verify state persists
- [ ] Toggle Pro mock
- [ ] Reset trial

---

## Notes

- **Trial Duration:** 7 days (configurable in `utils.ts`)
- **Calc Limit:** 3 calculations (configurable in `utils.ts`)
- **Testing:** Use `toggleProMock()` and `resetTrial()` for QA
- **Persistence:** AsyncStorage (survives app restart)
- **Device ID:** Prepared for future device-locking

---

## When Ready for Production

1. **Remove Debug Panel** (if added to Home)
2. **Disable Logging** (remove console.logs)
3. **Test Payment Flow** (when integrated)
4. **Verify AsyncStorage Encryption** (device-specific)
5. **Analytics Integration** (track trial conversions)

---

**Questions?** Check `TRIAL_SUBSCRIPTION_IMPLEMENTATION.md` for details.
