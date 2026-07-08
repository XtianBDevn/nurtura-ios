/**
 * Schedule Tab
 * Calendar view + event list + add schedule item
 */
import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NCard } from '@/components/NCard';
import { NInput } from '@/components/NInput';
import { SelectionCard } from '@/components/SelectionCard';
import { useColors } from '@/hooks/useThemeColor';
import { Spacing, Radius } from '@/lib/theme';
import { api } from '../../convex/_generated/api';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function ScheduleScreen() {
  const colors = useColors();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const scheduleItems = useQuery(api.schedule.listForUser, { date: selectedDateStr });
  const recipients = useQuery(api.careRecipients.list);
  const createItem = useMutation(api.schedule.create);

  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'appointment' | 'shift' | 'medication' | 'task'>('appointment');
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [loading, setLoading] = useState(false);

  // Build mini calendar for current month
  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [selectedDate]);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear();

  const isSelected = (day: number) => day === selectedDate.getDate();

  const changeMonth = (delta: number) => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + delta);
    setSelectedDate(d);
  };

  const handleAdd = async () => {
    if (!title.trim() || !recipientId) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      await createItem({
        title,
        type,
        careRecipientId: recipientId as any,
        date: selectedDate.toISOString().split('T')[0],
        startTime: startTime || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdd(false);
      setTitle('');
      setStartTime('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const typeColors: Record<string, string> = {
    appointment: colors.chart3,
    shift: colors.chart4,
    medication: colors.chart2,
    task: colors.chart1,
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Calendar */}
        <NCard style={styles.calendarCard}>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <NText variant="headline" bold>
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </NText>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.dayHeaders}>
            {DAYS.map((d, i) => (
              <NText key={i} variant="caption2" muted center style={styles.dayHeader}>{d}</NText>
            ))}
          </View>

          <View style={styles.calGrid}>
            {calendarDays.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.dayCell,
                  !!day && isSelected(day) && { backgroundColor: colors.primary },
                  !!day && isToday(day) && !isSelected(day) && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
                disabled={!day}
                onPress={() => {
                  if (!day) return;
                  Haptics.selectionAsync();
                  const d = new Date(selectedDate);
                  d.setDate(day);
                  setSelectedDate(d);
                }}
              >
                {day && (
                  <NText
                    variant="subheadline"
                    color={isSelected(day) ? '#FFF' : isToday(day) ? colors.primary : colors.text}
                    bold={isToday(day) || isSelected(day)}
                  >
                    {day}
                  </NText>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </NCard>

        {/* Schedule List */}
        <View style={styles.scheduleHeader}>
          <NText variant="title3" bold>
            {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </NText>
          <NButton
            title="Add"
            icon={<Ionicons name="add" size={16} color="#FFF" />}
            onPress={() => setShowAdd(true)}
            size="sm"
          />
        </View>

        {!scheduleItems?.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={colors.textTertiary} />
            <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
              Nothing scheduled
            </NText>
          </View>
        ) : (
          <View style={styles.scheduleList}>
            {scheduleItems.map((item) => (
              <NCard key={item._id} style={styles.scheduleItem}>
                <View style={styles.itemRow}>
                  <View style={[styles.typeIndicator, { backgroundColor: typeColors[item.type] || colors.primary }]} />
                  <View style={{ flex: 1 }}>
                    <NText variant="headline">{item.title}</NText>
                    <View style={styles.itemMeta}>
                      <NText variant="caption1" muted>
                        {item.recipientName || 'General'}
                      </NText>
                      {item.startTime && (
                        <NText variant="caption1" muted> · {item.startTime}</NText>
                      )}
                    </View>
                  </View>
                  <View style={[styles.typeBadge, { backgroundColor: `${typeColors[item.type]}15` }]}>
                    <NText variant="caption2" color={typeColors[item.type]} style={{ textTransform: 'capitalize' }}>
                      {item.type}
                    </NText>
                  </View>
                </View>
              </NCard>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <NButton title="Cancel" variant="ghost" onPress={() => setShowAdd(false)} />
            <NText variant="headline" bold>Add Schedule Item</NText>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <NInput label="TITLE" placeholder="What's happening?" value={title} onChangeText={setTitle} />
            <NInput label="TIME (OPTIONAL)" placeholder="e.g. 2:30 PM" value={startTime} onChangeText={setStartTime} />

            <NText variant="headline" style={styles.label}>Type</NText>
            {(['appointment', 'shift', 'medication', 'task'] as const).map((t) => {
              const icons: Record<string, string> = {
                appointment: '🏥', shift: '👤', medication: '💊', task: '✅',
              };
              return (
                <SelectionCard
                  key={t}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                  icon={icons[t]}
                  selected={type === t}
                  onPress={() => setType(t)}
                />
              );
            })}

            <NText variant="headline" style={styles.label}>Recipient</NText>
            {recipients?.map((r) => (
              <SelectionCard
                key={r._id}
                title={r.name}
                icon={r.avatarEmoji || '👤'}
                selected={recipientId === r._id}
                onPress={() => setRecipientId(r._id)}
              />
            ))}

            <NButton title="Save" onPress={handleAdd} loading={loading} fullWidth size="lg" style={{ marginTop: Spacing.xl }} />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  calendarCard: { marginBottom: Spacing.xl },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  dayHeader: { flex: 1 },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  scheduleList: { gap: Spacing.md },
  scheduleItem: {},
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  typeIndicator: { width: 4, height: 40, borderRadius: 2 },
  itemMeta: { flexDirection: 'row' },
  typeBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  modalContent: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  label: { marginTop: Spacing.xl, marginBottom: Spacing.md },
});
