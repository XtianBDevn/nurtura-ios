/**
 * Nurtura Onboarding — 6-step flow
 * Step 0: Role Selection (Professional / Family)
 * Step 1: Profile (name, phone)
 * Step 2: Display & Accessibility
 * Step 3: Care Recipient
 * Step 4: Meet Ivy AI
 * Step 5: All Set!
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NInput } from '@/components/NInput';
import { NCard } from '@/components/NCard';
import { SelectionCard } from '@/components/SelectionCard';
import { EmojiPicker } from '@/components/EmojiPicker';
import { useColors } from '@/hooks/useThemeColor';
import { Spacing, Radius } from '@/lib/theme';
import { api } from '../../convex/_generated/api';

const TOTAL_STEPS = 6;

type Role = 'professional' | 'family' | null;
type AgeGroup = 'under_65' | '65_plus' | null;
type TextSize = 'small' | 'medium' | 'large' | 'extra-large';
type CareType = 'senior' | 'disability' | 'childcare' | 'general';

export default function OnboardingScreen() {
  const colors = useColors();
  const createProfile = useMutation(api.profiles.create);
  const createRecipient = useMutation(api.careRecipients.create);
  const completeOnboarding = useMutation(api.profiles.completeOnboarding);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Step 0
  const [role, setRole] = useState<Role>(null);
  // Step 1
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  // Step 2
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null);
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [highContrast, setHighContrast] = useState(false);
  // Step 3
  const [recipientName, setRecipientName] = useState('');
  const [careType, setCareType] = useState<CareType>('senior');
  const [avatarEmoji, setAvatarEmoji] = useState('👴');
  const [conditions, setConditions] = useState('');
  // Step 4 - chat animation
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  const animateTransition = (next: number) => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(next), 150);
  };

  const goNext = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    animateTransition(step + 1);
  };
  const goBack = () => {
    if (step > 0) animateTransition(step - 1);
  };

  // Step 4 chat animation
  useEffect(() => {
    if (step !== 4) return;
    const msgs = [
      "Hi there! 👋 I'm Ivy, your Nurtura assistant.",
      "I can walk you through the app, answer questions about caregiving...",
      "On Plus, I'm available anytime. On Professional, I'm here 24/7. 🌿",
      "Ready to finish setting up? Let's go! →",
    ];
    setChatMessages([]);
    msgs.forEach((msg, i) => {
      setTimeout(() => {
        setChatMessages((prev) => [...prev, msg]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }, (i + 1) * 1200);
    });
  }, [step]);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await createProfile({
        role: role!,
        firstName,
        lastName,
        phone: phone || undefined,
        ageGroup: ageGroup ?? undefined,
        textSize,
        highContrast,
      });

      if (recipientName.trim()) {
        await createRecipient({
          name: recipientName,
          careType,
          avatarEmoji,
          conditions: conditions || undefined,
        });
      }

      await completeOnboarding({});
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.progressSegment,
            {
              backgroundColor: i <= step ? colors.primary : colors.surfaceMuted,
            },
          ]}
        />
      ))}
    </View>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="leaf" size={32} color={colors.primary} />
            </View>
            <NText variant="title2" bold center>Welcome to Nurtura</NText>
            <NText variant="subheadline" muted center style={styles.stepSub}>
              Let's set up your caregiving hub
            </NText>

            <NText variant="headline" style={styles.label}>I am a...</NText>
            <SelectionCard
              title="Professional Caregiver"
              subtitle="CNA, HHA, aide, or paid caregiver"
              ionIcon="briefcase-outline"
              selected={role === 'professional'}
              onPress={() => setRole('professional')}
            />
            <SelectionCard
              title="Family Caregiver"
              subtitle="Caring for a loved one"
              ionIcon="people-outline"
              selected={role === 'family'}
              onPress={() => setRole('family')}
            />

            <NButton
              title="Continue →"
              onPress={goNext}
              disabled={!role}
              fullWidth
              size="lg"
              style={styles.nextBtn}
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="person-outline" size={32} color={colors.primary} />
            </View>
            <NText variant="title2" bold center>Your Profile</NText>
            <NText variant="subheadline" muted center style={styles.stepSub}>
              This helps your care team identify you
            </NText>

            <NInput label="FIRST NAME" placeholder="First name" value={firstName} onChangeText={setFirstName} />
            <NInput label="LAST NAME" placeholder="Last name" value={lastName} onChangeText={setLastName} />
            <NInput label="PHONE (OPTIONAL)" placeholder="(555) 123-4567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            <View style={styles.navRow}>
              <NButton title="← Back" variant="ghost" onPress={goBack} />
              <NButton
                title="Continue →"
                onPress={goNext}
                disabled={!firstName.trim() || !lastName.trim()}
                size="lg"
                style={{ flex: 1, marginLeft: Spacing.sm }}
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="eye-outline" size={32} color={colors.primary} />
            </View>
            <NText variant="title2" bold center>Display & Accessibility</NText>
            <NText variant="subheadline" muted center style={styles.stepSub}>
              Let's make Nurtura comfortable for your eyes
            </NText>

            <NText variant="headline" style={styles.label}>Age Group</NText>
            <SelectionCard
              title="Under 65"
              selected={ageGroup === 'under_65'}
              onPress={() => setAgeGroup('under_65')}
            />
            <SelectionCard
              title="65 or Older"
              badge="Optimized for you"
              selected={ageGroup === '65_plus'}
              onPress={() => {
                setAgeGroup('65_plus');
                setTextSize('large');
                setHighContrast(true);
              }}
            />

            <NText variant="headline" style={styles.label}>Text Size</NText>
            <View style={styles.sizeRow}>
              {(['small', 'medium', 'large', 'extra-large'] as TextSize[]).map((s) => {
                const sizes = { small: 14, medium: 16, large: 20, 'extra-large': 24 };
                return (
                  <SelectionCard
                    key={s}
                    title={s.charAt(0).toUpperCase() + s.slice(1).replace('-', ' ')}
                    subtitle={`${sizes[s]}px`}
                    selected={textSize === s}
                    onPress={() => setTextSize(s)}
                  />
                );
              })}
            </View>

            <SelectionCard
              title="High Contrast"
              subtitle="Bolder colors and sharper text"
              ionIcon={highContrast ? 'contrast' : 'contrast-outline'}
              selected={highContrast}
              onPress={() => setHighContrast(!highContrast)}
            />

            <View style={styles.navRow}>
              <NButton title="← Back" variant="ghost" onPress={goBack} />
              <NButton title="Continue →" onPress={goNext} size="lg" style={{ flex: 1, marginLeft: Spacing.sm }} />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="heart-outline" size={32} color={colors.primary} />
            </View>
            <NText variant="title2" bold center>Who Are You Caring For?</NText>
            <NText variant="subheadline" muted center style={styles.stepSub}>
              You can add more later
            </NText>

            <NText variant="headline" style={styles.label}>Choose an Avatar</NText>
            <EmojiPicker selected={avatarEmoji} onSelect={setAvatarEmoji} />

            <NInput
              label="NAME"
              placeholder="e.g. Mom, Dad, Sarah"
              value={recipientName}
              onChangeText={setRecipientName}
              style={{ marginTop: Spacing.lg }}
            />

            <NText variant="headline" style={styles.label}>Care Type</NText>
            <View style={styles.typeGrid}>
              {(['senior', 'disability', 'childcare', 'general'] as CareType[]).map((t) => {
                const icons: Record<CareType, string> = { senior: '👴', disability: '♿', childcare: '👶', general: '💚' };
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
            </View>

            <NInput
              label="CONDITIONS / NOTES (OPTIONAL)"
              placeholder="Any conditions or special notes"
              value={conditions}
              onChangeText={setConditions}
              multiline
            />

            <View style={styles.navRow}>
              <NButton title="← Back" variant="ghost" onPress={goBack} />
              <NButton title="Continue →" onPress={goNext} size="lg" style={{ flex: 1, marginLeft: Spacing.sm }} />
            </View>
            <NButton
              title="Skip for now"
              variant="ghost"
              onPress={() => { setRecipientName(''); goNext(); }}
              style={{ marginTop: Spacing.sm, alignSelf: 'center' }}
            />
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={32} color={colors.primary} />
            </View>
            <NText variant="title2" bold center>Meet Ivy, Your Care Assistant</NText>

            <View style={styles.chatContainer}>
              {chatMessages.map((msg, i) => (
                <Animated.View key={i} style={[styles.chatBubble, { backgroundColor: colors.primaryLight }]}>
                  <View style={styles.chatHeader}>
                    <View style={[styles.ivyBadge, { backgroundColor: colors.primary }]}>
                      <Ionicons name="leaf" size={12} color="#FFF" />
                    </View>
                    <NText variant="caption2" bold color={colors.primary}>Ivy</NText>
                  </View>
                  <NText variant="subheadline">{msg}</NText>
                </Animated.View>
              ))}
              {chatMessages.length < 4 && (
                <View style={[styles.typingIndicator, { backgroundColor: colors.surfaceMuted }]}>
                  <View style={[styles.dot, { backgroundColor: colors.textTertiary }]} />
                  <View style={[styles.dot, { backgroundColor: colors.textTertiary, opacity: 0.6 }]} />
                  <View style={[styles.dot, { backgroundColor: colors.textTertiary, opacity: 0.3 }]} />
                </View>
              )}
            </View>

            <View style={styles.navRow}>
              <NButton title="← Back" variant="ghost" onPress={goBack} />
              <NButton title="Continue →" onPress={goNext} size="lg" style={{ flex: 1, marginLeft: Spacing.sm }} />
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.stepContent}>
            <View style={[styles.stepIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="sparkles" size={32} color={colors.primary} />
            </View>
            <NText variant="title2" bold center>You're All Set!</NText>
            <NText variant="subheadline" muted center style={styles.stepSub}>
              Your Nurtura hub is ready
            </NText>

            <View style={styles.summaryGrid}>
              {[
                { icon: 'clipboard-outline', label: 'Log daily care activities' },
                { icon: 'medkit-outline', label: 'Track medications' },
                { icon: 'calendar-outline', label: 'Manage schedules' },
                { icon: 'people-outline', label: 'Coordinate with your care team' },
                { icon: 'link-outline', label: 'Sync with calendar & email' },
                { icon: 'chatbubble-outline', label: 'Chat with Ivy' },
              ].map((item) => (
                <View key={item.label} style={styles.summaryItem}>
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                  <NText variant="subheadline" style={{ marginLeft: Spacing.md, flex: 1 }}>{item.label}</NText>
                </View>
              ))}
            </View>

            <NButton
              title="Go to Dashboard →"
              onPress={handleComplete}
              loading={loading}
              fullWidth
              size="lg"
              style={styles.nextBtn}
            />
          </View>
        );
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {renderProgressBar()}
      <Animated.View style={{ opacity: fadeAnim }}>
        {renderStep()}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingTop: 70,
    paddingHorizontal: Spacing.xl,
    paddingBottom: 40,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: Spacing['3xl'],
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepContent: {
    paddingTop: Spacing.lg,
  },
  stepIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  stepSub: {
    marginTop: Spacing.xs,
    marginBottom: Spacing['2xl'],
  },
  label: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sizeRow: {},
  typeGrid: {},
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing['2xl'],
  },
  nextBtn: {
    marginTop: Spacing['2xl'],
  },
  // Chat
  chatContainer: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  chatBubble: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    maxWidth: '85%',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  ivyBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typingIndicator: {
    flexDirection: 'row',
    gap: 4,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    alignSelf: 'flex-start',
    width: 60,
    justifyContent: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Summary
  summaryGrid: {
    gap: Spacing.lg,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
