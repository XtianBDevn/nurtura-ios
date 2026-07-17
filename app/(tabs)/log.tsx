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
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NInput } from '@/components/NInput';
import { SelectionCard } from '@/components/SelectionCard';
import { useColors } from '@/hooks/useThemeColor';
import { NotificationFeedbackType, notification } from '@/lib/haptics';
import { Spacing } from '@/lib/theme';
import { buildVitalLogPayload, type VitalType } from '@/lib/vitals';
import { formatTaskSummary, groupTasksByCompletion } from '@/lib/tasks';
import { api } from '../../convex/_generated/api';

type LogType = 'task' | 'vital' | 'meal' | 'activity' | 'mood' | 'note';

const LOG_TYPES: { type: LogType; icon: string; label: string }[] = [
  { type: 'task', icon: 'checkmark-circle-outline', label: 'Task' },
  { type: 'vital', icon: 'pulse-outline', label: 'Vitals' },
  { type: 'meal', icon: 'restaurant-outline', label: 'Meal' },
  { type: 'activity', icon: 'walk-outline', label: 'Activity' },
  { type: 'mood', icon: 'happy-outline', label: 'Mood' },
  { type: 'note', icon: 'document-text-outline', label: 'Note' },
];

const MOODS = [
  { score: 5, emoji: 'happy-outline', label: 'Great' },
  { score: 4, emoji: 'happy-outline', label: 'Good' },
  { score: 3, emoji: 'remove-circle-outline', label: 'Okay' },
  { score: 2, emoji: 'sad-outline', label: 'Low' },
  { score: 1, emoji: 'sad-outline', label: 'Bad' },
];

