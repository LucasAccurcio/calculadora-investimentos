export type CalculatorFieldKey = 'initial' | 'monthly' | 'months' | 'cdi' | 'percent' | 'final';

export type CalculatorParsedInputs = {
  initial?: number;
  monthly?: number;
  months?: number;
  cdi?: number;
  percent?: number;
  final?: number;
};

export type CalculatorInputs = Required<
  Pick<CalculatorParsedInputs, 'initial' | 'monthly' | 'months' | 'cdi' | 'percent'>
>;
