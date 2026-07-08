import React from 'react';
import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { NText } from './NText';

interface ChipProps {
  label: string;
  emoji?: string;
  selected: boolean;
  onPress: () => void;
}

/** A single selectable pill. */
export function Chip({ label, emoji, selected, onPress }: ChipProps) {
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      className={`flex-row items-center rounded-full border px-4 py-2.5 mr-2 mb-2 ${
        selected ? 'bg-primary border-primary' : 'bg-surface-muted border-transparent'
      }`}
    >
      {emoji ? <NText style={{ marginRight: 6 }}>{emoji}</NText> : null}
      <NText
        variant="subheadline"
        bold={selected}
        color={selected ? '#FFFFFF' : undefined}
      >
        {label}
      </NText>
    </Pressable>
  );
}

export interface ChipOption {
  key: string;
  label: string;
  emoji?: string;
}

interface MultiSelectChipsProps {
  options: ChipOption[];
  selected: string[];
  onToggle: (key: string) => void;
}

/** Wrapping group of multi-select chips. */
export function MultiSelectChips({ options, selected, onToggle }: MultiSelectChipsProps) {
  return (
    <View className="flex-row flex-wrap">
      {options.map((o) => (
        <Chip
          key={o.key}
          label={o.label}
          emoji={o.emoji}
          selected={selected.includes(o.key)}
          onPress={() => onToggle(o.key)}
        />
      ))}
    </View>
  );
}
