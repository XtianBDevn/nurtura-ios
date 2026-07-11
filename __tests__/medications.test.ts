import { formatMedicationSummary } from '../lib/medications';

describe('formatMedicationSummary', () => {
  it('combines the medication name, dosage/frequency, and instructions', () => {
    expect(
      formatMedicationSummary({
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'twice daily',
        instructions: 'Take with food',
      }),
    ).toBe('Metformin · 500mg · twice daily · Take with food');
  });

  it('omits empty fields without leaving broken separators', () => {
    expect(formatMedicationSummary({ name: 'Vitamin D' })).toBe('Vitamin D');
  });
});
