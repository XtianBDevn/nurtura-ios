/**
 * Log Activity Tab
 * Quick-entry form for care logs
 */
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NInput } from '@/components/NInput';
import { SelectionCard } from '@/components/SelectionCard';
import { useColors } from '@/hooks/useThemeColor';
import { Spacing } from '@/lib/theme';
import { api } from '../../convex/_generated/api';

type LogType = 'task' | 'vital' | 'meal' | 'activity' | 'mood' | 'note';

const LOG_TYPES: { type: LogType; icon: string; label: string }[] = [
  { type: 'task', icon: '✅', label: 'Task' },
  { type: 'vital', icon: '💓', label: 'Vitals' },
  { type: 'meal', icon: '🍽️', label: 'Meal' },
  { type: 'activity', icon: '🏃', label: 'Activity' },
  { type: 'mood', icon: '😊', label: 'Mood' },
  { type: 'note', icon: '📝', label: 'Note' },
];

const MOODS = [
  { score: 5, emoji: '😊', label: 'Great' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 2, emoji: '😟', label: 'Low' },
  { score: 1, emoji: '😢', label: 'Bad' },
];

export default function LogScreen() {
  const colors = useColors();
  const recipients = useQuery(api.careRecipients.list);
  const createLog = useMutation(api.careLogs.create);

  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [logType, setLogType] = useState<LogType>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moodScore, setMoodScore] = useState<number>(3);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!selectedRecipient) {
      Alert.alert('Select Recipient', 'Please choose who this log is for.');
      return;
    }
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title.');
      return;
    }
    setLoading(true);
    try {
      await createLog({
        careRecipientId: selectedRecipient as any,
        type: logType,
        title,
        description: description || undefined,
        moodScore: logType === 'mood' ? moodScore : undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccess(true);
      // Reset after brief display
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSuccess(false);
      }, 2000);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.container, styles.successContainer, { backgroundColor: colors.background }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.successBg }]}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>
        <NText variant="title2" bold>Activity Logged!</NText>
        <NText variant="subheadline" muted style={{ marginTop: Spacing.sm }}>
          Entry saved successfully
        </NText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <NText variant="title2" bold>Log Activity</NText>
      <NText variant="subheadline" muted style={styles.subtitle}>
        Record a care entry
      </NText>

      {/* Select Recipient */}
      <NText variant="headline" style={styles.label}>Care Recipient</NText>
      {recipients?.map((r) => (
        <SelectionCard
          key={r._id}
          title={r.name}
          icon={r.avatarEmoji || '👤'}
          subtitle={`${r.careType} care`}
          selected={selectedRecipient === r._id}
          onPress={() => setSelectedRecipient(r._id)}
        />
      ))}

      {/* Log Type */}
      <NText variant="headline" style={styles.label}>Type</NText>
      <View style={styles.typeGrid}>
        {LOG_TYPES.map((lt) => (
          <SelectionCard
            key={lt.type}
            title={lt.label}
            icon={lt.icon}
            selected={logType === lt.type}
            onPress={() => setLogType(lt.type)}
          />
        ))}
      </View>

      {/* Title & Description */}
      <NInput
        label="TITLE"
        placeholder="What happened?"
        value={title}
        onChangeText={setTitle}
      />
      <NInput
        label="NOTES (OPTIONAL)"
        placeholder="Add any details"
        value={description}
        onChangeText={setDescription}
        multiline
      />

      {/* Mood picker */}
      {logType === 'mood' && (
        <>
          <NText variant="headline" style={styles.label}>Mood</NText>
          <View style={styles.moodRow}>
            {MOODS.map((m) => (
              <SelectionCard
                key={m.score}
                title={m.label}
                icon={m.emoji}
                selected={moodScore === m.score}
                onPress={() => setMoodScore(m.score)}
              />
            ))}
          </View>
        </>
      )}

      <NButton
        title="Save Entry"
        onPress={handleSubmit}
        loading={loading}
        fullWidth
        size="lg"
        style={{ marginTop: Spacing.xl }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  subtitle: { marginTop: Spacing.xs, marginBottom: Spacing.lg },
  label: { marginTop: Spacing.xl, marginBottom: Spacing.md },
  typeGrid: {},
  moodRow: {},
  successContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
});
