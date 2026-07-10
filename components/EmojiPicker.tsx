import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { NText } from './NText';
import { useColors } from '@/hooks/useThemeColor';
import { impact } from '@/lib/haptics';
import { Spacing, Radius } from '@/lib/theme';

const EMOJIS = ['👴', '👵', '👶', '🧓', '👤', '💜', '🌻', '🐾'];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  const colors = useColors();

  return (
    <View style={styles.container}>
      {EMOJIS.map((emoji) => (
        <TouchableOpacity
          key={emoji}
          onPress={() => {
            impact();
            onSelect(emoji);
          }}
          style={[
            styles.emojiBtn,
            {
              backgroundColor: selected === emoji ? colors.primaryLight : colors.surfaceMuted,
              borderColor: selected === emoji ? colors.primary : 'transparent',
              transform: [{ scale: selected === emoji ? 1.1 : 1 }],
            },
          ]}
        >
          <NText variant="title2">{emoji}</NText>
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
  emojiBtn: {
    width: 56,
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
});
