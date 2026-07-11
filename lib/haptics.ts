import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

type ImpactStyle = Haptics.ImpactFeedbackStyle;
type NotificationType = Haptics.NotificationFeedbackType;

const runHaptic = (callback: () => Promise<void>) => {
  if (Platform.OS === 'web') return;

  try {
    callback().catch(() => {
      // Haptics are optional feedback. Missing native modules should not block use.
    });
  } catch {
    // Expo web can throw synchronously for unavailable native haptic methods.
  }
};

export const impact = (style: ImpactStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (typeof Haptics.impactAsync !== 'function') return;
  runHaptic(() => Haptics.impactAsync(style));
};

export const selection = () => {
  if (typeof Haptics.selectionAsync !== 'function') return;
  runHaptic(() => Haptics.selectionAsync());
};

export const notification = (
  type: NotificationType = Haptics.NotificationFeedbackType.Success,
) => {
  if (typeof Haptics.notificationAsync !== 'function') return;
  runHaptic(() => Haptics.notificationAsync(type));
};

export const ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle;
export const NotificationFeedbackType = Haptics.NotificationFeedbackType;
