/**
 * Dashboard — Home Tab
 * Time-aware greeting, stat cards, care recipients, schedule, recent activity
 */
import React from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import { router } from 'expo-router';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NCard } from '@/components/NCard';
import { StatCard } from '@/components/StatCard';
import { CarePlanCard } from '@/components/CarePlanCard';
import { useColors } from '@/hooks/useThemeColor';
import { Spacing, Radius } from '@/lib/theme';
import { generateCarePlan } from '@/lib/carePlan';
import { api } from '../../convex/_generated/api';

export default function DashboardScreen() {
  const colors = useColors();
  const profile = useQuery(api.profiles.get);
  const stats = useQuery(api.dashboard.stats);
  const recentLogs = useQuery(api.careLogs.listRecent, { limit: 5 });
  const recipients = useQuery(api.careRecipients.list);
  const primaryRecipient = recipients?.[0];
  const health = useQuery(
    api.healthProfiles.get,
    primaryRecipient ? { careRecipientId: primaryRecipient._id } : 'skip',
  );
  const carePlan = health ? generateCarePlan(health as any) : null;

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <NText variant="title2" bold>
            {greeting()}
            {profile?.firstName ? `, ${profile.firstName}` : ''}
          </NText>
          <NText variant="subheadline" muted>
            Here's your care overview for today.
          </NText>
        </View>
        <NButton
          title="Log"
          icon={<Ionicons name="add" size={18} color="#FFF" />}
          onPress={() => router.push('/(tabs)/log')}
          size="sm"
        />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statHalf}>
          <StatCard
            title="Recipients"
            value={stats?.recipientCount ?? 0}
            icon="people"
            color={colors.chart1}
            bgColor={colors.primaryLight}
          />
        </View>
        <View style={styles.statHalf}>
          <StatCard
            title="Today's Logs"
            value={stats?.todayLogs ?? 0}
            icon="pulse"
            color={colors.chart2}
            bgColor={`${colors.chart2}15`}
          />
        </View>
        <View style={styles.statHalf}>
          <StatCard
            title="Active Meds"
            value={stats?.activeMeds ?? 0}
            icon="medkit"
            color={colors.chart3}
            bgColor={`${colors.chart3}15`}
          />
        </View>
        <View style={styles.statHalf}>
          <StatCard
            title="Schedule"
            value={stats?.todaySchedule ?? 0}
            icon="calendar"
            color={colors.chart4}
            bgColor={`${colors.chart4}15`}
          />
        </View>
      </View>

      {/* Personalized Care Plan */}
      {carePlan && primaryRecipient && (
        <View style={styles.sectionCard}>
          <View style={styles.planHeader}>
            <NText variant="caption1" muted>
              {primaryRecipient.avatarEmoji} {primaryRecipient.name}'s plan
            </NText>
            <NButton
              title="Manage"
              variant="ghost"
              size="sm"
              onPress={() => router.push('/(tabs)/recipients')}
            />
          </View>
          <CarePlanCard plan={carePlan} compact />
        </View>
      )}

      {/* Care Recipients */}
      <NCard style={styles.sectionCard} padded={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="leaf" size={18} color={colors.chart4} />
            <NText variant="headline" bold style={{ marginLeft: Spacing.sm }}>Care Recipients</NText>
          </View>
          <NButton title="View All" variant="ghost" size="sm" onPress={() => router.push('/(tabs)/recipients')} />
        </View>
        {!recipients?.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={40} color={colors.textTertiary} />
            <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
              No care recipients yet
            </NText>
            <NButton
              title="Add Someone"
              variant="outline"
              size="sm"
              icon={<Ionicons name="add" size={16} color={colors.text} />}
              onPress={() => router.push('/(tabs)/recipients')}
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {recipients.slice(0, 4).map((r) => (
              <TouchableOpacity
                key={r._id}
                style={styles.recipientRow}
                activeOpacity={0.6}
              >
                <NText variant="title3">{r.avatarEmoji || '👤'}</NText>
                <View style={styles.recipientInfo}>
                  <NText variant="headline">{r.name}</NText>
                  <NText variant="caption1" muted style={{ textTransform: 'capitalize' }}>
                    {r.careType} care
                  </NText>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </NCard>

      {/* Today's Schedule */}
      <NCard style={styles.sectionCard} padded={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="time" size={18} color={colors.chart2} />
            <NText variant="headline" bold style={{ marginLeft: Spacing.sm }}>Today's Schedule</NText>
          </View>
          <NButton title="View All" variant="ghost" size="sm" onPress={() => router.push('/(tabs)/schedule')} />
        </View>
        {!stats?.upcomingSchedule?.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={colors.textTertiary} />
            <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
              Nothing scheduled today
            </NText>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {stats.upcomingSchedule.map((s, i) => (
              <View
                key={i}
                style={[styles.scheduleRow, s.completed && { opacity: 0.5 }]}
              >
                {s.completed ? (
                  <View style={[styles.checkCircle, { backgroundColor: colors.successBg }]}>
                    <Ionicons name="checkmark" size={12} color={colors.success} />
                  </View>
                ) : (
                  <NText variant="body">{s.recipientEmoji}</NText>
                )}
                <View style={styles.scheduleInfo}>
                  <NText
                    variant="subheadline"
                    style={s.completed ? { textDecorationLine: 'line-through' } : undefined}
                  >
                    {s.title}
                  </NText>
                  <NText variant="caption1" muted>
                    {s.recipientName}{s.startTime ? ` · ${s.startTime}` : ''}
                  </NText>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: colors.surfaceMuted }]}>
                  <NText variant="caption2" muted style={{ textTransform: 'capitalize' }}>{s.type}</NText>
                </View>
              </View>
            ))}
          </View>
        )}
      </NCard>

      {/* Recent Activity */}
      <NCard style={styles.sectionCard} padded={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="pulse" size={18} color={colors.chart1} />
            <NText variant="headline" bold style={{ marginLeft: Spacing.sm }}>Recent Activity</NText>
          </View>
        </View>
        {!recentLogs?.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="pulse-outline" size={40} color={colors.textTertiary} />
            <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
              No activity yet
            </NText>
            <NButton
              title="Log Activity"
              onPress={() => router.push('/(tabs)/log')}
              size="sm"
              style={{ marginTop: Spacing.md }}
            />
          </View>
        ) : (
          <View style={styles.listContainer}>
            {recentLogs.map((log) => (
              <View key={log._id} style={styles.activityRow}>
                <NText variant="body">{log.recipientEmoji}</NText>
                <View style={styles.activityInfo}>
                  <NText variant="subheadline">{log.title}</NText>
                  <NText variant="caption1" muted>
                    {log.recipientName} ·{' '}
                    {new Date(log.timestamp).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </NText>
                </View>
                <View style={[styles.typeBadge, { backgroundColor: colors.surfaceMuted }]}>
                  <NText variant="caption2" muted style={{ textTransform: 'capitalize' }}>{log.type}</NText>
                </View>
              </View>
            ))}
          </View>
        )}
      </NCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statHalf: { width: '47.5%' },
  sectionCard: { marginBottom: Spacing.xl },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  listContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  recipientInfo: { flex: 1 },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  scheduleInfo: { flex: 1 },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  activityInfo: { flex: 1 },
});
