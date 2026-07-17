/**
 * Care Recipients Tab
 * List all care recipients with add dialog
 */
import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NCard } from '@/components/NCard';
import { NInput } from '@/components/NInput';
import { SelectionCard } from '@/components/SelectionCard';
import { EmojiPicker } from '@/components/EmojiPicker';
import { PremiumAvatar } from '@/components/PremiumAvatar';
import { useColors } from '@/hooks/useThemeColor';
import { NotificationFeedbackType, notification } from '@/lib/haptics';
import { Spacing } from '@/lib/theme';
import { toDateInputValue } from '@/lib/schedule';
import { formatTaskSummary, groupTasksByCompletion } from '@/lib/tasks';
import { api } from '../../convex/_generated/api';

type CareType = 'senior' | 'disability' | 'childcare' | 'general';

export default function RecipientsScreen() {
  const colors = useColors();
  const recipients = useQuery(api.careRecipients.list);
  const createRecipient = useMutation(api.careRecipients.create);
  const createMedication = useMutation(api.medications.create);
  const updateMedication = useMutation(api.medications.update);
  const removeMedication = useMutation(api.medications.remove);
  const createSchedule = useMutation(api.schedule.create);
  const updateSchedule = useMutation(api.schedule.update);
  const removeSchedule = useMutation(api.schedule.remove);
  const createTask = useMutation(api.careLogs.create);
  const updateTask = useMutation(api.careLogs.update);
  const removeTask = useMutation(api.careLogs.remove);

  const [showAdd, setShowAdd] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState(new Date());
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medInstructions, setMedInstructions] = useState('');
  const [editingMedicationId, setEditingMedicationId] = useState<string | null>(null);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleType, setScheduleType] = useState<'appointment' | 'shift' | 'medication' | 'task'>('appointment');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [editingScheduleId, setEditingScheduleId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskAssigneeId, setTaskAssigneeId] = useState<string | null>(null);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [careType, setCareType] = useState<CareType>('senior');
  const [emoji, setEmoji] = useState('person-outline');
  const [conditions, setConditions] = useState('');

  const resetForm = () => {
    setName('');
    setCareType('senior');
    setEmoji('person-outline');
    setConditions('');
  };

  const resetMedicationForm = () => {
    setMedName('');
    setMedDosage('');
    setMedFrequency('');
    setMedInstructions('');
    setEditingMedicationId(null);
  };

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskAssigneeId(null);
    setTaskCompleted(false);
    setEditingTaskId(null);
  };

  const selectedRecipient = recipients?.find((recipient) => recipient._id === selectedRecipientId) ?? null;
  const medications = useQuery(
    api.medications.list,
    selectedRecipientId ? { careRecipientId: selectedRecipientId as any } : 'skip',
  );
  const scheduleItems = useQuery(
    api.schedule.list,
    selectedRecipientId ? { careRecipientId: selectedRecipientId as any, date: toDateInputValue(scheduleDate) } : 'skip',
  );
  const teamMembers = useQuery(
    api.careRecipients.getTeam,
    selectedRecipientId ? { careRecipientId: selectedRecipientId as any } : 'skip',
  );
  const taskLogs = useQuery(
    api.careLogs.list,
    selectedRecipientId ? { careRecipientId: selectedRecipientId as any } : 'skip',
  );
  const tasks = (taskLogs ?? []).filter((log: any) => log.type === 'task');
  const { incomplete: incompleteTasks, completed: completedTasks } = groupTasksByCompletion(tasks);

  const handleAdd = async () => {
    if (!name.trim()) {
      Alert.alert('Name Required', 'Please enter a name.');
      return;
    }
    setLoading(true);
    try {
      await createRecipient({
        name,
        careType,
        avatarEmoji: emoji,
        conditions: conditions || undefined,
      });
      notification(NotificationFeedbackType.Success);
      setShowAdd(false);
      resetForm();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDetail = (recipient: any) => {
    setSelectedRecipientId(recipient._id);
    setShowDetail(true);
    resetMedicationForm();
    resetScheduleForm();
    resetTaskForm();
  };

  const handleEditMedication = (medication: any) => {
    setEditingMedicationId(medication._id);
    setMedName(medication.name || '');
    setMedDosage(medication.dosage || '');
    setMedFrequency(medication.frequency || '');
    setMedInstructions(medication.instructions || '');
  };

  const handleDeleteMedication = (medication: any) => {
    Alert.alert('Delete Medication', `Remove ${medication.name || 'this medication'}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeMedication({ id: medication._id });
            notification(NotificationFeedbackType.Success);
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const resetScheduleForm = () => {
    setScheduleTitle('');
    setScheduleDescription('');
    setScheduleType('appointment');
    setScheduleStartTime('');
    setScheduleEndTime('');
    setEditingScheduleId(null);
  };

  const handleEditSchedule = (item: any) => {
    setEditingScheduleId(item._id);
    setScheduleTitle(item.title || '');
    setScheduleDescription(item.description || '');
    setScheduleType(item.type || 'appointment');
    setScheduleStartTime(item.startTime || '');
    setScheduleEndTime(item.endTime || '');
  };

  const handleDeleteSchedule = (item: any) => {
    Alert.alert('Delete Schedule Item', 'Remove this entry from the schedule?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeSchedule({ id: item._id });
            notification(NotificationFeedbackType.Success);
          } catch (err: any) {
            Alert.alert('Error', err.message);
          }
        },
      },
    ]);
  };

  const handleEditTask = (task: any) => {
    setEditingTaskId(task._id);
    setTaskTitle(task.title || '');
    setTaskDescription(task.description || '');
    setTaskAssigneeId(task.assigneeId || null);
    setTaskCompleted(Boolean(task.completed));
  };

  const handleDeleteTask = (task: any) => {
    Alert.alert('Delete Task', 'Remove this to-do item?', [
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

  const handleToggleTask = async (task: any) => {
    try {
      await updateTask({ id: task._id, completed: !task.completed });
      notification(NotificationFeedbackType.Success);
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const handleSaveTask = async () => {
    if (!selectedRecipientId || !taskTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a task title.');
      return;
    }

    setLoading(true);
    try {
      if (editingTaskId) {
        await updateTask({
          id: editingTaskId as any,
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          assigneeId: taskAssigneeId as any,
          completed: taskCompleted,
        });
      } else {
        await createTask({
          careRecipientId: selectedRecipientId as any,
          type: 'task',
          title: taskTitle.trim(),
          description: taskDescription.trim() || undefined,
          assigneeId: taskAssigneeId as any,
          completed: taskCompleted,
        });
      }
      notification(NotificationFeedbackType.Success);
      resetTaskForm();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSchedule = async () => {
    if (!selectedRecipientId || !scheduleTitle.trim()) {
      Alert.alert('Title Required', 'Please enter a schedule title.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        careRecipientId: selectedRecipientId as any,
        title: scheduleTitle.trim(),
        type: scheduleType,
        date: toDateInputValue(scheduleDate),
        startTime: scheduleStartTime || undefined,
        endTime: scheduleEndTime || undefined,
        description: scheduleDescription.trim() || undefined,
      };

      if (editingScheduleId) {
        await updateSchedule({ id: editingScheduleId as any, ...payload });
      } else {
        await createSchedule(payload as any);
      }
      notification(NotificationFeedbackType.Success);
      resetScheduleForm();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMedication = async () => {
    if (!selectedRecipientId) return;
    if (!medName.trim()) {
      Alert.alert('Name Required', 'Please enter a medication name.');
      return;
    }

    setLoading(true);
    try {
      if (editingMedicationId) {
        await updateMedication({
          id: editingMedicationId as any,
          careRecipientId: selectedRecipientId as any,
          name: medName.trim(),
          dosage: medDosage.trim() || 'As directed',
          frequency: medFrequency.trim() || 'Daily',
          instructions: medInstructions.trim() || undefined,
        });
      } else {
        await createMedication({
          careRecipientId: selectedRecipientId as any,
          name: medName.trim(),
          dosage: medDosage.trim() || 'As directed',
          frequency: medFrequency.trim() || 'Daily',
          instructions: medInstructions.trim() || undefined,
        });
      }
      notification(NotificationFeedbackType.Success);
      resetMedicationForm();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <NText variant="caption1" color={colors.accent} bold style={styles.overline}>
              PEOPLE
            </NText>
            <NText variant="title2" bold>Care circle</NText>
            <NText variant="subheadline" muted>Profiles, meds, tasks, and schedule.</NText>
          </View>
          <NButton
            title="Add"
            icon={<Ionicons name="add" size={18} color="#FFF" />}
            onPress={() => setShowAdd(true)}
            size="sm"
          />
        </View>

        {!recipients?.length ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="people-outline" size={48} color={colors.primary} />
            </View>
            <NText variant="title3" bold style={{ marginTop: Spacing.xl }}>
              No care recipients yet
            </NText>
            <NText variant="subheadline" muted center style={{ marginTop: Spacing.sm }}>
              Add someone you're caring for to get started
            </NText>
            <NButton
              title="Add Care Recipient"
              icon={<Ionicons name="add" size={18} color="#FFF" />}
              onPress={() => setShowAdd(true)}
              size="lg"
              style={{ marginTop: Spacing.xl }}
            />
          </View>
        ) : (
          <View style={styles.list}>
            {recipients.map((r) => (
              <TouchableOpacity key={r._id} activeOpacity={0.8} onPress={() => handleOpenDetail(r)}>
                <NCard style={styles.recipientCard} elevated>
                  <View style={[styles.recipientRail, { backgroundColor: colors.primary }]} />
                  <View style={styles.recipientRow}>
                    <PremiumAvatar value={r.avatarEmoji} size={56} />
                    <View style={styles.recipientInfo}>
                      <NText variant="title3" bold>{r.name}</NText>
                      <NText variant="footnote" muted style={{ textTransform: 'capitalize' }}>
                        {r.careType} care
                      </NText>
                      {r.conditions && (
                        <NText variant="caption1" muted numberOfLines={2} style={{ marginTop: 4 }}>
                          {r.conditions}
                        </NText>
                      )}
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                  </View>
                </NCard>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Recipient Detail Modal */}
      <Modal visible={showDetail} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}> 
          <View style={styles.modalHeader}>
            <NButton title="Close" variant="ghost" onPress={() => { setShowDetail(false); resetMedicationForm(); resetScheduleForm(); resetTaskForm(); }} />
            <NText variant="headline" bold>{selectedRecipient?.name || 'Patient'}</NText>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <NText variant="title3" bold>Medications</NText>
            <NText variant="subheadline" muted style={{ marginBottom: Spacing.lg }}>
              Visible to this patient and their care team only.
            </NText>

            {!medications?.length ? (
              <View style={styles.emptyState}>
                <Ionicons name="medkit-outline" size={40} color={colors.textTertiary} />
                <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
                  No medications yet
                </NText>
              </View>
            ) : (
              medications.map((medication) => (
                <NCard key={medication._id} style={{ marginBottom: Spacing.md }}>
                  <View style={styles.medicationRow}>
                    <View style={{ flex: 1 }}>
                      <NText variant="headline">{medication.name}</NText>
                      <NText variant="caption1" muted>
                        {medication.dosage || 'As directed'} · {medication.frequency || 'Daily'}
                      </NText>
                      {medication.instructions ? (
                        <NText variant="caption1" muted style={{ marginTop: 4 }}>
                          {medication.instructions}
                        </NText>
                      ) : null}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity onPress={() => handleEditMedication(medication)} style={{ marginRight: Spacing.sm }}>
                        <Ionicons name="create-outline" size={18} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteMedication(medication)}>
                        <Ionicons name="trash-outline" size={18} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </NCard>
              ))
            )}

            <View style={[styles.addSection, { borderTopColor: colors.border }]}>
              <NText variant="headline" bold style={{ marginBottom: Spacing.md }}>
                {editingMedicationId ? 'Update Medication' : 'Add Medication'}
              </NText>
              <NInput label="NAME" placeholder="Medication name" value={medName} onChangeText={setMedName} />
              <NInput label="DOSAGE" placeholder="e.g. 50mg" value={medDosage} onChangeText={setMedDosage} />
              <NInput label="FREQUENCY" placeholder="e.g. twice daily" value={medFrequency} onChangeText={setMedFrequency} />
              <NInput
                label="INSTRUCTIONS"
                placeholder="e.g. Take with food"
                value={medInstructions}
                onChangeText={setMedInstructions}
                multiline
                style={{ minHeight: 96, textAlignVertical: 'top' }}
              />
              <NButton title={editingMedicationId ? 'Update' : 'Add'} onPress={handleSaveMedication} loading={loading} fullWidth />
            </View>

            <View style={[styles.addSection, { borderTopColor: colors.border }]}>
              <NText variant="title3" bold style={{ marginBottom: Spacing.sm }}>Tasks</NText>
              <NText variant="subheadline" muted style={{ marginBottom: Spacing.lg }}>
                Keep a simple to-do list for this patient and assign items to the care team.
              </NText>

              {!tasks.length ? (
                <View style={styles.emptyState}>
                  <Ionicons name="checkbox-outline" size={40} color={colors.textTertiary} />
                  <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
                    No tasks yet
                  </NText>
                </View>
              ) : (
                <>
                  <NText variant="caption1" bold style={{ marginBottom: Spacing.sm }}>ACTIVE</NText>
                  {incompleteTasks.map((task: any) => (
                    <NCard key={task._id} style={{ marginBottom: Spacing.md }}>
                      <View style={styles.taskRow}>
                        <View style={{ flex: 1 }}>
                          <NText variant="headline">{task.title}</NText>
                          <NText variant="caption1" muted style={{ marginTop: 4 }}>
                            {formatTaskSummary({
                              description: task.description,
                              assigneeName: task.assigneeName,
                              completed: Boolean(task.completed),
                            })}
                          </NText>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <TouchableOpacity onPress={() => handleToggleTask(task)} style={{ marginRight: Spacing.sm }}>
                            <Ionicons name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'} size={18} color={task.completed ? colors.primary : colors.textSecondary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleEditTask(task)} style={{ marginRight: Spacing.sm }}>
                            <Ionicons name="create-outline" size={18} color={colors.primary} />
                          </TouchableOpacity>
                          <TouchableOpacity onPress={() => handleDeleteTask(task)}>
                            <Ionicons name="trash-outline" size={18} color={colors.error} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    </NCard>
                  ))}

                  {completedTasks.length > 0 && (
                    <>
                      <NText variant="caption1" bold style={{ marginTop: Spacing.lg, marginBottom: Spacing.sm }}>COMPLETED</NText>
                      {completedTasks.map((task: any) => (
                        <NCard key={task._id} style={{ marginBottom: Spacing.md, opacity: 0.8 }}>
                          <View style={styles.taskRow}>
                            <View style={{ flex: 1 }}>
                              <NText variant="headline">{task.title}</NText>
                              <NText variant="caption1" muted style={{ marginTop: 4 }}>
                                {formatTaskSummary({
                                  description: task.description,
                                  assigneeName: task.assigneeName,
                                  completed: Boolean(task.completed),
                                })}
                              </NText>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <TouchableOpacity onPress={() => handleToggleTask(task)} style={{ marginRight: Spacing.sm }}>
                                <Ionicons name={task.completed ? 'checkmark-circle' : 'checkmark-circle-outline'} size={18} color={task.completed ? colors.primary : colors.textSecondary} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleEditTask(task)} style={{ marginRight: Spacing.sm }}>
                                <Ionicons name="create-outline" size={18} color={colors.primary} />
                              </TouchableOpacity>
                              <TouchableOpacity onPress={() => handleDeleteTask(task)}>
                                <Ionicons name="trash-outline" size={18} color={colors.error} />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </NCard>
                      ))}
                    </>
                  )}
                </>
              )}

              <View style={[styles.addSection, { borderTopColor: colors.border, marginTop: Spacing.xl, paddingTop: Spacing.xl }]}> 
                <NText variant="headline" bold style={{ marginBottom: Spacing.md }}>
                  {editingTaskId ? 'Update Task' : 'Add Task'}
                </NText>
                <NInput label="TITLE" placeholder="e.g. Change sheets" value={taskTitle} onChangeText={setTaskTitle} />
                <NInput label="DETAILS" placeholder="Optional details" value={taskDescription} onChangeText={setTaskDescription} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
                {(teamMembers?.length ?? 0) > 1 ? (
                  <View style={{ marginTop: Spacing.md }}>
                    <NText variant="caption1" bold style={{ marginBottom: Spacing.sm }}>ASSIGN TO</NText>
                    <SelectionCard title="Unassigned" selected={!taskAssigneeId} onPress={() => setTaskAssigneeId(null)} />
                    {teamMembers?.map((member: any) => (
                      <SelectionCard
                        key={member.userId}
                        title={member.name}
                        subtitle={member.profileRole || member.role}
                        selected={taskAssigneeId === member.userId}
                        onPress={() => setTaskAssigneeId(member.userId)}
                      />
                    ))}
                  </View>
                ) : null}
                <View style={{ marginTop: Spacing.md }}>
                  <SelectionCard
                    title={taskCompleted ? 'Completed' : 'Mark as complete'}
                    ionIcon={taskCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    selected={taskCompleted}
                    onPress={() => setTaskCompleted(!taskCompleted)}
                  />
                </View>
                <NButton title={editingTaskId ? 'Update' : 'Add'} onPress={handleSaveTask} loading={loading} fullWidth style={{ marginTop: Spacing.md }} />
              </View>
            </View>

            <View style={[styles.addSection, { borderTopColor: colors.border }]}> 
              <NText variant="subheadline" muted style={{ marginBottom: Spacing.lg }}>
                Care team members can add or remove schedule items for this patient.
              </NText>

              {!scheduleItems?.length ? (
                <View style={styles.emptyState}>
                  <Ionicons name="calendar-outline" size={40} color={colors.textTertiary} />
                  <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
                    No schedule items yet
                  </NText>
                </View>
              ) : (
                scheduleItems.map((item: any) => (
                  <NCard key={item._id} style={{ marginBottom: Spacing.md }}>
                    <View style={styles.scheduleItemRow}>
                      <View style={{ flex: 1 }}>
                        <NText variant="headline">{item.title}</NText>
                        <NText variant="caption1" muted>
                          {item.type} · {item.startTime || 'All day'}
                        </NText>
                        {item.description ? (
                          <NText variant="caption1" muted style={{ marginTop: 4 }}>
                            {item.description}
                          </NText>
                        ) : null}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <TouchableOpacity onPress={() => handleEditSchedule(item)} style={{ marginRight: Spacing.sm }}>
                          <Ionicons name="create-outline" size={18} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteSchedule(item)}>
                          <Ionicons name="trash-outline" size={18} color={colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </NCard>
                ))
              )}

              <View style={[styles.addSection, { borderTopColor: colors.border, marginTop: Spacing.xl, paddingTop: Spacing.xl }]}> 
                <NText variant="headline" bold style={{ marginBottom: Spacing.md }}>
                  {editingScheduleId ? 'Update Schedule Item' : 'Add Schedule Item'}
                </NText>
              <NInput label="TITLE" placeholder="e.g. Physical therapy" value={scheduleTitle} onChangeText={setScheduleTitle} />
              <NInput label="NOTES" placeholder="Optional details" value={scheduleDescription} onChangeText={setScheduleDescription} multiline style={{ minHeight: 80, textAlignVertical: 'top' }} />
              {(['appointment', 'shift', 'medication', 'task'] as const).map((option) => (
                <SelectionCard
                  key={option}
                  title={option.charAt(0).toUpperCase() + option.slice(1)}
                  icon={option === 'appointment' ? 'medical-outline' : option === 'shift' ? 'person-outline' : option === 'medication' ? 'medkit-outline' : 'checkmark-circle-outline'}
                  selected={scheduleType === option}
                  onPress={() => setScheduleType(option)}
                />
              ))}
              <NInput label="START TIME" placeholder="09:00" value={scheduleStartTime} onChangeText={setScheduleStartTime} />
              <NInput label="END TIME" placeholder="10:00" value={scheduleEndTime} onChangeText={setScheduleEndTime} />
              <NButton title={editingScheduleId ? 'Update' : 'Add'} onPress={handleSaveSchedule} loading={loading} fullWidth />
            </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <NButton title="Cancel" variant="ghost" onPress={() => { setShowAdd(false); resetForm(); }} />
            <NText variant="headline" bold>Add Care Recipient</NText>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <NText variant="headline" style={styles.label}>Avatar</NText>
            <EmojiPicker selected={emoji} onSelect={setEmoji} />

            <NInput
              label="NAME"
              placeholder="e.g. Mom, Dad, Sarah"
              value={name}
              onChangeText={setName}
              style={{ marginTop: Spacing.xl }}
            />

            <NText variant="headline" style={styles.label}>Care Type</NText>
            {(['senior', 'disability', 'childcare', 'general'] as CareType[]).map((t) => {
              const icons: Record<CareType, string> = {
                senior: 'person-outline', disability: 'accessibility-outline', childcare: 'happy-outline', general: 'heart-outline',
              };
              return (
                <SelectionCard
                  key={t}
                  title={t.charAt(0).toUpperCase() + t.slice(1)}
                  icon={icons[t]}
                  selected={careType === t}
                  onPress={() => setCareType(t)}
                />
              );
            })}

            <NInput
              label="CONDITIONS / NOTES (OPTIONAL)"
              placeholder="Any conditions or notes"
              value={conditions}
              onChangeText={setConditions}
              multiline
            />

            <NButton
              title="Add Recipient"
              onPress={handleAdd}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  overline: {
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing['5xl'],
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { gap: Spacing.md },
  recipientCard: {
    overflow: 'hidden',
  },
  recipientRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
  recipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  recipientInfo: { flex: 1 },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  modalContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  label: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  medicationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  scheduleItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  addSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.xl,
    borderTopWidth: 1,
  },
});
