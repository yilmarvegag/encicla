import { defineStepper } from '@stepperize/react';
import { step1Schema, step2Schema, step3Schema } from './schemas';

export const { useStepper, steps, utils } = defineStepper(
  { id: 'step1', label: 'Información Básica', schema: step1Schema },
  { id: 'step2', label: 'Tipo de Usuario',   schema: step2Schema },
  { id: 'step3', label: 'Información Adicional', schema: step3Schema },
);