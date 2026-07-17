import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { PremiumAvatar } from './PremiumAvatar';
import { useColors } from '@/hooks/useThemeColor';
import { impact } from '@/lib/haptics';
import { Spacing, Radius } from '@/lib/theme';

const AVATARS = [
  'person-outline',
  'person-circle-outline',
  'happy-outline',
  'accessibility-outline',
  'heart-outline',
  'sunny-outline',
  'leaf-outline',
  'people-outline',
];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {AVATARS.map((avatar) => (
        <TouchableOpacity
          key={avatar}
          onPress={() => {
            impact();
            onSelect(avatar);
          }}
          style={[
            styles.avatarBtn,
            {
              backgroundColor: colors.card,
              borderColor: selected === avatar ? colors.primary : colors.borderLight,
            },
          ]}
        >
          <PremiumAvatar value={avatar} size={44} selected={selected === avatar} />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  avatarBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});