export default function LogScreen() {
  const colors = useColors();
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const recipients = useQuery(api.careRecipients.list);
  const createLog = useMutation(api.careLogs.create);
  const updateTask = useMutation(api.careLogs.update);
  const removeTask = useMutation(api.careLogs.remove);
  const teamMembers = useQuery(
    api.careRecipients.getTeam,
    selectedRecipient ? { careRecipientId: selectedRecipient as any } : "skip",
  );
  const taskLogs = useQuery(
    api.careLogs.list,
    selectedRecipient ? { careRecipientId: selectedRecipient as any, limit: 50 } : "skip",
  );
  const tasks = (taskLogs ?? []).filter((log: any) => log.type === 'task');
  const { incomplete: incompleteTasks, completed: completedTasks } = groupTasksByCompletion(tasks);
  const [logType, setLogType] = useState<LogType>('task');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moodScore, setMoodScore] = useState<number>(3);
  const [vitalType, setVitalType] = useState<VitalType>('blood_pressure');
  const [taskAssignee, setTaskAssignee] = useState<string | null>(null);
  const [taskMode, setTaskMode] = useState<'create' | 'edit'>('create');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [bloodOxygen, setBloodOxygen] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const resetTaskForm = () => {
    setTitle('');
    setDescription('');
    setTaskAssignee(null);
    setTaskMode('create');
    setEditingTaskId(null);
  };

  const handleEditTask = (task: any) => {
    setTitle(task.title || '');
    setDescription(task.description || '');
    setTaskAssignee(task.assigneeId || null);
    setTaskMode('edit');
    setEditingTaskId(task._id);
    setLogType('task');
  };

  const handleDeleteTask = (task: any) => {
    Alert.alert('Delete Task', `Delete “${task.title || 'this task'}”?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeTask({ id: task._id });
            notification(NotificationFeedbackType.Success);
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleSubmit = async () => {
    if (!selectedRecipient) {
      Alert.alert('Select Recipient', 'Please choose who this log is for.');
      return;
    }

    let payload: { title: string; description?: string; vitalType?: string; vitalValue?: string; vitalUnit?: string; moodScore?: number; assigneeId?: any; completed?: boolean } = {
      title,
      description: description || undefined,
      moodScore: logType === 'mood' ? moodScore : undefined,
      assigneeId: logType === 'task' ? (taskAssignee as any) : undefined,
      completed: logType === 'task' ? false : undefined,
    };

    if (logType === 'vital') {
      payload = {
        ...payload,
        ...buildVitalLogPayload({
          vitalType,
          systolic,
          diastolic,
          heartRate,
          bloodOxygen,
        }),
      };
    }

    if (logType === 'task' && !title.trim()) {
      Alert.alert('Task Required', 'Please enter a task title.');
      return;
    }

    if (logType !== 'vital' && !title.trim()) {
      Alert.alert('Title Required', 'Please enter a title.');
      return;
    }

    if (logType === 'vital' && !['blood_pressure', 'heart_rate', 'blood_oxygen'].includes(vitalType)) {
      Alert.alert('Vital Type Required', 'Please select a vital type.');
      return;
    }

    setLoading(true);
    try {
      if (logType === 'task' && editingTaskId) {
        await updateTask({
          id: editingTaskId as any,
          title: title.trim(),
          description: description || undefined,
          assigneeId: taskAssignee as any,
        });
      } else {
        await createLog({
          careRecipientId: selectedRecipient as any,
          type: logType,
          ...payload,
        });
      }
      notification(NotificationFeedbackType.Success);
      resetTaskForm();
      setSuccess(true);
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSystolic('');
        setDiastolic('');
        setHeartRate('');
        setBloodOxygen('');
        setVitalType('blood_pressure');
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
          icon={r.avatarEmoji || 'person-outline'}
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

      {logType === 'task' && (
        <>
          <NText variant="headline" style={styles.label}>Task List</NText>
          <NText variant="subheadline" muted>
            Create, update, and assign care tasks for this patient.
          </NText>

          <NInput
            label="TASK TITLE"
            placeholder="e.g. Change sheets"
            value={title}
            onChangeText={setTitle}
          />
          <NInput
            label="DETAILS (OPTIONAL)"
            placeholder="Add context"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {((teamMembers as any[]) || []).length > 1 && (
            <>
              <NText variant="headline" style={styles.label}>Assign To</NText>
              {(teamMembers as any[]).map((member) => (
                <SelectionCard
                  key={member.userId}
                  title={member.name}
                  icon={member.profileRole === 'professional' ? 'medical-outline' : 'people-outline'}
                  selected={taskAssignee === member.userId}
                  onPress={() => setTaskAssignee(member.userId)}
                />
              ))}
            </>
          )}

          <View style={styles.taskActions}>
            <NButton
              title={taskMode === 'edit' ? 'Update Task' : 'Add Task'}
              onPress={handleSubmit}
              loading={loading}
              fullWidth
            />
            {taskMode === 'edit' && (
              <NButton title="Cancel" variant="ghost" onPress={resetTaskForm} style={{ marginTop: Spacing.sm }} />
            )}
          </View>

          <View style={{ marginTop: Spacing.xl }}>
            <NText variant="headline" style={styles.label}>Current Tasks</NText>
            {!tasks.length ? (
              <NText variant="subheadline" muted>No tasks yet.</NText>
            ) : (
              <>
                <NText variant="caption1" bold style={{ marginBottom: Spacing.sm }}>ACTIVE</NText>
                {incompleteTasks.map((task: any) => (
                  <View key={task._id} style={styles.taskItem}>
                    <View style={{ flex: 1 }}>
                      <NText variant="headline">{task.title}</NText>
                      <NText variant="caption1" muted>{formatTaskSummary({ description: task.description, assigneeName: task.assigneeName, completed: Boolean(task.completed) })}</NText>
                    </View>
                    <View style={styles.taskItemActions}>
                      <TouchableOpacity onPress={() => handleEditTask(task)}>
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteTask(task)} style={{ marginLeft: Spacing.sm }}>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {completedTasks.length > 0 && (
                  <>
                    <NText variant="caption1" bold style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}>COMPLETED</NText>
                    {completedTasks.map((task: any) => (
                      <View key={task._id} style={[styles.taskItem, { opacity: 0.75 }] }>
                        <View style={{ flex: 1 }}>
                          <NText variant="headline">{task.title}</NText>
                          <NText variant="caption1" muted>{formatTaskSummary({ description: task.description, assigneeName: task.assigneeName, completed: Boolean(task.completed) })}</NText>
                        </View>
                        <View style={styles.taskItemActions}>
                          <TouchableOpacity onPress={() => handleEditTask(task)}>
                            <Ionicons name="create-outline" size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteTask(task)} style={{ marginLeft: Spacing.sm }}>
                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        </>
      )}

      {logType !== 'vital' && logType !== 'task' && (
        <>
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
        </>
      )}

      {logType === 'vital' && (
        <>
          <NText variant="headline" style={styles.label}>Vital Type</NText>
          <View style={styles.typeGrid}>
            {[
              { type: 'blood_pressure', icon: 'water-outline', label: 'Blood Pressure' },
              { type: 'heart_rate', icon: 'pulse-outline', label: 'Heart Rate' },
              { type: 'blood_oxygen', icon: 'fitness-outline', label: 'Blood Oxygen' },
            ].map((item) => (
              <SelectionCard
                key={item.type}
                title={item.label}
                icon={item.icon}
                selected={vitalType === item.type}
                onPress={() => setVitalType(item.type as VitalType)}
              />
            ))}
          </View>

          <NText variant="footnote" muted style={{ marginTop: Spacing.sm }}>
            EKG will be available soon as an upcoming feature.
          </NText>

          {vitalType === 'blood_pressure' && (
            <View style={{ marginTop: Spacing.md }}>
              <NInput
                label="SYSTOLIC"
                placeholder="120"
                value={systolic}
                onChangeText={setSystolic}
                keyboardType="numeric"
              />
              <NInput
                label="DIASTOLIC"
                placeholder="80"
                value={diastolic}
                onChangeText={setDiastolic}
                keyboardType="numeric"
              />
            </View>
          )}

          {vitalType === 'heart_rate' && (
            <NInput
              label="HEART RATE (BPM)"
              placeholder="78"
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="numeric"
            />
          )}

          {vitalType === 'blood_oxygen' && (
            <NInput
              label="BLOOD OXYGEN (%)"
              placeholder="98"
              value={bloodOxygen}
              onChangeText={setBloodOxygen}
              keyboardType="numeric"
            />
          )}

          <NInput
            label="NOTES (OPTIONAL)"
            placeholder="Add any details"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </>
      )}

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

      {logType !== 'task' && (
        <NButton
          title="Save Entry"
          onPress={handleSubmit}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: Spacing.xl }}
        />
      )}
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
  taskActions: {},
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  taskItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
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
