import React from 'react';
import { View, ScrollView, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NText } from './NText';
import { NButton } from './NButton';
import { useColors } from '@/hooks/useThemeColor';

interface StepShellProps {
  stepIndex: number;
  totalSteps: number;
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  loading?: boolean;
  onSkip?: () => void;
  fade?: Animated.Value;
}

/**
 * Shared scaffold for an onboarding step: a segmented progress bar, an
 * animated header (icon + title + subtitle), scrollable body, and a sticky
 * footer with Back / Continue (+ optional Skip).
 */
export function StepShell({
  stepIndex,
  totalSteps,
  icon,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = 'Continue',
  nextDisabled,
  loading,
  onSkip,
  fade,
}: StepShellProps) {
  const colors = useColors();
  const Body = fade ? Animated.View : View;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Progress */}
      <View className="flex-row px-5 pt-2" style={{ gap: 4 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            className="flex-1 rounded-full"
            style={{
              height: 4,
              backgroundColor: i <= stepIndex ? colors.primary : colors.surfaceMuted,
            }}
          />
        ))}
      </View>

      <Body style={fade ? { flex: 1, opacity: fade } : { flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {icon && (
            <View
              className="w-16 h-16 rounded-full items-center justify-center self-center mb-5 mt-2"
              style={{ backgroundColor: colors.primaryLight }}
            >
              <Ionicons name={icon} size={30} color={colors.primary} />
            </View>
          )}
          <NText variant="title1" bold center>{title}</NText>
          {subtitle ? (
            <NText variant="subheadline" muted center style={{ marginTop: 8, marginBottom: 24 }}>
              {subtitle}
            </NText>
          ) : (
            <View style={{ height: 20 }} />
          )}

          {children}
        </ScrollView>
      </Body>

      {/* Sticky footer */}
      <View
        className="px-5 pt-3 border-t border-border"
        style={{ paddingBottom: 8 }}
      >
        <View className="flex-row items-center">
          {onBack ? (
            <NButton title="← Back" variant="ghost" onPress={onBack} />
          ) : null}
          <NButton
            title={nextLabel}
            onPress={onNext}
            disabled={nextDisabled}
            loading={loading}
            size="lg"
            style={{ flex: 1, marginLeft: onBack ? 8 : 0 }}
          />
        </View>
        {onSkip ? (
          <NButton
            title="Skip for now"
            variant="ghost"
            size="sm"
            onPress={onSkip}
            style={{ alignSelf: 'center', marginTop: 4 }}
          />
        ) : null}
      </View>
    </SafeAreaView>
  );
}
