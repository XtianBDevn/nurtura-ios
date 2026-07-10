import React from 'react';
import { Pressable, View } from 'react-native';
import { NText } from './NText';
import { selection } from '@/lib/haptics';

interface ScaleSelectorProps {
  /** Number of steps, e.g. 3 → 0,1,2 or 5 → 0..4 */
  steps: number;
  value: number | null;
  onChange: (v: number) => void;
  /** Optional labels under each step (length should equal steps). */
  labels?: string[];
  /** Optional labels for the two ends, shown above. */
  lowLabel?: string;
  highLabel?: string;
}

/**
 * Segmented 0..N selector used for ADL/IADL independence and
 * quality-of-life scales. Fully self-contained and theme-aware.
 */
export function ScaleSelector({
  steps,
  value,
  onChange,
  labels,
  lowLabel,
  highLabel,
}: ScaleSelectorProps) {
  return (
    <View>
      {(lowLabel || highLabel) && (
        <View className="flex-row justify-between mb-1.5">
          <NText variant="caption2" muted>{lowLabel}</NText>
          <NText variant="caption2" muted>{highLabel}</NText>
        </View>
      )}
      <View className="flex-row" style={{ gap: 8 }}>
        {Array.from({ length: steps }).map((_, i) => {
          const selected = value === i;
          return (
            <Pressable
              key={i}
              onPress={() => {
                selection();
                onChange(i);
              }}
              className={`flex-1 items-center justify-center rounded-lg border py-3 ${
                selected ? 'bg-primary border-primary' : 'bg-surface-muted border-transparent'
              }`}
            >
              <NText
                variant="headline"
                color={selected ? '#FFFFFF' : undefined}
                bold={selected}
              >
                {i}
              </NText>
            </Pressable>
          );
        })}
      </View>
      {labels && value !== null && labels[value] ? (
        <NText variant="caption1" muted center style={{ marginTop: 6 }}>
          {labels[value]}
        </NText>
      ) : null}
    </View>
  );
}
