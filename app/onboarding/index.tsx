/**
 * Nurtura Onboarding & Clinical Intake
 *
 * A guided, animated flow that builds the caregiver's profile and a
 * comprehensive health profile for the first care recipient, then previews
 * a personalized, rule-based care plan before entering the app.
 *
 * Steps: Role → Caregiver Profile → Accessibility → Recipient Basics →
 * Conditions → Allergies & Meds → Mobility & Falls → Cognition →
 * Independence (ADL/IADL) → Quality of Life → Care Plan → Meet Ivy → Done
 */
import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConvexAuth, useMutation } from 'convex/react';
import { useAuthToken } from '@convex-dev/auth/react';
import { NText } from '@/components/NText';
import { NInput } from '@/components/NInput';
import { SelectionCard } from '@/components/SelectionCard';
import { EmojiPicker } from '@/components/EmojiPicker';
import { StepShell } from '@/components/StepShell';
import { MultiSelectChips } from '@/components/Chip';
import { ScaleSelector } from '@/components/ScaleSelector';
import { CarePlanCard } from '@/components/CarePlanCard';
import { useColors } from '@/hooks/useThemeColor';
import { api } from '../../convex/_generated/api';
import { ImpactFeedbackStyle, NotificationFeedbackType, impact, notification } from '@/lib/haptics';
import {
  CONDITION_CATALOG,
  ADL_CATALOG,
  IADL_CATALOG,
  generateCarePlan,
  type Mobility,
  type FallRisk,
  type CognitiveStatus,
  type HealthInput,
} from '@/lib/carePlan';

const STEP = {
  ROLE: 0,
  PROFILE: 1,
  ACCESS: 2,
  RECIPIENT: 3,
  CONDITIONS: 4,
  ALLERGIES: 5,
  MOBILITY: 6,
  COGNITION: 7,
  INDEPENDENCE: 8,
  QOL: 9,
  PLAN: 10,
  IVY: 11,
  DONE: 12,
} as const;
const TOTAL = 13;

type Role = 'professional' | 'family' | null;
type AgeGroup = 'under_65' | '65_plus' | null;
type TextSize = 'small' | 'medium' | 'large' | 'extra-large';
type CareType = 'senior' | 'disability' | 'childcare' | 'general';

const QOL_QUESTIONS: { key: keyof NonNullable<HealthInput['qualityOfLife']>; label: string; low: string; high: string }[] = [
  { key: 'mood', label: 'Overall mood', low: 'Low', high: 'Great' },
  { key: 'pain', label: 'Pain level', low: 'None', high: 'Severe' },
  { key: 'sleep', label: 'Sleep quality', low: 'Poor', high: 'Excellent' },
  { key: 'social', label: 'Social connection', low: 'Isolated', high: 'Very connected' },
  { key: 'energy', label: 'Energy level', low: 'Exhausted', high: 'Energetic' },
];

