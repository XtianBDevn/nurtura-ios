/**
 * Schedule Tab
 * Calendar view + event list + add, edit, delete schedule items
 */
import React, { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NCard } from '@/components/NCard';
import { NInput } from '@/components/NInput';
import { SelectionCard } from '@/components/SelectionCard';
import { useColors } from '@/hooks/useThemeColor';
import { NotificationFeedbackType, notification, selection } from '@/lib/haptics';
import { Spacing, Radius } from '@/lib/theme';
import { canUseRecurringSchedules, toDateInputValue } from '@/lib/schedule';
import { api } from '../../convex/_generated/api';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const TYPE_OPTIONS = ['appointment', 'shift', 'medication', 'task'] as const;
const RECURRENCE_OPTIONS = ['daily', 'weekly', 'monthly'] as const;

type ScheduleType = (typeof TYPE_OPTIONS)[number];
type RecurrenceType = (typeof RECURRENCE_OPTIONS)[number];

export default function ScheduleScreen() {
  const colors = useColors();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const selectedDateStr = toDateInputValue(selectedDate);
  const scheduleItems = useQuery(api.schedule.listForUser, { date: selectedDateStr });
  const recipients = useQuery(api.careRecipients.list);
  const subscription = useQuery(api.subscriptions.get);
  const createItem = useMutation(api.schedule.create);
  const updateItem = useMutation(api.schedule.update);
  const deleteItem = useMutation(api.schedule.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ScheduleType>('appointment');
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType | null>(null);
  const [recurrenceCount, setRecurrenceCount] = useState('');
  const [loading, setLoading] = useState(false);

  const canUsePremium = canUseRecurringSchedules(subscription?.plan);

  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i += 1) days.push(null);
    for (let i = 1; i <= daysInMonth; i += 1) days.push(i);
    return days;
  }, [selectedDate]);

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    selectedDate.getMonth() === today.getMonth() &&
    selectedDate.getFullYear() === today.getFullYear();

  const isSelected = (day: number) => day === selectedDate.getDate();

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setType('appointment');
    setRecipientId(null);
    setStartTime('');
    setEndTime('');
    setRecurrenceType(null);
    setRecurrenceCount('');
  };

  const openCreateModal = () => {
    resetForm();
    setEditingId(null);
    setShowAdd(true);
  };

  const openEditModal = (item: any) => {
    setEditingId(item._id);
    setTitle(item.title ?? '');
    setDescription(item.description ?? '');
    setType(item.type ?? 'appointment');
    setRecipientId(item.careRecipientId ?? null);
    setStartTime(item.startTime ?? '');
    setEndTime(item.endTime ?? '');
    setRecurrenceType(item.recurrenceType ?? null);
    setRecurrenceCount(item.recurrenceCount?.toString() ?? '');
    setShowAdd(true);
  };

  const changeMonth = (delta: number) => {
    const d = new Date(selectedDate);
    d.setMonth(d.getMonth() + delta);
    setSelectedDate(d);
  };

  const handleSave = async () => {
    if (!title.trim() || !recipientId) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        careRecipientId: recipientId as any,
        date: selectedDateStr,
        startTime: startTime || undefined,
        endTime: endTime || undefined,
        description: description.trim() || undefined,
        recurrenceType: canUsePremium ? recurrenceType ?? undefined : undefined,
        recurrenceCount:
          canUsePremium && recurrenceType ? Number(recurrenceCount) || undefined : undefined,
      };

      if (editingId) {
        await updateItem({ id: editingId as any, ...payload });
      } else {
        await createItem(payload as any);
      }

      notification(NotificationFeedbackType.Success);
      setShowAdd(false);
      resetForm();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item: any) => {
    Alert.alert('Delete schedule item', 'Remove this entry from the calendar?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteItem({ id: item._id });
            notification(NotificationFeedbackType.Success);
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
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
        <View style={styles.screenHeader}>
          <NText variant="caption1" color={colors.accent} bold style={styles.overline}>
            CALENDAR
          </NText>
          <NText variant="title2" bold>Plan the day</NText>
        </View>

        <NCard style={styles.calendarCard} elevated>
          <View style={styles.monthRow}>
            <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
              <Ionicons name="chevron-back" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            <NText variant="headline" bold>
              {MONTHS[selectedDate.getMonth()]} {selectedDate.getFullYear()}
            </NText>
            <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
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
                  selection();
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

        <View style={styles.scheduleHeader}>
          <NText variant="title3" bold>
            {selectedDate.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </NText>
          <NButton
            title="Add"
            icon={<Ionicons name="add" size={16} color="#FFF" />}
            onPress={openCreateModal}
            size="sm"
          />
        </View>

        {!scheduleItems?.length ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={40} color={colors.textTertiary} />
            <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
              Nothing scheduled yet.
            </NText>
          </View>
        ) : (
          <View style={styles.scheduleList}>
            {scheduleItems.map((item: any) => (
              <TouchableOpacity key={item._id} activeOpacity={0.85} onPress={() => openEditModal(item)}>
                <NCard style={styles.scheduleItemCard} elevated>
                  <View style={styles.itemRow}>
                    <View style={styles.timelineSlot}>
                      <View style={[styles.typeIndicator, { backgroundColor: typeColors[item.type] || colors.primary }]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <NText variant="headline">{item.title}</NText>
                      <View style={styles.itemMeta}>
                        <NText variant="caption1" muted>
                          {item.recipientName || 'General'}
                        </NText>
                        {item.startTime ? <NText variant="caption1" muted> · {item.startTime}</NText> : null}
                      </View>
                      {item.description ? (
                        <NText variant="caption1" muted style={{ marginTop: 2 }}>
                          {item.description}
                        </NText>
                      ) : null}
                    </View>
                    <View style={styles.itemActions}>
                      <TouchableOpacity onPress={() => openEditModal(item)} style={styles.iconButton}>
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDelete(item)} style={styles.iconButton}>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.footerRow}>
                    <View style={[styles.typeBadge, { backgroundColor: `${typeColors[item.type]}15` }]}> 
                      <NText variant="caption2" color={typeColors[item.type]} style={{ textTransform: 'capitalize' }}>
                        {item.type}
                      </NText>
                    </View>
                    {item.recurrenceType ? (
                      <NText variant="caption2" muted>
                        Repeats {item.recurrenceType}
                      </NText>
                    ) : null}
                  </View>
                </NCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}> 
          <View style={styles.modalHeader}>
            <NButton title="Cancel" variant="ghost" onPress={() => setShowAdd(false)} />
            <NText variant="headline" bold>{editingId ? 'Edit Schedule Item' : 'Add Schedule Item'}</NText>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <NInput label="TITLE" placeholder="What's happening?" value={title} onChangeText={setTitle} />
            <NInput label="DESCRIPTION" placeholder="Notes or instructions" value={description} onChangeText={setDescription} />
            <NInput label="START TIME" placeholder="e.g. 2:30 PM" value={startTime} onChangeText={setStartTime} />
            <NInput label="END TIME" placeholder="e.g. 3:30 PM" value={endTime} onChangeText={setEndTime} />

            <NText variant="headline" style={styles.label}>Type</NText>
            {TYPE_OPTIONS.map((t) => {
              const icons: Record<string, string> = {
                appointment: 'business-outline', shift: 'person-outline', medication: 'medkit-outline', task: 'checkmark-circle-outline',
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
            {recipients?.map((r: any) => (
              <SelectionCard
                key={r._id}
                title={r.name}
                icon={r.avatarEmoji || 'person-outline'}
                selected={recipientId === r._id}
                onPress={() => setRecipientId(r._id)}
              />
            ))}

            <NCard style={styles.premiumCard}>
              <View style={styles.premiumHeader}>
                <View style={{ flex: 1 }}>
                  <NText variant="headline" bold>Recurring schedules</NText>
                  <NText variant="caption1" muted>
                    Unlock daily, weekly, and monthly repeats with Plus or Professional.
                  </NText>
                </View>
                {!canUsePremium ? (
                  <View style={[styles.premiumBadge, { backgroundColor: colors.primaryLight }]}> 
                    <NText variant="caption2" color={colors.primary} bold>Premium</NText>
                  </View>
                ) : null}
              </View>

              {canUsePremium ? (
                <>
                  <NText variant="headline" style={styles.label}>Repeat</NText>
                  {RECURRENCE_OPTIONS.map((option) => (
                    <SelectionCard
                      key={option}
                      title={option.charAt(0).toUpperCase() + option.slice(1)}
                      icon={option === 'daily' ? 'repeat-outline' : option === 'weekly' ? 'calendar-outline' : 'calendar-number-outline'}
                      selected={recurrenceType === option}
                      onPress={() => setRecurrenceType(option)}
                    />
                  ))}
                  {recurrenceType ? (
                    <NInput
                      label="REPEATS FOR"
                      placeholder="e.g. 3"
                      value={recurrenceCount}
                      onChangeText={setRecurrenceCount}
                      keyboardType="number-pad"
                    />
                  ) : null}
                </>
              ) : (
                <NButton
                  title="Unlock recurring schedules"
                  variant="ghost"
                  onPress={() => Alert.alert('Premium feature', 'Recurring schedules are available on Plus and Professional plans.')}
                  fullWidth
                  style={{ marginTop: Spacing.md }}
                />
              )}
            </NCard>

            <NButton
              title={editingId ? 'Update' : 'Save'}
              onPress={handleSave}
              loading={loading}
              fullWidth
              size="lg"
              style={{ marginTop: Spacing.xl }}
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 120 },
  screenHeader: {
    marginBottom: Spacing.lg,
  },
  overline: {
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  calendarCard: { marginBottom: Spacing.xl },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  monthButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
    borderRadius: Radius.sm,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  scheduleList: { gap: Spacing.md },
  scheduleItemCard: {},
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  timelineSlot: {
    width: 18,
    alignItems: 'center',
  },
  typeIndicator: { width: 5, height: 48, borderRadius: 3 },
  itemMeta: { flexDirection: 'row', flexWrap: 'wrap' },
  itemActions: { flexDirection: 'row', gap: Spacing.sm },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
  },
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
  premiumCard: { marginTop: Spacing.lg },
  premiumHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  premiumBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: Radius.full },
});
