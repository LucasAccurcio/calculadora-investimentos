import { calculateProjection, ProjectionInputs, ProjectionResult } from './cdb-calculations';

export type LciLcaProjectionResult = Omit<ProjectionResult, 'taxRate' | 'taxAmount' | 'net'> & {
  net: number;
  taxRate: 0;
  taxAmount: 0;
};

export function calculateLciLcaProjection(inputs: ProjectionInputs): LciLcaProjectionResult {
  const result = calculateProjection(inputs);
  return {
    ...result,
    taxRate: 0,
    taxAmount: 0,
    net: result.gross,
  };
}
