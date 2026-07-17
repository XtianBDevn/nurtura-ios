import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NText } from './NText';
import { useColors } from '@/hooks/useThemeColor';
import { ImpactFeedbackStyle, impact } from '@/lib/haptics';
import { Radius, Spacing } from '@/lib/theme';
import { resolveIconName } from '@/lib/icons';

interface SelectionCardProps {
  title: string;
  subtitle?: string;
  icon?: string;
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
          backgroundColor: selected ? colors.primaryLight : colors.card,
          borderColor: selected ? colors.primary : colors.borderLight,
        },
      ]}
    >
      <View style={styles.content}>
        {icon && (
          <View style={[styles.iconWell, { backgroundColor: selected ? colors.card : colors.surfaceMuted }]}>
            <Ionicons name={resolveIconName(icon)} size={21} color={colors.primary} />
          </View>
        )}
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
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    shadowColor: '#10221D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconWell: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
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
