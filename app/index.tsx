/**
 * Landing / Welcome Screen
 * First screen users see — routes to sign up or login
 */
import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Redirect } from 'expo-router';
import { useConvexAuth, useQuery } from 'convex/react';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NCard } from '@/components/NCard';
import { useColors } from '@/hooks/useThemeColor';
import { Spacing, Radius } from '@/lib/theme';
import { api } from '../convex/_generated/api';

const { width } = Dimensions.get('window');

const FEATURES = [
  { icon: 'clipboard-outline' as const, title: 'Care Logging', desc: 'Track daily care activities with ease' },
  { icon: 'medkit-outline' as const, title: 'Medications', desc: 'Keep doses, instructions, and routines organized' },
  { icon: 'calendar-outline' as const, title: 'Scheduling', desc: 'Coordinate shifts and appointments' },
  { icon: 'people-outline' as const, title: 'Team Coordination', desc: 'Keep your care team in sync' },
  { icon: 'time-outline' as const, title: 'Time Tracking', desc: 'Log hours for professional caregivers' },
  { icon: 'chatbubbles-outline' as const, title: 'Messaging', desc: 'Real-time care team communication' },
];

/**
 * Root gate. Decides where an opening user lands:
 *  - auth state still resolving → splash
 *  - signed in + onboarding done → main app
 *  - signed in + onboarding incomplete (or no profile) → onboarding
 *  - signed out → marketing landing below
 */
export default function LandingScreen() {
  const colors = useColors();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const profile = useQuery(api.profiles.get, isAuthenticated ? {} : 'skip');

  if (isLoading || (isAuthenticated && profile === undefined)) {
    return (
      <View style={[styles.splash, { backgroundColor: colors.background }]}>
        <View style={[styles.splashBadge, { backgroundColor: colors.primary }]}>
          <Ionicons name="leaf" size={28} color="#FFF" />
        </View>
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.xl }} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href={profile?.onboardingComplete ? '/(tabs)' : '/onboarding'} />;
  }

  return <Marketing colors={colors} />;
}

function Marketing({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero Section */}
      <LinearGradient
        colors={[colors.primaryLight, colors.background]}
        style={styles.hero}
      >
        <View style={styles.logoRow}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="leaf" size={24} color="#FFF" />
          </View>
          <NText variant="title3" bold>Nurtura</NText>
        </View>

        <NText variant="caption1" color={colors.primary} style={styles.eyebrow}>
          Care, naturally
        </NText>
        <NText variant="largeTitle" bold center style={styles.heroTitle}>
          The caregiving{'\n'}hub your family{'\n'}deserves
        </NText>
        <NText variant="body" muted center style={styles.heroSub}>
          Organize care, track medications, coordinate with your team — all in one place.
        </NText>

        <View style={styles.heroCTAs}>
          <NButton
            title="Start Free →"
            onPress={() => router.push('/(auth)/signup')}
            size="lg"
            fullWidth
          />
          <NButton
            title="Log In"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            size="lg"
            fullWidth
            style={{ marginTop: Spacing.sm }}
          />
        </View>

        {/* Trust badges */}
        <View style={styles.badges}>
          {['iPhone & iPad', 'Secure sign-in', 'Care-team ready'].map((badge) => (
            <View key={badge} style={[styles.badge, { backgroundColor: colors.surfaceMuted }]}>
              <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
              <NText variant="caption2" style={{ marginLeft: 4 }}>{badge}</NText>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Features Grid */}
      <View style={styles.section}>
        <NText variant="caption1" color={colors.primary} center bold>
          FEATURES
        </NText>
        <NText variant="title2" center bold style={styles.sectionTitle}>
          Everything you need
        </NText>

        <View style={styles.featuresGrid}>
          {FEATURES.map((f) => (
            <NCard key={f.title} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
                <Ionicons name={f.icon} size={24} color={colors.primary} />
              </View>
              <NText variant="headline" style={styles.featureTitle}>{f.title}</NText>
              <NText variant="footnote" muted>{f.desc}</NText>
            </NCard>
          ))}
        </View>
      </View>

      {/* Pricing */}
      <View style={styles.section}>
        <NText variant="caption1" color={colors.primary} center bold>
          PRICING
        </NText>
        <NText variant="title2" center bold style={styles.sectionTitle}>
          Plans for every caregiver
        </NText>

        {[
          { name: 'Free', price: '$0', features: ['1 care recipient', 'Basic logging', '7-day history'] },
          { name: 'Plus', price: '$9.99', features: ['3 recipients', 'Ivy AI chatbot', 'Calendar sync', 'No ads'], popular: true },
          { name: 'Professional', price: '$24.99', features: ['Unlimited recipients', '24/7 Ivy', 'FHIR/MyChart', 'Priority support'] },
        ].map((plan) => (
          <NCard
            key={plan.name}
            style={[
              styles.pricingCard,
              plan.popular && { borderColor: colors.primary, borderWidth: 2 },
            ]}
          >
            {plan.popular && (
              <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                <NText variant="caption2" color="#FFF" bold>MOST POPULAR</NText>
              </View>
            )}
            <NText variant="title3" bold>{plan.name}</NText>
            <View style={styles.priceRow}>
              <NText variant="largeTitle" bold>{plan.price}</NText>
              {plan.price !== '$0' && <NText variant="footnote" muted>/month</NText>}
            </View>
            {plan.features.map((f) => (
              <View key={f} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                <NText variant="subheadline" style={{ marginLeft: Spacing.sm }}>{f}</NText>
              </View>
            ))}
            <NButton
              title={plan.popular ? 'Start Free Trial' : 'Get Started'}
              variant={plan.popular ? 'primary' : 'outline'}
              onPress={() => router.push('/(auth)/signup')}
              fullWidth
              style={{ marginTop: Spacing.lg }}
            />
          </NCard>
        ))}
      </View>

      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { backgroundColor: colors.primaryLight }]}>
        <Ionicons name="leaf" size={32} color={colors.primary} />
        <NText variant="title3" bold center style={{ marginTop: Spacing.md }}>
          Ready to simplify caregiving?
        </NText>
        <NButton
          title="Create Free Account"
          onPress={() => router.push('/(auth)/signup')}
          size="lg"
          fullWidth
          style={{ marginTop: Spacing.xl }}
        />
      </View>

      <View style={styles.footer}>
        <NText variant="caption1" muted center>
          © 2026 Bon Air Media. All rights reserved.
        </NText>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: 40 },
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  splashBadge: {
    width: 56,
    height: 56,
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    paddingTop: 80,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing['3xl'],
    alignItems: 'center',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  heroTitle: {
    marginBottom: Spacing.lg,
  },
  heroSub: {
    marginBottom: Spacing['3xl'],
    maxWidth: 300,
  },
  heroCTAs: {
    width: '100%',
    maxWidth: 340,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing['2xl'],
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing['4xl'],
  },
  sectionTitle: {
    marginTop: Spacing.sm,
    marginBottom: Spacing['2xl'],
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  featureCard: {
    width: (width - Spacing.xl * 2 - Spacing.md) / 2,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  featureTitle: {
    marginBottom: Spacing.xs,
  },
  pricingCard: {
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  popularBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.xs,
    marginVertical: Spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  bottomCTA: {
    margin: Spacing.xl,
    padding: Spacing['3xl'],
    borderRadius: Radius.xl,
    alignItems: 'center',
  },
  footer: {
    paddingVertical: Spacing['2xl'],
  },
});
