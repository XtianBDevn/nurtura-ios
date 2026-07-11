import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useConvexAuth, useQuery } from 'convex/react';
import { NButton } from '@/components/NButton';
import { NCard } from '@/components/NCard';
import { NText } from '@/components/NText';
import { useColors } from '@/hooks/useThemeColor';
import { generateCarePlan } from '@/lib/carePlan';
import { Radius, Spacing } from '@/lib/theme';
import { api } from '../convex/_generated/api';

type Instruction = {
  title: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

function todayValue() {
  return new Date().toISOString().split('T')[0];
}

export default function CareSummaryScreen() {
  const colors = useColors();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const recipients = useQuery(api.careRecipients.list, isAuthenticated ? {} : 'skip');
  const primaryRecipient = recipients?.[0] ?? null;
  const health = useQuery(
    api.healthProfiles.get,
    primaryRecipient ? { careRecipientId: primaryRecipient._id } : 'skip',
  );
  const medications = useQuery(
    api.medications.list,
    primaryRecipient ? { careRecipientId: primaryRecipient._id } : 'skip',
  );
  const todaySchedule = useQuery(
    api.schedule.listForUser,
    isAuthenticated ? { date: todayValue() } : 'skip',
  );

  const loading =
    isLoading ||
    recipients === undefined ||
    (primaryRecipient && health === undefined) ||
    (primaryRecipient && medications === undefined) ||
    todaySchedule === undefined;

  const carePlan = useMemo(() => {
    if (!health) return null;
    return generateCarePlan(health as any);
  }, [health]);

  const primarySchedule = useMemo(
    () =>
      (todaySchedule ?? []).filter(
        (item: any) => item.careRecipientId === primaryRecipient?._id,
      ),
    [primaryRecipient?._id, todaySchedule],
  );

  const instructions = useMemo<Instruction[]>(() => {
    if (!primaryRecipient) return [];

    const items: Instruction[] = [];

    if (primaryRecipient.conditions) {
      items.push({
        title: 'Health context',
        detail: primaryRecipient.conditions,
        icon: 'medical-outline',
        color: colors.chart3,
      });
    }

    if (primaryRecipient.notes) {
      items.push({
        title: 'Care notes',
        detail: primaryRecipient.notes,
        icon: 'document-text-outline',
        color: colors.primary,
      });
    }

    if (health?.emergencyNotes) {
      items.push({
        title: 'Important safety note',
        detail: health.emergencyNotes,
        icon: 'alert-circle-outline',
        color: colors.error,
      });
    }

    carePlan?.suggestions.slice(0, 4).forEach((suggestion) => {
      items.push({
        title: 'Recommended care action',
        detail: suggestion,
        icon: 'sparkles-outline',
        color: colors.lavender,
      });
    });

    (medications ?? [])
      .filter((med: any) => med.active !== false)
      .slice(0, 4)
      .forEach((med: any) => {
        items.push({
          title: med.name,
          detail: [med.dosage, med.frequency, med.instructions].filter(Boolean).join(' · '),
          icon: 'medkit-outline',
          color: colors.chart2,
        });
      });

    primarySchedule.slice(0, 4).forEach((entry: any) => {
      items.push({
        title: entry.title,
        detail: [entry.startTime || 'Today', entry.description].filter(Boolean).join(' · '),
        icon: entry.type === 'medication' ? 'medkit-outline' : 'calendar-outline',
        color: colors.primary,
      });
    });

    if (items.length === 0) {
      items.push({
        title: 'Start with a calm check-in',
        detail: 'Review how they are feeling, confirm medications, and log anything the care team should know.',
        icon: 'heart-outline',
        color: colors.primary,
      });
    }

    return items;
  }, [carePlan, colors, health, medications, primaryRecipient, primarySchedule]);

  if (!isLoading && !isAuthenticated) {
    return <Redirect href="/" />;
  }

  if (loading) {
    return (
      <View style={[styles.loadingScreen, { backgroundColor: colors.background }]}>
        <View style={[styles.loadingBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="clipboard-outline" size={28} color="#FFF" />
        </View>
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
        <NText variant="subheadline" muted center style={{ marginTop: Spacing.md }}>
          Preparing your care briefing
        </NText>
      </View>
    );
  }

  if (!primaryRecipient) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <NText variant="caption1" color={colors.accent} bold style={styles.overline}>
            BEFORE YOUR DASHBOARD
          </NText>
          <NText variant="largeTitle" bold>
            Care instructions
          </NText>
          <NText variant="subheadline" muted style={styles.subtitle}>
            Review the essentials for {primaryRecipient.name} before starting care.
          </NText>
        </View>

        <NCard style={styles.personCard} elevated>
          <View style={[styles.careRail, { backgroundColor: colors.primary }]} />
          <View style={styles.personRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <NText style={styles.avatarEmoji}>{primaryRecipient.avatarEmoji || '👤'}</NText>
            </View>
            <View style={{ flex: 1 }}>
              <NText variant="title3" bold>{primaryRecipient.name}</NText>
              <NText variant="footnote" muted style={{ textTransform: 'capitalize' }}>
                {primaryRecipient.careType} care · {primaryRecipient.memberRole} team member
              </NText>
            </View>
          </View>
          {carePlan ? (
            <View style={[styles.planStrip, { backgroundColor: colors.primaryLight }]}>
              <NText variant="caption1" color={colors.primary} bold style={styles.overline}>
                CARE PLAN
              </NText>
              <NText variant="subheadline" color={colors.primaryDark}>
                {carePlan.summary}
              </NText>
            </View>
          ) : null}
        </NCard>

        <View style={styles.instructions}>
          {instructions.map((instruction, index) => (
            <NCard key={`${instruction.title}-${index}`} style={styles.instructionCard} elevated>
              <View style={styles.instructionRow}>
                <View style={[styles.instructionIcon, { backgroundColor: `${instruction.color}18` }]}>
                  <Ionicons name={instruction.icon} size={20} color={instruction.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <NText variant="headline">{instruction.title}</NText>
                  <NText variant="subheadline" muted style={styles.instructionDetail}>
                    {instruction.detail}
                  </NText>
                </View>
              </View>
            </NCard>
          ))}
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => router.push('/(tabs)/recipients')}
          style={[styles.manageLink, { borderColor: colors.borderLight }]}
        >
          <Ionicons name="create-outline" size={18} color={colors.textSecondary} />
          <NText variant="footnote" muted style={{ marginLeft: Spacing.sm }}>
            Manage instructions in the care recipient profile
          </NText>
        </TouchableOpacity>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.borderLight }]}>
        <NButton
          title="Continue to dashboard"
          onPress={() => router.replace('/(tabs)')}
          fullWidth
          size="lg"
          icon={<Ionicons name="arrow-forward" size={18} color="#FFF" />}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    padding: Spacing.xl,
    paddingTop: 72,
    paddingBottom: 130,
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
  },
  loadingBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: Spacing.xl,
  },
  overline: {
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  personCard: {
    marginBottom: Spacing.xl,
    overflow: 'hidden',
  },
  careRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 30,
  },
  planStrip: {
    marginTop: Spacing.lg,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  instructions: {
    gap: Spacing.md,
  },
  instructionCard: {},
  instructionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  instructionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionDetail: {
    marginTop: 3,
  },
  manageLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.xl,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
