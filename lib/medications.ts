export interface MedicationSummaryFields {
  name?: string;
  dosage?: string;
  frequency?: string;
  instructions?: string;
}

export function formatMedicationSummary(fields: MedicationSummaryFields) {
  const parts = [fields.name, fields.dosage, fields.frequency, fields.instructions].filter(
    (value) => Boolean(value && value.trim()),
  );

  return parts.join(' · ');
}
