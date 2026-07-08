import { generateCarePlan } from '@/lib/carePlan';

describe('generateCarePlan', () => {
  it('creates a low-risk wellness plan when intake has no major risks', () => {
    const plan = generateCarePlan({
      mobility: 'independent',
      fallRisk: 'low',
      cognitiveStatus: 'alert',
      adl: [{ key: 'bathing', level: 2 }],
      iadl: [{ key: 'cooking', level: 2 }],
    });

    expect(plan.riskLevel).toBe('low');
    expect(plan.focusAreas).toContain('General wellness');
    expect(plan.summary).toContain('lower-need');
  });

  it('prioritizes fall prevention, memory support, and medication management for high-risk intake', () => {
    const plan = generateCarePlan({
      conditions: ['dementia', 'diabetes', 'hypertension', 'osteoporosis'],
      currentMedications: ['A', 'B', 'C', 'D', 'E'],
      mobility: 'walker',
      fallRisk: 'high',
      cognitiveStatus: 'moderate',
      adl: [
        { key: 'bathing', level: 0 },
        { key: 'dressing', level: 1 },
      ],
      iadl: [{ key: 'transport', level: 0 }],
      qualityOfLife: {
        mood: 1,
        pain: 3,
        sleep: 1,
        social: 1,
        energy: 1,
      },
    });

    expect(plan.riskLevel).toBe('high');
    expect(plan.focusAreas).toEqual(
      expect.arrayContaining([
        'Fall prevention',
        'Memory & routine support',
        'Blood sugar monitoring',
        'Heart & blood pressure',
        'Medication management',
        'Daily living assistance',
        'Pain management',
        'Emotional wellbeing',
      ]),
    );
    expect(plan.suggestions).toEqual(
      expect.arrayContaining([
        'Clear walking paths and add grab bars in the bathroom.',
        'Use a pill organizer; review for interactions (polypharmacy).',
      ]),
    );
  });
});
