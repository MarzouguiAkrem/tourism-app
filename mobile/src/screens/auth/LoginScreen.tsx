import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthScreenProps } from '../../types/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { login, clearError } from '../../store/slices/authSlice';
import { palette } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';
import AppLogo from '../../components/common/AppLogo';

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) return;
    dispatch(login({ email: email.trim().toLowerCase(), password }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Logo / Header */}
          <View style={styles.header}>
            <AppLogo size={120} style={{ marginBottom: spacing.base }} />
            <Text style={styles.title}>Tunisia Travel</Text>
            <Text style={styles.subtitle}>{t('welcome')}</Text>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={palette.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={palette.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor={palette.gray400}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (error) dispatch(clearError());
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={palette.gray400} style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder={t('password')}
              placeholderTextColor={palette.gray400}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) dispatch(clearError());
              }}
              secureTextEntry={!showPassword}
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={palette.gray400}
              />
            </TouchableOpacity>
          </View>

          {/* Forgot Password */}
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}
          >
            <Text style={styles.forgotText}>{t('forgotPassword')}</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.buttonText}>{t('login')}</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('noAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerLink}>{t('register')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing['2xl'],
    paddingBottom: spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: palette.mediterraneanBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.mediterraneanBlue,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: palette.gray500,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.errorLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.base,
    gap: spacing.sm,
  },
  errorText: {
    color: palette.error,
    fontSize: 14,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.gray300,
    borderRadius: borderRadius.lg,
    backgroundColor: palette.gray50,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: spacing.base,
    fontSize: 16,
    color: palette.gray900,
  },
  eyeButton: {
    padding: spacing.sm,
  },
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
  },
  forgotText: {
    color: palette.mediterraneanBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: palette.mediterraneanBlue,
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: palette.mediterraneanBlue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    color: palette.gray500,
    fontSize: 14,
  },
  footerLink: {
    color: palette.mediterraneanBlue,
    fontSize: 14,
    fontWeight: '600',
  },
});
