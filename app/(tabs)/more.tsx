/**
 * More Tab — Settings hub
 * Medications, Messages, Time Tracking, Integrations, Subscription, Security, Profile
 */
import React, { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import { useAuthActions } from '@convex-dev/auth/react';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NCard } from '@/components/NCard';
import { NInput } from '@/components/NInput';
import { SelectionCard } from '@/components/SelectionCard';
import { useColors } from '@/hooks/useThemeColor';
import { ImpactFeedbackStyle, NotificationFeedbackType, impact, notification } from '@/lib/haptics';
import { Spacing, Radius } from '@/lib/theme';
import { api } from '../../convex/_generated/api';

type ModalType = 'medications' | 'messages' | 'timeTracking' | 'subscription' | 'security' | null;

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  subtitle: string;
  color: string;
  modal: ModalType;
  badge?: string;
}

export default function MoreScreen() {
  const colors = useColors();
  const { signOut } = useAuthActions();
  const profile = useQuery(api.profiles.get);
  const recipients = useQuery(api.careRecipients.list);
  const medications = useQuery(api.medications.listAll);
  const messages = useQuery(api.messages.listAll, {});
  const subscription = useQuery(api.subscriptions.get);
  const activeShift = useQuery(api.timeEntries.getActive);

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('');
  const [medFrequency, setMedFrequency] = useState('');
  const [medRecipientId, setMedRecipientId] = useState<string | null>(null);
  const [timeRecipientId, setTimeRecipientId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState('0:00:00');
  const [loading, setLoading] = useState(false);

  const createMed = useMutation(api.medications.create);
  const clockIn = useMutation(api.timeEntries.clockIn);
  const clockOut = useMutation(api.timeEntries.clockOut);

  // Live shift timer — ticks while a shift is active
  useEffect(() => {
    if (!activeShift) {
      setElapsed('0:00:00');
      return;
    }
    const startMs = activeShift.startedAt ?? activeShift._creationTime;
    const tick = () => {
      const diff = Math.max(0, Date.now() - startMs);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1000);
      setElapsed(`${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [activeShift]);

  const handleToggleShift = async () => {
    impact(ImpactFeedbackStyle.Medium);
    try {
      if (activeShift) {
        await clockOut({ id: activeShift._id });
        notification(NotificationFeedbackType.Success);
      } else {
        const recipientId = timeRecipientId ?? recipients?.[0]?._id;
        if (!recipientId) {
          Alert.alert('No Recipient', 'Add a care recipient before tracking time.');
          return;
        }
        await clockIn({ careRecipientId: recipientId as any });
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const menuItems: MenuItem[] = [
    {
      icon: 'medkit',
      label: 'Medications',
      subtitle: `${medications?.length || 0} active`,
      color: colors.chart2,
      modal: 'medications',
    },
    {
      icon: 'chatbubbles',
      label: 'Messages',
      subtitle: 'Team communication',
      color: colors.chart3,
      modal: 'messages',
      badge: messages?.length ? String(messages.length) : undefined,
    },
    {
      icon: 'time',
      label: 'Time Tracking',
      subtitle: 'Log professional hours',
      color: colors.chart4,
      modal: 'timeTracking',
    },
    {
      icon: 'sparkles',
      label: 'Subscription',
      subtitle: subscription?.plan || 'Free Plan',
      color: colors.primary,
      modal: 'subscription',
    },
    {
      icon: 'shield-checkmark',
      label: 'Security & Privacy',
      subtitle: 'Data protection',
      color: colors.success,
      modal: 'security',
    },
  ];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/');
        },
      },
    ]);
  };

  const handleAddMed = async () => {
    if (!medName.trim()) return;
    const recipientId = medRecipientId ?? recipients?.[0]?._id;
    if (!recipientId) {
      Alert.alert('No Recipient', 'Add a care recipient before adding medications.');
      return;
    }
    setLoading(true);
    try {
      await createMed({
        careRecipientId: recipientId as any,
        name: medName,
        dosage: medDosage.trim() || 'As directed',
        frequency: medFrequency.trim() || 'Daily',
      });
      notification(NotificationFeedbackType.Success);
      setMedName('');
      setMedDosage('');
      setMedFrequency('');
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderModal = () => {
    switch (activeModal) {
      case 'medications':
        return (
          <View style={styles.modalBody}>
            <NText variant="title3" bold>Medications</NText>
            <NText variant="subheadline" muted style={{ marginBottom: Spacing.xl }}>
              Track medications for your care recipients
            </NText>

            {!medications?.length ? (
              <View style={styles.emptyState}>
                <Ionicons name="medkit-outline" size={40} color={colors.textTertiary} />
                <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
                  No medications yet
                </NText>
              </View>
            ) : (
              medications.map((med) => (
                <NCard key={med._id} style={{ marginBottom: Spacing.md }}>
                  <View style={styles.medRow}>
                    <Ionicons name="medical" size={20} color={colors.chart2} />
                    <View style={{ flex: 1, marginLeft: Spacing.md }}>
                      <NText variant="headline">{med.name}</NText>
                      <NText variant="caption1" muted>
                        {med.recipientEmoji} {med.recipientName} · {med.dosage} · {med.frequency}
                      </NText>
                    </View>
                    <View style={[styles.statusDot, { backgroundColor: med.active ? colors.success : colors.textTertiary }]} />
                  </View>
                </NCard>
              ))
            )}

            <View style={[styles.addSection, { borderTopColor: colors.border }]}>
              <NText variant="headline" bold style={{ marginBottom: Spacing.md }}>
                Add Medication
              </NText>
              {(recipients?.length ?? 0) > 1 && (
                <>
                  <NText variant="footnote" bold muted style={{ marginBottom: Spacing.sm }}>FOR</NText>
                  {recipients?.map((r) => (
                    <SelectionCard
                      key={r._id}
                      title={r.name}
                      icon={r.avatarEmoji || '👤'}
                      selected={(medRecipientId ?? recipients?.[0]?._id) === r._id}
                      onPress={() => setMedRecipientId(r._id)}
                    />
                  ))}
                </>
              )}
              <NInput label="NAME" placeholder="Medication name" value={medName} onChangeText={setMedName} />
              <NInput label="DOSAGE" placeholder="e.g. 50mg" value={medDosage} onChangeText={setMedDosage} />
              <NInput label="FREQUENCY" placeholder="e.g. twice daily" value={medFrequency} onChangeText={setMedFrequency} />
              <NButton title="Add" onPress={handleAddMed} loading={loading} fullWidth />
            </View>
          </View>
        );

      case 'messages':
        return (
          <View style={styles.modalBody}>
            <NText variant="title3" bold>Messages</NText>
            <NText variant="subheadline" muted style={{ marginBottom: Spacing.xl }}>
              Care team communication
            </NText>

            {!messages?.length ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={40} color={colors.textTertiary} />
                <NText variant="subheadline" muted style={{ marginTop: Spacing.md }}>
                  No messages yet
                </NText>
              </View>
            ) : (
              messages.map((msg) => (
                <NCard key={msg._id} style={{ marginBottom: Spacing.md }}>
                  <View style={styles.msgRow}>
                    <View style={[styles.msgAvatar, { backgroundColor: colors.primaryLight }]}>
                      <NText variant="headline">{msg.userName?.[0] || '?'}</NText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <NText variant="headline">{msg.userName || 'Unknown'}</NText>
                      <NText variant="caption2" muted>
                        {msg.recipientEmoji} {msg.recipientName}
                      </NText>
                      <NText variant="subheadline" muted numberOfLines={2}>{msg.content}</NText>
                      <NText variant="caption2" muted style={{ marginTop: 2 }}>
                        {new Date(msg.timestamp).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </NText>
                    </View>
                  </View>
                </NCard>
              ))
            )}
          </View>
        );

      case 'timeTracking':
        return (
          <View style={styles.modalBody}>
            <NText variant="title3" bold>Time Tracking</NText>
            <NText variant="subheadline" muted style={{ marginBottom: Spacing.xl }}>
              Professional caregiver time logs
            </NText>

            {!activeShift && (recipients?.length ?? 0) > 1 && (
              <>
                <NText variant="footnote" bold muted style={{ marginBottom: Spacing.sm }}>CARE RECIPIENT</NText>
                {recipients?.map((r) => (
                  <SelectionCard
                    key={r._id}
                    title={r.name}
                    icon={r.avatarEmoji || '👤'}
                    selected={(timeRecipientId ?? recipients?.[0]?._id) === r._id}
                    onPress={() => setTimeRecipientId(r._id)}
                  />
                ))}
              </>
            )}

            <NCard>
              <View style={styles.timerSection}>
                <NText variant="largeTitle" bold center style={{ letterSpacing: -2, color: activeShift ? colors.primary : colors.text }}>
                  {elapsed}
                </NText>
                <NText variant="footnote" muted center style={{ marginTop: Spacing.sm }}>
                  {activeShift
                    ? `On shift with ${activeShift.recipientName}`
                    : 'Start the timer to log a shift'}
                </NText>
                <View style={styles.timerBtns}>
                  <NButton
                    title={activeShift ? 'End Shift' : 'Start Shift'}
                    variant={activeShift ? 'danger' : 'primary'}
                    onPress={handleToggleShift}
                    fullWidth
                    size="lg"
                  />
                </View>
              </View>
            </NCard>
          </View>
        );

      case 'subscription':
        return (
          <View style={styles.modalBody}>
            <NText variant="title3" bold>Subscription</NText>
            <NText variant="subheadline" muted style={{ marginBottom: Spacing.xl }}>
              Manage your Nurtura plan
            </NText>

            {[
              {
                name: 'Free', price: '$0',
                features: ['1 care recipient', 'Basic logging', '7-day history'],
                current: !subscription || subscription.plan === 'free',
              },
              {
                name: 'Plus', price: '$9.99/mo',
                features: ['3 recipients', 'Ivy AI chatbot', 'Calendar sync', 'No ads'],
                current: subscription?.plan === 'plus',
                popular: true,
              },
              {
                name: 'Professional', price: '$24.99/mo',
                features: ['Unlimited recipients', '24/7 Ivy', 'FHIR/MyChart', 'Priority support'],
                current: subscription?.plan === 'professional',
              },
            ].map((plan) => (
              <NCard
                key={plan.name}
                style={[
                  { marginBottom: Spacing.md },
                  plan.current && { borderColor: colors.primary, borderWidth: 2 },
                ]}
              >
                <View style={styles.planRow}>
                  <View>
                    <NText variant="title3" bold>{plan.name}</NText>
                    <NText variant="headline" color={colors.primary}>{plan.price}</NText>
                  </View>
                  {plan.current && (
                    <View style={[styles.currentBadge, { backgroundColor: colors.primaryLight }]}>
                      <NText variant="caption2" color={colors.primary} bold>CURRENT</NText>
                    </View>
                  )}
                </View>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                    <NText variant="subheadline" style={{ marginLeft: Spacing.sm }}>{f}</NText>
                  </View>
                ))}
                {!plan.current && (
                  <NButton
                    title="Upgrade"
                    variant={plan.popular ? 'primary' : 'outline'}
                    onPress={() => Alert.alert('Coming Soon', 'In-app purchases coming soon!')}
                    fullWidth
                    style={{ marginTop: Spacing.lg }}
                  />
                )}
              </NCard>
            ))}
          </View>
        );

      case 'security':
        return (
          <View style={styles.modalBody}>
            <NText variant="title3" bold>Security & Privacy</NText>
            <NText variant="subheadline" muted style={{ marginBottom: Spacing.xl }}>
              Your data is protected
            </NText>

            {[
              { icon: 'lock-closed', title: 'Encryption in Transit', desc: 'All data is encrypted over TLS to the backend', status: 'on' },
              { icon: 'key', title: 'Secure Token Storage', desc: 'Auth tokens stored in the iOS Keychain', status: 'on' },
              { icon: 'shield-checkmark', title: 'Team-Based Access', desc: 'Care data is scoped to authorized team members', status: 'on' },
              { icon: 'finger-print', title: 'Biometric App Lock', desc: 'Require Face ID / Touch ID to open', status: 'soon' },
              { icon: 'document-text', title: 'Export My Data', desc: 'Download a copy of your data', status: 'soon' },
            ].map((item) => (
              <NCard key={item.title} style={{ marginBottom: Spacing.md }}>
                <View style={styles.securityRow}>
                  <Ionicons name={item.icon as any} size={22} color={colors.primary} />
                  <View style={{ flex: 1, marginLeft: Spacing.md }}>
                    <NText variant="headline">{item.title}</NText>
                    <NText variant="caption1" muted>{item.desc}</NText>
                  </View>
                  {item.status === 'on' ? (
                    <Ionicons name="checkmark-circle" size={22} color={colors.success} />
                  ) : (
                    <View style={[styles.currentBadge, { backgroundColor: colors.surfaceMuted }]}>
                      <NText variant="caption2" muted bold>SOON</NText>
                    </View>
                  )}
                </View>
              </NCard>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <NCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="person" size={28} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <NText variant="title3" bold>
                {profile?.firstName} {profile?.lastName}
              </NText>
              <NText variant="footnote" muted style={{ textTransform: 'capitalize' }}>
                {profile?.role || 'Caregiver'} · {subscription?.plan || 'Free'} Plan
              </NText>
            </View>
          </View>
        </NCard>

        {/* Menu Items */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.label}
            activeOpacity={0.6}
            onPress={() => {
              impact(ImpactFeedbackStyle.Light);
              setActiveModal(item.modal);
            }}
          >
            <NCard style={styles.menuItem}>
              <View style={styles.menuRow}>
                <View style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons name={item.icon} size={20} color={item.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <NText variant="headline">{item.label}</NText>
                  <NText variant="caption1" muted>{item.subtitle}</NText>
                </View>
                {item.badge && (
                  <View style={[styles.badgePill, { backgroundColor: colors.primary }]}>
                    <NText variant="caption2" color="#FFF" bold>{item.badge}</NText>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
              </View>
            </NCard>
          </TouchableOpacity>
        ))}

        {/* Integrations */}
        <TouchableOpacity activeOpacity={0.6} onPress={() => Alert.alert('Coming Soon', 'Integration settings coming soon!')}>
          <NCard style={styles.menuItem}>
            <View style={styles.menuRow}>
              <View style={[styles.menuIcon, { backgroundColor: `${colors.info}15` }]}>
                <Ionicons name="link" size={20} color={colors.info} />
              </View>
              <View style={{ flex: 1 }}>
                <NText variant="headline">Integrations</NText>
                <NText variant="caption1" muted>Calendar, MyChart, FHIR</NText>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
            </View>
          </NCard>
        </TouchableOpacity>

        {/* Sign Out */}
        <NButton
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          fullWidth
          style={{ marginTop: Spacing['2xl'] }}
          icon={<Ionicons name="log-out-outline" size={18} color={colors.text} />}
        />

        <NText variant="caption1" muted center style={{ marginTop: Spacing.xl }}>
          Nurtura v1.0.0 · Bon Air Media
        </NText>
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!activeModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <NButton title="Done" variant="ghost" onPress={() => setActiveModal(null)} />
          </View>
          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {renderModal()}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: Spacing.xl, paddingBottom: 40 },
  profileCard: { marginBottom: Spacing.xl },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItem: { marginBottom: Spacing.sm },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    marginRight: Spacing.xs,
  },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  modalContent: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  modalBody: {},
  // Medications
  medRow: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  addSection: { borderTopWidth: 1, marginTop: Spacing.xl, paddingTop: Spacing.xl },
  // Messages
  msgRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  msgAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing['3xl'] },
  // Time tracking
  timerSection: { paddingVertical: Spacing.xl },
  timerBtns: { marginTop: Spacing.xl },
  // Subscription
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  currentBadge: { paddingHorizontal: Spacing.md, paddingVertical: 4, borderRadius: Radius.full },
  featureRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm },
  // Security
  securityRow: { flexDirection: 'row', alignItems: 'center' },
});
