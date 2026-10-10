import React from 'react';
import { render } from '@testing-library/react-native';
import { CarePlanCard } from '@/components/CarePlanCard';
import type { CarePlan } from '@/lib/carePlan';
import { MEDICAL_DISCLAIMER } from '@/lib/legal';

const plan: CarePlan = {
  riskLevel: 'moderate',
  riskScore: 6.5,
  focusAreas: ['Fall prevention', 'Medication management'],
  suggestions: [
    'Clear walking paths and add grab bars in the bathroom.',
    'Set reminders so no medication doses are missed.',
  ],
  summary:
    'This is a moderate-need care plan focused on fall prevention and medication management.',
};

describe('CarePlanCard', () => {
  it('renders summary, risk level, focus areas, and suggestions', () => {
    const screen = render(<CarePlanCard plan={plan} />);

    expect(screen.getByText('Care Plan')).toBeTruthy();
    expect(screen.getByText('MODERATE NEED')).toBeTruthy();
    expect(screen.getByText(plan.summary)).toBeTruthy();
    expect(screen.getByText('Fall prevention')).toBeTruthy();
    expect(
      screen.getByText('Clear walking paths and add grab bars in the bathroom.'),
    ).toBeTruthy();
    expect(screen.getByText(MEDICAL_DISCLAIMER)).toBeTruthy();
  });
});
