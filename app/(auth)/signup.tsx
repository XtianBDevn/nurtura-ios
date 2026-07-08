import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthActions } from '@convex-dev/auth/react';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NInput } from '@/components/NInput';
import { useColors } from '@/hooks/useThemeColor';
import { Spacing, Radius } from '@/lib/theme';

export default function SignUpScreen() {
  const colors = useColors();
  const { signIn } = useAuthActions();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Invalid email';
    if (password.length < 8) e.password = 'Minimum 8 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await signIn('password', {
        email,
        password,
        name,
        flow: 'signUp',
      });
      // New account → straight into onboarding to build their profile.
      router.replace('/onboarding');
    } catch (err: any) {
      Alert.alert('Sign Up Failed', err.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Back button */}
        <NButton
          title="← Back"
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          style={styles.back}
        />

        {/* Logo */}
        <View style={styles.logoSection}>
          <View style={[styles.logoBadge, { backgroundColor: colors.primary }]}>
            <Ionicons name="leaf" size={28} color="#FFF" />
          </View>
          <NText variant="title2" bold style={styles.logoText}>Nurtura</NText>
        </View>

        <NText variant="title2" bold>Create your account</NText>
        <NText variant="subheadline" muted style={styles.subtitle}>
          Start your caregiving journey
        </NText>

        <View style={styles.form}>
          <NInput
            label="NAME"
            placeholder="Your full name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            icon="person-outline"
            autoCapitalize="words"
          />
          <NInput
            label="EMAIL"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <NInput
            label="PASSWORD"
                placeholder="Min. 8 characters"
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            icon="lock-closed-outline"
            secureTextEntry
          />
          <NButton
            title="Create Account"
            onPress={handleSignUp}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        <View style={styles.switchRow}>
          <NText variant="subheadline" muted>
            Already have an account?{' '}
          </NText>
          <NButton
            title="Sign in"
            variant="ghost"
            size="sm"
            onPress={() => router.replace('/(auth)/login')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: { alignSelf: 'flex-start', marginBottom: Spacing.xl },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing['3xl'],
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: { marginLeft: Spacing.xs },
  subtitle: { marginTop: Spacing.xs, marginBottom: Spacing['2xl'] },
  form: { gap: Spacing.xs },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing['3xl'],
  },
});
