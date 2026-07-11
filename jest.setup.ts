import '@testing-library/jest-native/extend-expect';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
  },
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('@expo/vector-icons', () => {
  return {
    Ionicons: () => null,
  };
});
