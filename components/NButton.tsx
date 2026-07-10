import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { NText } from './NText';
import { useColors } from '@/hooks/useThemeColor';
import { impact } from '@/lib/haptics';
import { Radius, Spacing } from '@/lib/theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface NButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function NButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  icon,
  fullWidth,
  style,
}: NButtonProps) {
  const colors = useColors();

  const handlePress = () => {
    if (disabled || loading) return;
    impact();
    onPress();
  };

  const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };

  const containerStyles: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: colors.primary },
    secondary: { backgroundColor: colors.primaryLight },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.error },
  };

  const textColors: Record<Variant, string> = {
    primary: '#FFFFFF',
    secondary: colors.primary,
    outline: colors.text,
    ghost: colors.primary,
    danger: '#FFFFFF',
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      style={[
        styles.base,
        containerStyles[variant],
        {
          height: heights[size],
          paddingHorizontal: size === 'sm' ? Spacing.md : Spacing.xl,
          opacity: disabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <>
          {icon}
          <NText
            variant={size === 'sm' ? 'footnote' : 'headline'}
            color={textColors[variant]}
            style={icon ? { marginLeft: Spacing.sm } : undefined}
          >
            {title}
          </NText>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
  },
  fullWidth: {
    width: '100%',
  },
});
