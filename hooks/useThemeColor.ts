import { Colors } from '@/lib/theme';
import { useColorScheme } from './useColorScheme';

export function useThemeColor(
  colorName: keyof typeof Colors.light,
  props?: { light?: string; dark?: string }
) {
  const scheme = useColorScheme();
  const colorFromProps = props?.[scheme];
  if (colorFromProps) return colorFromProps;
  return Colors[scheme][colorName];
}

export function useColors() {
  const scheme = useColorScheme();
  return Colors[scheme];
}
