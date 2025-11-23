# Calculadora de Investimentos

> Aplicativo Expo/React Native para comparar retornos de CDB, LCI/LCA, Tesouro e futuras aplicações financeiras. A UI é construída com NativeWind + Gluestack UI para garantir consistência entre Android, iOS e Web.

## Tecnologias principais

- Expo Router (SDK 54) + React Native 0.81.5
- TypeScript com paths `@/...` configurados em `tsconfig.json`
- NativeWind + Tailwind (`global.css` + `tailwind.config.js`)
- Gluestack UI (componentes em `components/ui/*`)

## Como começar

1. Instale as dependências

   ```bash
   npm install
   ```

2. Inicie o app (Metro + menu de plataformas)

   ```bash
   npm run start
   # ou npm run android / ios / web
   ```

3. Verifique formatação e qualidade sempre que possível

   ```bash
   npm run lint
   ```

## Estrutura do projeto

```
app/
  _layout.tsx              # Stack + provedores globais
  index.tsx                # Dashboard principal
  home/                    # Dados e seções do dashboard
  calculators/
    components/            # Blocos reutilizáveis (ex.: CalculatorInput)
    utils/                 # Formatação, CDI e cálculos financeiros
    cdb/
      index.tsx            # Tela da calculadora
      style.ts             # Stylesheet específico
      components/          # UI exclusiva (ex.: ProjectionSummary)
    lci-lca.tsx, tesouro.tsx (em transição para a estrutura acima)
components/
  home/, ui/, themed-*     # UI compartilhada para todo o app
hooks/, constants/, assets/
```

## Padrões das calculadoras

- Cada produto fica em `app/calculators/<produto>/` com `index.tsx`, `style.ts` e, quando necessário, `components/` para blocos exclusivos.
- Utilize `app/calculators/components` antes de criar novos inputs ou wrappers. `CalculatorInput` já inclui label, helper e botão de limpar inline.
- Lógica de formato, parsing e CDI deve morar em `app/calculators/utils`. Se outro produto precisar de cálculos próprios, adicione um arquivo novo nessa pasta e importe de lá.
- Todas as telas de formulário devem usar `KeyboardAwareScrollView` com `extraScrollHeight` padronizado, conforme o exemplo do CDB.

## Scripts úteis

| Script                  | Descrição                                                       |
| ----------------------- | --------------------------------------------------------------- |
| `npm run start`         | Abre o menu do Expo para iniciar Android/iOS/Web ou Expo Go.    |
| `npm run android`       | Inicia diretamente no emulador Android.                         |
| `npm run ios`           | Inicia no simulador iOS (macOS).                                |
| `npm run web`           | Executa o bundler web.                                          |
| `npm run lint`          | ESLint + Prettier (usa `expo lint`).                            |
| `npm run reset-project` | Move o template para `app-example/` e cria um `app/` em branco. |

## Convenções

- Use `ThemedText` e `ThemedView` para herdar automaticamente as cores de `constants/theme.ts`.
- Sempre que precisar de novos tokens, sincronize `components/ui/gluestack-ui-provider/config.ts` e `tailwind.config.js`.
- Prefira importar com `@/` para manter Metro, TypeScript e lint alinhados.
- Componentes novos devem vir acompanhados de comentários sucintos somente onde o código não for autoexplicativo.
