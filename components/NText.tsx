import React from 'react';
import { Text, TextProps } from 'react-native';
import { Typography } from '@/lib/theme';
import { useColors } from '@/hooks/useThemeColor';

type Variant = keyof typeof Typography;

interface NTextProps extends TextProps {
  variant?: Variant;
  color?: string;
  center?: boolean;
  bold?: boolean;
  muted?: boolean;
}

export function NText({
  variant = 'body',
  color,
  center,
  bold,
  muted,
  style,
  ...props
}: NTextProps) {
  const colors = useColors();
  const typo = Typography[variant];

  return (
    <Text
      style={[
        typo,
        {
          color: color ?? (muted ? colors.textSecondary : colors.text),
          textAlign: center ? 'center' : undefined,
          fontWeight: bold ? '700' : typo.fontWeight,
        },
        style,
      ]}
      {...props}
    />
  );
}
