import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NText } from './NText';
import { useColors } from '@/hooks/useThemeColor';
import { ImpactFeedbackStyle, impact } from '@/lib/haptics';
import { Radius, Spacing } from '@/lib/theme';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon?: string; // emoji
  ionIcon?: keyof typeof Ionicons.glyphMap;
  selected: boolean;
  onPress: () => void;
  badge?: string;
}

export function SelectionCard({
  title,
  subtitle,
  icon,
  ionIcon,
  selected,
  onPress,
  badge,
}: SelectionCardProps) {
  const colors = useColors();

  const handlePress = () => {
    impact(ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.primaryLight : colors.surfaceMuted,
          borderColor: selected ? colors.primary : 'transparent',
        },
      ]}
    >
      <View style={styles.content}>
        {icon && <NText variant="title2" style={styles.emoji}>{icon}</NText>}
        {ionIcon && (
          <Ionicons
            name={ionIcon}
            size={24}
            color={selected ? colors.primary : colors.textSecondary}
            style={styles.ionIcon}
          />
        )}
        <View style={styles.text}>
          <NText variant="headline">{title}</NText>
          {subtitle && <NText variant="footnote" muted>{subtitle}</NText>}
        </View>
        {badge && (
          <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}>
            <NText variant="caption2" color={colors.primary}>{badge}</NText>
          </View>
        )}
      </View>
      {selected && (
        <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name="checkmark" size={14} color="#FFF" />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 2,
    marginBottom: Spacing.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    marginRight: Spacing.md,
  },
  ionIcon: {
    marginRight: Spacing.md,
  },
  text: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
});
