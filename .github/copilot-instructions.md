# Copilot Instructions

## Project Map

- Expo Router drives navigation with a Stack declared in app/\_layout.tsx; the layout wraps everything in SafeAreaProvider/SafeAreaView, syncs GluestackUIProvider + ThemeProvider to useColorScheme, and registers index plus calculators/cdb, calculators/lci-lca, calculators/tesouro, and modal routes.
- app/index.tsx now just orchestrates the Home dashboard, composing components/home/\* (header, menu list, subscription banner) with data sourced from app/home/calculators.ts.
- app/calculators/\* hosts each calculator screen (currently placeholders) that inherit the shared stack; app/modal.tsx stays available for modal flows.
- hooks/\* supplies theming helpers (use-color-scheme, use-theme-color); constants/theme.ts stores palette + platform font tokens; scripts/reset-project.js can nuke or archive app/components/hooks/constants/scripts into app-example.

## Styling & Theming

- Tailwind + Nativewind power styling: global.css is imported once inside app/\_layout.tsx and metro.config.js wraps the Metro config with withNativeWind({ input: "./global.css" }).
- GluestackUIProvider (components/ui/gluestack-ui-provider) sets CSS vars via nativewind vars(); keep it at the root and pass mode to sync with Nativewind’s colorScheme.
- tailwind.config.js whitelists (bg|text|stroke|fill)-(primary|...) tokens so production builds keep dynamic classes; extend this safelist when inventing new token prefixes.
- ThemedText/ThemedView read Colors from constants/theme.ts through hooks/use-theme-color.ts, so prefer them for inline styles that must stay light/dark aware.

## UI Kit usage

- components/ui/\*\* house Gluestack wrappers (see components/ui/button/index.tsx) built with createX helpers and tva(); favor className props over StyleSheet to inherit variants.
- Subcomponents such as ButtonText/ButtonIcon dig context via useStyleContext; when composing buttons, render those exact exports to keep typography + spacing variants in sync.
- IconSymbol (components/ui/icon-symbol.tsx) maps SF Symbol names to MaterialIcons; keep MAPPING in sync whenever you introduce a new symbol (Home already adds menu, bell, chart, bank, and banknote icons).

## Screens & Patterns

- app/index.tsx composes the Home dashboard via `components/home/*`: `home-header.tsx` handles the hero row, `calculator-menu-list.tsx` renders card links, `subscription-banner.tsx` keeps the CTA isolated, and `section-heading.tsx` centralizes typography. Extend `app/home/calculators.ts` when adding flows.
- app/calculators/\* currently contain ThemedView/Text placeholders; reuse their padding/gap scales when replacing them with real calculators to remain consistent with the Home spacing.
- components/parallax-scroll-view.tsx depends on react-native-reanimated’s useScrollOffset; keep the top-level import "react-native-reanimated" inside app/\_layout.tsx before using this helper elsewhere.

## Module resolution & assets

- babel.config.js and tsconfig.json share the "@/..." alias plus a tailwind.config alias; always import app code via "@/path" so Metro, TS, and Jest (if added) stay aligned.
- Assets under assets/images load via require("@/assets/...") which keeps Expo asset resolution for multi-density bundles; stick to that pattern for new media.

## Workflows

- Install deps with npm install (lockfile is package-lock.json).
- Dev server: npm start (alias expo start); or npm run android/ios/web to jump straight into a platform target.
- Quality gate: npm run lint uses expo-config plus eslint-plugin-prettier, so formatting issues surface as lint errors.
- Reset template carefully: npm run reset-project moves or deletes app/components/hooks/constants/scripts before scaffolding a blank app dir.

## Integration notes

- When you invent new Nativewind tokens or Gluestack variants, update both components/ui/gluestack-ui-provider/config.ts (CSS vars) and tailwind.config.js to keep light/dark palettes in parity.
- For system color toggles, sync GluestackUIProvider’s mode prop with hooks/use-color-scheme.ts so ThemeProvider, Nativewind, and Colors stay consistent.
- Expo SDK 54 pins react-native 0.81.5/react 19.1; upgrade all trio (expo, react-native, react) together to avoid Metro/version skew.
