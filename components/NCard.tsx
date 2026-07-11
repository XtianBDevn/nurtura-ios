import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { useColors } from '@/hooks/useThemeColor';
import { Radius, Spacing } from '@/lib/theme';

interface NCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  elevated?: boolean;
}

export function NCard({ children, style, padded = true, elevated = false }: NCardProps) {
  const colors = useColors();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: elevated ? colors.cardRaised ?? colors.card : colors.card,
          borderColor: colors.borderLight,
        },
        elevated && styles.elevated,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#10221D',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 2,
  },
  elevated: {
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.1,
    shadowRadius: 26,
    elevation: 4,
  },
  padded: {
    padding: Spacing.lg,
  },
});
