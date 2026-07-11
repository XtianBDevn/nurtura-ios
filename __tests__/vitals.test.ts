import { buildVitalLogPayload } from '../lib/vitals';

describe('buildVitalLogPayload', () => {
  it('formats a blood pressure reading for storage', () => {
    expect(
      buildVitalLogPayload({
        vitalType: 'blood_pressure',
        systolic: '120',
        diastolic: '80',
      }),
    ).toEqual({
      title: 'Blood pressure',
      description: '120/80 mmHg',
      vitalType: 'blood_pressure',
      vitalValue: '120/80',
      vitalUnit: 'mmHg',
    });
  });

  it('formats a heart rate reading', () => {
    expect(
      buildVitalLogPayload({
        vitalType: 'heart_rate',
        heartRate: '78',
      }),
    ).toEqual({
      title: 'Heart rate',
      description: '78 bpm',
      vitalType: 'heart_rate',
      vitalValue: '78',
      vitalUnit: 'bpm',
    });
  });
});
