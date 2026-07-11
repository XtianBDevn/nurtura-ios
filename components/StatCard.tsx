import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NText } from './NText';
import { NCard } from './NCard';
import { Spacing, Radius } from '@/lib/theme';

interface StatCardProps {
  title: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

export function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <NCard elevated>
      <View style={styles.row}>
        <NText variant="caption1" muted style={styles.label}>{title}</NText>
        <View style={[styles.iconBadge, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
      </View>
      <NText variant="title1">{value}</NText>
    </NCard>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    textTransform: 'uppercase',
  },
});
