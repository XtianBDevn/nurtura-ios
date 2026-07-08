import React from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NText } from './NText';
import { useColors } from '@/hooks/useThemeColor';
import type { CarePlan, RiskLevel } from '@/lib/carePlan';

const RISK_META: Record<RiskLevel, { label: string; color: keyof ReturnType<typeof useColors> }> = {
  low: { label: 'Lower need', color: 'success' },
  moderate: { label: 'Moderate need', color: 'warning' },
  high: { label: 'Higher need', color: 'error' },
};

interface CarePlanCardProps {
  plan: CarePlan;
  /** When true, render a lighter inline variant (e.g. dashboard). */
  compact?: boolean;
}

/** Presents a generated care plan: risk band, focus areas, and suggested actions. */
export function CarePlanCard({ plan, compact = false }: CarePlanCardProps) {
  const colors = useColors();
  const risk = RISK_META[plan.riskLevel];
  const riskColor = colors[risk.color] as string;

  return (
    <View className="rounded-2xl border border-border bg-card p-5">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View
            className="w-9 h-9 rounded-xl items-center justify-center mr-2.5"
            style={{ backgroundColor: colors.primaryLight }}
          >
            <Ionicons name="sparkles" size={18} color={colors.primary} />
          </View>
          <NText variant="headline" bold>Care Plan</NText>
        </View>
        <View
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: `${riskColor}22` }}
        >
          <NText variant="caption2" bold color={riskColor}>
            {risk.label.toUpperCase()}
          </NText>
        </View>
      </View>

      <NText variant="subheadline" muted style={{ marginBottom: 14 }}>
        {plan.summary}
      </NText>

      {plan.focusAreas.length > 0 && (
        <>
          <NText variant="caption1" bold muted style={{ marginBottom: 8 }}>
            FOCUS AREAS
          </NText>
          <View className="flex-row flex-wrap mb-3">
            {plan.focusAreas.map((f) => (
              <View
                key={f}
                className="px-3 py-1.5 rounded-full mr-2 mb-2"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <NText variant="caption1" color={colors.primary} bold>{f}</NText>
              </View>
            ))}
          </View>
        </>
      )}

      {!compact && plan.suggestions.length > 0 && (
        <>
          <NText variant="caption1" bold muted style={{ marginBottom: 8 }}>
            SUGGESTED ACTIONS
          </NText>
          <View style={{ gap: 10 }}>
            {plan.suggestions.map((s) => (
              <View key={s} className="flex-row items-start">
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={colors.primary}
                  style={{ marginTop: 1 }}
                />
                <NText variant="subheadline" style={{ marginLeft: 8, flex: 1 }}>
                  {s}
                </NText>
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );
}
