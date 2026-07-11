export type VitalType = 'blood_pressure' | 'heart_rate' | 'blood_oxygen' | 'ekg';

export interface VitalLogPayloadArgs {
  vitalType: VitalType;
  systolic?: string;
  diastolic?: string;
  heartRate?: string;
  bloodOxygen?: string;
}

export function buildVitalLogPayload(args: VitalLogPayloadArgs) {
  switch (args.vitalType) {
    case 'blood_pressure': {
      const systolic = args.systolic?.trim();
      const diastolic = args.diastolic?.trim();
      const value = systolic && diastolic ? `${systolic}/${diastolic}` : '';
      return {
        title: 'Blood pressure',
        description: value ? `${value} mmHg` : 'Blood pressure reading',
        vitalType: 'blood_pressure',
        vitalValue: value,
        vitalUnit: 'mmHg',
      };
    }
    case 'heart_rate': {
      const rate = args.heartRate?.trim();
      return {
        title: 'Heart rate',
        description: rate ? `${rate} bpm` : 'Heart rate reading',
        vitalType: 'heart_rate',
        vitalValue: rate,
        vitalUnit: 'bpm',
      };
    }
    case 'blood_oxygen': {
      const oxygen = args.bloodOxygen?.trim();
      return {
        title: 'Blood oxygen',
        description: oxygen ? `${oxygen}%` : 'Blood oxygen reading',
        vitalType: 'blood_oxygen',
        vitalValue: oxygen,
        vitalUnit: '%',
      };
    }
    default:
      return {
        title: 'EKG',
        description: 'Upcoming feature',
        vitalType: 'ekg',
        vitalValue: '',
        vitalUnit: '',
      };
  }
}
