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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NCard } from '@/components/NCard';
import { NInput } from '@/components/NInput';
import { SelectionCard } from '@/components/SelectionCard';
import { EmojiPicker } from '@/components/EmojiPicker';
import { useColors } from '@/hooks/useThemeColor';
import { Spacing } from '@/lib/theme';
import { api } from '../../convex/_generated/api';

type CareType = 'senior' | 'disability' | 'childcare' | 'general';

export default function RecipientsScreen() {
  const colors = useColors();
  const recipients = useQuery(api.careRecipients.list);
  const createRecipient = useMutation(api.careRecipients.create);

  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [careType, setCareType] = useState<CareType>('senior');
  const [emoji, setEmoji] = useState('👴');
  const [conditions, setConditions] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setName('');
    setCareType('senior');
    setEmoji('👴');
    setConditions('');
  };

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
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAdd(false);
      resetForm();
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
          <NText variant="title2" bold>Care Recipients</NText>
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
              <NCard key={r._id} style={styles.recipientCard}>
                <View style={styles.recipientRow}>
                  <NText style={{ fontSize: 40 }}>{r.avatarEmoji || '👤'}</NText>
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
            ))}
          </View>
        )}
      </ScrollView>

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
                senior: '👴', disability: '♿', childcare: '👶', general: '💚',
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
  content: { padding: Spacing.xl, paddingBottom: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
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
  recipientCard: {},
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
});
