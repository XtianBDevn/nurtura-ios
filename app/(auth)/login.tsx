import React, { useEffect, useRef, useState } from 'react';
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
import { useAuthActions, useAuthToken } from '@convex-dev/auth/react';
import { NText } from '@/components/NText';
import { NButton } from '@/components/NButton';
import { NInput } from '@/components/NInput';
import { useColors } from '@/hooks/useThemeColor';
import { Spacing, Radius } from '@/lib/theme';

export default function LoginScreen() {
  const colors = useColors();
  const { signIn } = useAuthActions();
  const authToken = useAuthToken();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [awaitingToken, setAwaitingToken] = useState(false);
  const tokenTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!awaitingToken || authToken === null) return;

    if (tokenTimeout.current) {
      clearTimeout(tokenTimeout.current);
      tokenTimeout.current = null;
    }
    setAwaitingToken(false);
    setLoading(false);
    router.replace('/');
  }, [awaitingToken, authToken]);

  useEffect(() => () => {
    if (tokenTimeout.current) clearTimeout(tokenTimeout.current);
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Missing Fields', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await signIn('password', { email, password, flow: 'signIn' });
      if (!result.signingIn) {
        throw new Error('Sign in did not complete. Please try again.');
      }
      if (tokenTimeout.current) clearTimeout(tokenTimeout.current);
      tokenTimeout.current = setTimeout(() => {
        setAwaitingToken(false);
        setLoading(false);
        Alert.alert(
          'Still signing in',
          'Nurtura did not receive a secure session token yet. Please try again.',
        );
      }, 10000);
      setAwaitingToken(true);
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password.');
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
        {/* Back */}
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

        <NText variant="title2" bold>Welcome back</NText>
        <NText variant="subheadline" muted style={styles.subtitle}>
          Sign in to your caregiving hub
        </NText>

        <View style={styles.form}>
          <NInput
            label="EMAIL"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            icon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <NInput
            label="PASSWORD"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            icon="lock-closed-outline"
            secureTextEntry
          />

          <NButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            size="lg"
          />
        </View>

        <View style={styles.switchRow}>
          <NText variant="subheadline" muted>
            Don't have an account?{' '}
          </NText>
          <NButton
            title="Sign up"
            variant="ghost"
            size="sm"
            onPress={() => router.replace('/(auth)/signup')}
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
