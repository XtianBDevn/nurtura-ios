import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useThemeColor';
import { resolveIconName } from '@/lib/icons';

interface PremiumAvatarProps {
  value?: string;
  size?: number;
  selected?: boolean;
}

export function PremiumAvatar({ value, size = 48, selected = false }: PremiumAvatarProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: selected ? colors.primary : colors.primaryLight,
          borderColor: selected ? colors.primary : colors.borderLight,
        },
      ]}
    >
      <Ionicons
        name={resolveIconName(value)}
        size={Math.round(size * 0.46)}
        color={selected ? '#FFFFFF' : colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
});