export default function OnboardingScreen() {
  const colors = useColors();
  const createProfile = useMutation(api.profiles.create);
  const createRecipient = useMutation(api.careRecipients.create);
  const upsertHealth = useMutation(api.healthProfiles.upsert);
  const completeOnboarding = useMutation(api.profiles.completeOnboarding);
  const { isLoading: authLoading, isAuthenticated: convexAuthenticated } = useConvexAuth();
  const authToken = useAuthToken();
  const hasAuthToken = authToken !== null;

  const [step, setStep] = useState<number>(STEP.ROLE);
  const [loading, setLoading] = useState(false);
  const [skipHealth, setSkipHealth] = useState(false);
  const fade = useRef(new Animated.Value(1)).current;
  const authAlertShown = useRef(false);

  // Caregiver
  const [role, setRole] = useState<Role>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [certifications, setCertifications] = useState('');
  // Accessibility
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null);
  const [textSize, setTextSize] = useState<TextSize>('medium');
  const [highContrast, setHighContrast] = useState(false);
  // Recipient
  const [recipientName, setRecipientName] = useState('');
  const [careType, setCareType] = useState<CareType>('senior');
  const [avatarEmoji, setAvatarEmoji] = useState('person-outline');
  const [dateOfBirth, setDateOfBirth] = useState('');
  // Health
  const [conditions, setConditions] = useState<string[]>([]);
  const [otherConditions, setOtherConditions] = useState('');
  const [allergiesText, setAllergiesText] = useState('');
  const [medsText, setMedsText] = useState('');
  const [mobility, setMobility] = useState<Mobility | null>(null);
  const [fallRisk, setFallRisk] = useState<FallRisk | null>(null);
  const [cognitiveStatus, setCognitiveStatus] = useState<CognitiveStatus | null>(null);
  const [adlLevels, setAdlLevels] = useState<Record<string, number>>({});
  const [iadlLevels, setIadlLevels] = useState<Record<string, number>>({});
  const [qol, setQol] = useState<Record<string, number>>({});
  // Ivy chat
  const [chatMessages, setChatMessages] = useState<string[]>([]);

  const toList = (text: string) =>
    text
      .split(/[,\n]/)
      .map((s) => s.trim())
      .filter(Boolean);

  const buildHealthInput = (): HealthInput => ({
    conditions,
    allergies: toList(allergiesText),
    currentMedications: toList(medsText),
    mobility: mobility ?? undefined,
    fallRisk: fallRisk ?? undefined,
    cognitiveStatus: cognitiveStatus ?? undefined,
    adl: ADL_CATALOG.map((a) => ({ key: a.key, level: adlLevels[a.key] ?? 2 })),
    iadl: IADL_CATALOG.map((a) => ({ key: a.key, level: iadlLevels[a.key] ?? 2 })),
    qualityOfLife:
      Object.keys(qol).length > 0
        ? {
            mood: qol.mood ?? 2,
            pain: qol.pain ?? 0,
            sleep: qol.sleep ?? 2,
            social: qol.social ?? 2,
            energy: qol.energy ?? 2,
          }
        : undefined,
  });

  const animateTo = (next: number) => {
    impact(ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(fade, { toValue: 0, duration: 130, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start();
    setTimeout(() => setStep(next), 130);
  };

  const next = () => {
    // After recipient step, honor skip-health by jumping to Ivy.
    if (step === STEP.RECIPIENT && (!recipientName.trim() || skipHealth)) {
      animateTo(STEP.IVY);
      return;
    }
    animateTo(step + 1);
  };

  const back = () => {
    if (step === STEP.IVY && (!recipientName.trim() || skipHealth)) {
      animateTo(STEP.RECIPIENT);
      return;
    }
    if (step > 0) animateTo(step - 1);
  };

  // Ivy intro animation
  useEffect(() => {
    if (step !== STEP.IVY) return;
    const msgs = [
      "Hi there. I'm Ivy, your Nurtura care assistant.",
      "I'll help you stay on top of medications, appointments, and daily care.",
      recipientName.trim()
        ? `I've tailored a care plan for ${recipientName.trim()} based on what you shared.`
        : 'Add a care recipient anytime and I’ll build a personalized care plan.',
      "Ready when you are. Let's finish setting up.",
    ];
    setChatMessages([]);
    msgs.forEach((msg, i) => {
      setTimeout(() => {
        setChatMessages((prev) => [...prev, msg]);
        impact(ImpactFeedbackStyle.Light);
      }, (i + 1) * 1000);
    });
  }, [step, recipientName]);

  useEffect(() => {
    if (authLoading || hasAuthToken || convexAuthenticated || authAlertShown.current) return;

    authAlertShown.current = true;
    Alert.alert(
      'Sign in required',
      'Please sign in or create an account before finishing onboarding.',
      [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }],
    );
  }, [authLoading, hasAuthToken, convexAuthenticated]);

  const handleComplete = async () => {
    if (!convexAuthenticated) {
      Alert.alert(
        'Still connecting',
        'Nurtura is still connecting your secure session. Please wait a moment and try again.',
      );
      return;
    }

    setLoading(true);
    try {
      await createProfile({
        role: role!,
        firstName,
        lastName,
        phone: phone || undefined,
        relationship: role === 'family' ? relationship || undefined : undefined,
        certifications: role === 'professional' ? certifications || undefined : undefined,
        ageGroup: ageGroup ?? undefined,
        textSize,
        highContrast,
      });

      if (recipientName.trim()) {
        const conditionSummary = [
          ...conditions.map(
            (k) => CONDITION_CATALOG.find((c) => c.key === k)?.label ?? k,
          ),
          otherConditions.trim(),
        ]
          .filter(Boolean)
          .join(', ');

        const recipientId = await createRecipient({
          name: recipientName,
          careType,
          avatarEmoji,
          dateOfBirth: dateOfBirth || undefined,
          conditions: conditionSummary || undefined,
        });

        if (!skipHealth) {
          await upsertHealth({
            careRecipientId: recipientId,
            ...buildHealthInput(),
            otherConditions: otherConditions || undefined,
          });
        }
      }

      await completeOnboarding({});
      notification(NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (arr: string[], key: string) =>
    arr.includes(key) ? arr.filter((k) => k !== key) : [...arr, key];

  // ---- Step renderers ----
  const renderInner = () => {
    switch (step) {
      case STEP.ROLE:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="leaf" title="Welcome to Nurtura"
            subtitle="Let's set up your caregiving hub. First, who are you?"
            onNext={next} nextDisabled={!role}
          >
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
          </StepShell>
        );

      case STEP.PROFILE:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="person-outline" title="Your Profile"
            subtitle="This helps your care team identify you"
            onBack={back} onNext={next}
            nextDisabled={!firstName.trim() || !lastName.trim()}
          >
            <NInput label="FIRST NAME" placeholder="First name" value={firstName} onChangeText={setFirstName} />
            <NInput label="LAST NAME" placeholder="Last name" value={lastName} onChangeText={setLastName} />
            <NInput label="PHONE (OPTIONAL)" placeholder="(555) 123-4567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
            {role === 'family' && (
              <NInput label="RELATIONSHIP (OPTIONAL)" placeholder="e.g. Daughter, Son, Spouse" value={relationship} onChangeText={setRelationship} />
            )}
            {role === 'professional' && (
              <NInput label="CERTIFICATIONS (OPTIONAL)" placeholder="e.g. CNA, HHA" value={certifications} onChangeText={setCertifications} />
            )}
          </StepShell>
        );

      case STEP.ACCESS:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="eye-outline" title="Display & Accessibility"
            subtitle="Let's make Nurtura comfortable to use"
            onBack={back} onNext={next}
          >
            <NText variant="headline" style={{ marginBottom: 12 }}>Age Group</NText>
            <SelectionCard title="Under 65" selected={ageGroup === 'under_65'} onPress={() => setAgeGroup('under_65')} />
            <SelectionCard
              title="65 or Older" badge="Optimized for you"
              selected={ageGroup === '65_plus'}
              onPress={() => { setAgeGroup('65_plus'); setTextSize('large'); setHighContrast(true); }}
            />
            <NText variant="headline" style={{ marginTop: 20, marginBottom: 12 }}>Text Size</NText>
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
            <View style={{ marginTop: 8 }}>
              <SelectionCard
                title="High Contrast" subtitle="Bolder colors and sharper text"
                ionIcon={highContrast ? 'contrast' : 'contrast-outline'}
                selected={highContrast} onPress={() => setHighContrast(!highContrast)}
              />
            </View>
          </StepShell>
        );

      case STEP.RECIPIENT:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="heart-outline" title="Who Are You Caring For?"
            subtitle="We'll use this to personalize their care"
            onBack={back} onNext={next}
            onSkip={() => { setSkipHealth(true); setRecipientName(''); animateTo(STEP.IVY); }}
          >
            <NText variant="headline" style={{ marginBottom: 12 }}>Choose an Avatar</NText>
            <EmojiPicker selected={avatarEmoji} onSelect={setAvatarEmoji} />
            <NInput label="NAME" placeholder="e.g. Mom, Dad, Sarah" value={recipientName} onChangeText={setRecipientName} style={{ marginTop: 16 }} />
            <NInput label="DATE OF BIRTH (OPTIONAL)" placeholder="MM/DD/YYYY" value={dateOfBirth} onChangeText={setDateOfBirth} />
            <NText variant="headline" style={{ marginTop: 8, marginBottom: 12 }}>Care Type</NText>
            {(['senior', 'disability', 'childcare', 'general'] as CareType[]).map((t) => {
              const icons: Record<CareType, string> = { senior: 'person-outline', disability: 'accessibility-outline', childcare: 'happy-outline', general: 'heart-outline' };
              return (
                <SelectionCard key={t} title={t.charAt(0).toUpperCase() + t.slice(1)} icon={icons[t]} selected={careType === t} onPress={() => setCareType(t)} />
              );
            })}
          </StepShell>
        );

      case STEP.CONDITIONS:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="medical-outline" title="Health Conditions"
            subtitle={`Select any that apply to ${recipientName.trim() || 'them'} — this tailors the care plan`}
            onBack={back} onNext={next}
          >
            <MultiSelectChips
              options={CONDITION_CATALOG}
              selected={conditions}
              onToggle={(k) => setConditions((c) => toggle(c, k))}
            />
            <NInput
              label="ANYTHING ELSE? (OPTIONAL)"
              placeholder="Other conditions or notes"
              value={otherConditions} onChangeText={setOtherConditions} multiline
              style={{ marginTop: 16 }}
            />
          </StepShell>
        );

      case STEP.ALLERGIES:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="warning-outline" title="Allergies & Medications"
            subtitle="Separate each item with a comma or new line"
            onBack={back} onNext={next}
          >
            <NInput label="ALLERGIES (OPTIONAL)" placeholder="e.g. Penicillin, Peanuts" value={allergiesText} onChangeText={setAllergiesText} multiline />
            <NInput label="CURRENT MEDICATIONS (OPTIONAL)" placeholder="e.g. Metformin, Lisinopril, Aspirin" value={medsText} onChangeText={setMedsText} multiline />
            {toList(medsText).length >= 5 && (
              <View className="rounded-xl p-3 mt-1" style={{ backgroundColor: colors.warningBg }}>
                <NText variant="caption1" color={colors.warning}>
                  Managing 5+ medications — we'll add medication management to the care plan.
                </NText>
              </View>
            )}
          </StepShell>
        );

      case STEP.MOBILITY:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="walk-outline" title="Mobility & Fall Risk"
            subtitle="How do they get around?"
            onBack={back} onNext={next}
          >
            <NText variant="headline" style={{ marginBottom: 12 }}>Mobility</NText>
            {([
              ['independent', 'Independent', 'Walks without help'],
              ['cane', 'Uses a Cane', 'Some support needed'],
              ['walker', 'Uses a Walker', 'Moderate support'],
              ['wheelchair', 'Wheelchair', 'Limited mobility'],
              ['bedbound', 'Bedbound', 'Full assistance'],
            ] as [Mobility, string, string][]).map(([k, t, s]) => (
              <SelectionCard key={k} title={t} subtitle={s} selected={mobility === k} onPress={() => setMobility(k)} />
            ))}
            <NText variant="headline" style={{ marginTop: 20, marginBottom: 12 }}>Fall Risk</NText>
            {([
              ['low', 'Low', 'No recent falls'],
              ['medium', 'Medium', 'Occasional unsteadiness'],
              ['high', 'High', 'History of falls'],
            ] as [FallRisk, string, string][]).map(([k, t, s]) => (
              <SelectionCard key={k} title={t} subtitle={s} selected={fallRisk === k} onPress={() => setFallRisk(k)} />
            ))}
          </StepShell>
        );

      case STEP.COGNITION:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="bulb-outline" title="Memory & Cognition"
            subtitle="How is their memory and thinking?"
            onBack={back} onNext={next}
          >
            {([
              ['alert', 'Alert & Oriented', 'No memory concerns'],
              ['mild', 'Mild Forgetfulness', 'Occasional reminders help'],
              ['moderate', 'Moderate Impairment', 'Needs regular cues'],
              ['severe', 'Significant Impairment', 'Needs constant support'],
            ] as [CognitiveStatus, string, string][]).map(([k, t, s]) => (
              <SelectionCard key={k} title={t} subtitle={s} selected={cognitiveStatus === k} onPress={() => setCognitiveStatus(k)} />
            ))}
          </StepShell>
        );

      case STEP.INDEPENDENCE:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="hand-left-outline" title="Daily Independence"
            subtitle="0 = needs full help · 1 = needs some help · 2 = fully independent"
            onBack={back} onNext={next}
          >
            <NText variant="headline" style={{ marginBottom: 14 }}>Daily Activities</NText>
            {ADL_CATALOG.map((a) => (
              <View key={a.key} style={{ marginBottom: 18 }}>
                <NText variant="subheadline" style={{ marginBottom: 8 }}>{a.label}</NText>
                <ScaleSelector
                  steps={3}
                  value={adlLevels[a.key] ?? null}
                  onChange={(v) => setAdlLevels((m) => ({ ...m, [a.key]: v }))}
                  labels={['Full help', 'Some help', 'Independent']}
                />
              </View>
            ))}
            <NText variant="headline" style={{ marginTop: 8, marginBottom: 14 }}>Household & Errands</NText>
            {IADL_CATALOG.map((a) => (
              <View key={a.key} style={{ marginBottom: 18 }}>
                <NText variant="subheadline" style={{ marginBottom: 8 }}>{a.label}</NText>
                <ScaleSelector
                  steps={3}
                  value={iadlLevels[a.key] ?? null}
                  onChange={(v) => setIadlLevels((m) => ({ ...m, [a.key]: v }))}
                  labels={['Full help', 'Some help', 'Independent']}
                />
              </View>
            ))}
          </StepShell>
        );

      case STEP.QOL:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="happy-outline" title="Quality of Life"
            subtitle="A quick snapshot of how they're doing lately"
            onBack={back} onNext={next}
          >
            {QOL_QUESTIONS.map((q) => (
              <View key={q.key} style={{ marginBottom: 22 }}>
                <NText variant="subheadline" style={{ marginBottom: 8 }}>{q.label}</NText>
                <ScaleSelector
                  steps={5}
                  value={qol[q.key] ?? null}
                  onChange={(v) => setQol((m) => ({ ...m, [q.key]: v }))}
                  lowLabel={q.low}
                  highLabel={q.high}
                />
              </View>
            ))}
          </StepShell>
        );

      case STEP.PLAN: {
        const plan = generateCarePlan(buildHealthInput());
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="sparkles" title="Personalized Care Plan"
            subtitle={`Built from what you shared about ${recipientName.trim() || 'your recipient'}`}
            onBack={back} onNext={next} nextLabel="Looks good →"
          >
            <CarePlanCard plan={plan} />
            <NText variant="caption1" muted center style={{ marginTop: 16 }}>
              You can refine this anytime from the care recipient's profile.
            </NText>
          </StepShell>
        );
      }

      case STEP.IVY:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="chatbubble-ellipses-outline" title="Meet Ivy"
            subtitle="Your AI care assistant"
            onBack={back} onNext={next}
          >
            <View style={{ gap: 12 }}>
              {chatMessages.map((msg, i) => (
                <View key={i} className="rounded-2xl p-4" style={{ backgroundColor: colors.primaryLight, maxWidth: '88%' }}>
                  <View className="flex-row items-center mb-1" style={{ gap: 4 }}>
                    <View className="w-5 h-5 rounded-full items-center justify-center" style={{ backgroundColor: colors.primary }}>
                      <Ionicons name="leaf" size={11} color="#FFF" />
                    </View>
                    <NText variant="caption2" bold color={colors.primary}>Ivy</NText>
                  </View>
                  <NText variant="subheadline">{msg}</NText>
                </View>
              ))}
              {chatMessages.length < 4 && (
                <View className="flex-row rounded-2xl px-4 py-3 self-start" style={{ backgroundColor: colors.surfaceMuted, gap: 4 }}>
                  {[1, 0.6, 0.3].map((o, i) => (
                    <View key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.textTertiary, opacity: o }} />
                  ))}
                </View>
              )}
            </View>
          </StepShell>
        );

      case STEP.DONE:
        return (
          <StepShell
            stepIndex={step} totalSteps={TOTAL} fade={fade}
            icon="checkmark-circle" title="You're All Set!"
            subtitle="Your Nurtura hub is ready to go"
            onBack={back} onNext={handleComplete} nextLabel="Go to Dashboard →" loading={loading}
          >
            <View style={{ gap: 16 }}>
              {[
                { icon: 'clipboard-outline', label: 'Log daily care activities' },
                { icon: 'medkit-outline', label: 'Track medications & vitals' },
                { icon: 'calendar-outline', label: 'Manage schedules & appointments' },
                { icon: 'people-outline', label: 'Coordinate with your care team' },
                { icon: 'sparkles-outline', label: 'Follow a personalized care plan' },
                { icon: 'chatbubble-outline', label: 'Ask Ivy anything' },
              ].map((item) => (
                <View key={item.label} className="flex-row items-center">
                  <Ionicons name={item.icon as any} size={20} color={colors.primary} />
                  <NText variant="subheadline" style={{ marginLeft: 12, flex: 1 }}>{item.label}</NText>
                </View>
              ))}
            </View>
          </StepShell>
        );

      default:
        return null;
    }
  };

  if (authLoading || !hasAuthToken || !convexAuthenticated) {
    return (
      <View className="flex-1 items-center justify-center px-6" style={{ backgroundColor: colors.background }}>
        <View className="h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: colors.primary }}>
          <Ionicons name="leaf" size={28} color="#FFF" />
        </View>
        <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
        <NText variant="subheadline" muted center style={{ marginTop: 12 }}>
          Preparing your secure setup...
        </NText>
      </View>
    );
  }

  return <View style={{ flex: 1, backgroundColor: colors.background }}>{renderInner()}</View>;
}
