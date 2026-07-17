import React from 'react';
import { Pressable, View } from 'react-native';
import { NText } from './NText';
import { selection } from '@/lib/haptics';
import { Ionicons } from '@expo/vector-icons';
import { resolveIconName } from '@/lib/icons';

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
        selection();
        onPress();
      }}
      className={`flex-row items-center rounded-full border px-4 py-2.5 mr-2 mb-2 ${
        selected ? 'bg-primary border-primary' : 'bg-surface-muted border-transparent'
      }`}
    >
      {emoji ? (
        <Ionicons
          name={resolveIconName(emoji)}
          size={16}
          color={selected ? '#FFFFFF' : undefined}
          style={{ marginRight: 6 }}
        />
      ) : null}
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
