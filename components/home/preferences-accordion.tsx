import { useCallback } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import {
  Accordion,
  AccordionContent,
  AccordionContentText,
  AccordionHeader,
  AccordionIcon,
  AccordionItem,
  AccordionTitleText,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button, ButtonGroup, ButtonText } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { ChevronDownIcon, CircleIcon } from '@/components/ui/icon';
import { Radio, RadioGroup, RadioIcon, RadioIndicator, RadioLabel } from '@/components/ui/radio';
import { useSubscription } from '@/features/subscription/context';
import {
  type FontScaleOption,
  type ThemePreference,
  usePreferences,
} from '@/hooks/use-preferences';

type Palette = (typeof import('@/constants/theme').Colors)['light'];

type PreferencesAccordionProps = {
  palette: Palette;
};

type Option<T extends string> = {
  label: string;
  description: string;
  value: T;
};

const THEME_OPTIONS: Option<ThemePreference>[] = [
  {
    value: 'light',
    label: 'Modo claro',
    description: 'Ideal para ambientes bem iluminados e foco nos detalhes.',
  },
  {
    value: 'dark',
    label: 'Modo escuro',
    description: 'Protege os olhos em ambientes com pouca luz.',
  },
];

const FONT_OPTIONS: Option<FontScaleOption>[] = [
  {
    value: 'normal',
    label: 'Padrão',
    description: 'Escala equilibrada para a maioria das pessoas.',
  },
  {
    value: 'medium',
    label: 'Médio',
    description: 'Aumenta o texto em aproximadamente 10%.',
  },
  {
    value: 'large',
    label: 'Grande',
    description: 'Dá ainda mais destaque aos textos, +25%.',
  },
];

export function PreferencesAccordion({ palette }: PreferencesAccordionProps) {
  const { themePreference, setThemePreference, fontScale, setFontScale, hydrated } =
    usePreferences();
  const {
    isPro,
    status,
    trial,
    canAccessPremiumFeatures,
    toggleProMock,
    resetTrial,
    isLoading: subLoading,
  } = useSubscription();

  const handleThemeChange = useCallback(
    (nextValue: ThemePreference) => {
      setThemePreference(nextValue);
    },
    [setThemePreference],
  );

  const handleFontScaleChange = useCallback(
    (nextValue: FontScaleOption) => {
      setFontScale(nextValue);
    },
    [setFontScale],
  );

  return (
    <ThemedView style={[styles.card, { borderColor: palette.icon }]}>
      <Accordion type="multiple" defaultValue={['theme']} variant="unfilled">
        <AccordionItem value="theme">
          <AccordionHeader>
            <AccordionTrigger>
              <AccordionTitleText>Aparência</AccordionTitleText>
              <AccordionIcon as={ChevronDownIcon} />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <AccordionContentText>
              Escolha entre os temas claro e escuro para o aplicativo inteiro.
            </AccordionContentText>
            <RadioGroup
              value={themePreference}
              onChange={(value) => handleThemeChange(value as ThemePreference)}
              className="gap-3 mt-3">
              {THEME_OPTIONS.map((option) => (
                <PreferenceOption
                  key={option.value}
                  option={option}
                  descriptionColor={palette.icon}
                  isDisabled={!hydrated}
                />
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        <Divider />

        <AccordionItem value="font">
          <AccordionHeader>
            <AccordionTrigger>
              <AccordionTitleText>Tamanho do texto</AccordionTitleText>
              <AccordionIcon as={ChevronDownIcon} />
            </AccordionTrigger>
          </AccordionHeader>
          <AccordionContent>
            <AccordionContentText>
              Ajuste o tamanho das fontes usadas na home e nas calculadoras.
            </AccordionContentText>
            <RadioGroup
              value={fontScale}
              onChange={(value) => handleFontScaleChange(value as FontScaleOption)}
              className="gap-3 mt-3">
              {FONT_OPTIONS.map((option) => (
                <PreferenceOption
                  key={option.value}
                  option={option}
                  descriptionColor={palette.icon}
                  isDisabled={!hydrated}
                />
              ))}
            </RadioGroup>
          </AccordionContent>
        </AccordionItem>

        {__DEV__ && (
          <>
            <Divider />
            <AccordionItem value="dev-subscription">
              <AccordionHeader>
                <AccordionTrigger>
                  <AccordionTitleText>Assinatura (Dev)</AccordionTitleText>
                  <AccordionIcon as={ChevronDownIcon} />
                </AccordionTrigger>
              </AccordionHeader>
              <AccordionContent>
                <AccordionContentText>
                  Estado atual: {isPro ? 'Pro' : status === 'trial' ? 'Trial' : 'Expirado'}
                </AccordionContentText>
                <AccordionContentText>
                  Acesso premium: {canAccessPremiumFeatures ? 'Sim' : 'Não'}
                </AccordionContentText>
                {trial && (
                  <AccordionContentText>
                    Trial: {trial.daysRemaining} dias restantes · {trial.calculationsUsed}/
                    {trial.maxCalculationsInTrial} cálculos
                  </AccordionContentText>
                )}

                <ButtonGroup className="mt-3" flexDirection="row" space="sm">
                  <Button
                    onPress={toggleProMock}
                    action="secondary"
                    variant="outline"
                    size="sm"
                    disabled={subLoading}>
                    <ButtonText>Alternar Pro</ButtonText>
                  </Button>
                  <Button
                    onPress={resetTrial}
                    action="negative"
                    variant="outline"
                    size="sm"
                    disabled={subLoading}>
                    <ButtonText>Reiniciar Trial</ButtonText>
                  </Button>
                </ButtonGroup>
              </AccordionContent>
            </AccordionItem>
          </>
        )}
      </Accordion>
    </ThemedView>
  );
}

type PreferenceOptionProps<T extends string> = {
  option: Option<T>;
  descriptionColor: string;
  isDisabled: boolean;
};

function PreferenceOption<T extends string>({
  option,
  descriptionColor,
  isDisabled,
}: PreferenceOptionProps<T>) {
  return (
    <Radio value={option.value} isDisabled={isDisabled}>
      <RadioIndicator>
        <RadioIcon as={CircleIcon} />
      </RadioIndicator>
      <ThemedView style={styles.optionCopy}>
        <RadioLabel>{option.label}</RadioLabel>
        <ThemedText style={[styles.optionDescription, { color: descriptionColor }]}>
          {option.description}
        </ThemedText>
      </ThemedView>
    </Radio>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 0,
    padding: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  optionCopy: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  optionDescription: {
    fontSize: 13,
    marginTop: 4,
    opacity: 0.6,
    lineHeight: 18,
  },
});
