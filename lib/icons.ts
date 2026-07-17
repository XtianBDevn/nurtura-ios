import { Ionicons } from '@expo/vector-icons';

export type AppIconName = keyof typeof Ionicons.glyphMap;

const LEGACY_ICON_MAP: Record<string, AppIconName> = {
  '👴': 'person-outline',
  '👵': 'person-outline',
  '👶': 'happy-outline',
  '🧓': 'person-outline',
  '👤': 'person-outline',
  '💜': 'heart-outline',
  '🌻': 'sunny-outline',
  '🐾': 'paw-outline',
  '♿': 'accessibility-outline',
  '💚': 'heart-outline',
  '🩺': 'medical-outline',
  '🤝': 'people-outline',
  '💊': 'medical-outline',
  '✅': 'checkmark-circle-outline',
  '🏥': 'business-outline',
  '🔁': 'repeat-outline',
  '🗓️': 'calendar-outline',
  '📅': 'calendar-number-outline',
  '💓': 'pulse-outline',
  '🍽️': 'restaurant-outline',
  '🏃': 'walk-outline',
  '😊': 'happy-outline',
  '🙂': 'happy-outline',
  '😐': 'remove-circle-outline',
  '😟': 'sad-outline',
  '😢': 'sad-outline',
  '📝': 'document-text-outline',
  '🩸': 'water-outline',
  '🫁': 'fitness-outline',
  '💉': 'medical-outline',
  '❤️': 'heart-outline',
  '🦴': 'body-outline',
  '🧠': 'fitness-outline',
  '🎗️': 'ribbon-outline',
  '🫘': 'medical-outline',
  '💭': 'chatbubble-ellipses-outline',
  '👁️': 'eye-outline',
  '👂': 'ear-outline',
};

export function resolveIconName(value?: string, fallback: AppIconName = 'person-outline'): AppIconName {
  if (!value) return fallback;
  if (LEGACY_ICON_MAP[value]) return LEGACY_ICON_MAP[value];
  if (value in Ionicons.glyphMap) return value as AppIconName;
  return fallback;
}

