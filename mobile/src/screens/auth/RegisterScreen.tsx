import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthScreenProps } from '../../types/navigation';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { register, clearError } from '../../store/slices/authSlice';
import { palette } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';

export default function RegisterScreen({ navigation }: AuthScreenProps<'Register'>) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  const lastNameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmRef = useRef<TextInput>(null);

  const handleRegister = () => {
    setLocalError('');
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
      setLocalError('Tous les champs sont obligatoires');
      return;
    }
    if (password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }
    dispatch(
      register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
    );
  };

  const displayError = localError || error;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={palette.gray700} />
          </TouchableOpacity>

          {/* Header */}
          <Text style={styles.title}>{t('register')}</Text>
          <Text style={styles.subtitle}>Créez votre compte pour explorer la Tunisie</Text>

          {/* Error */}
          {displayError && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={palette.error} />
              <Text style={styles.errorText}>{displayError}</Text>
            </View>
          )}

          {/* Name Row */}
          <View style={styles.row}>
            <View style={[styles.inputContainer, styles.halfInput]}>
              <Ionicons name="person-outline" size={20} color={palette.gray400} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={t('firstName')}
                placeholderTextColor={palette.gray400}
                value={firstName}
                onChangeText={(text) => { setFirstName(text); setLocalError(''); if (error) dispatch(clearError()); }}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => lastNameRef.current?.focus()}
              />
            </View>

            <View style={[styles.inputContainer, styles.halfInput]}>
              <TextInput
                ref={lastNameRef}
                style={styles.input}
                placeholder={t('lastName')}
                placeholderTextColor={palette.gray400}
                value={lastName}
                onChangeText={(text) => { setLastName(text); setLocalError(''); }}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => emailRef.current?.focus()}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={palette.gray400} style={styles.inputIcon} />
            <TextInput
              ref={emailRef}
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor={palette.gray400}
              value={email}
              onChangeText={(text) => { setEmail(text); setLocalError(''); if (error) dispatch(clearError()); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color={palette.gray400} style={styles.inputIcon} />
            <TextInput
              ref={passwordRef}
              style={styles.input}
              placeholder={t('password')}
              placeholderTextColor={palette.gray400}
              value={password}
              onChangeText={(text) => { setPassword(text); setLocalError(''); }}
              secureTextEntry={!showPassword}
              returnKeyType="next"
              onSubmitEditing={() => confirmRef.current?.focus()}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={palette.gray400} />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={20} color={palette.gray400} style={styles.inputIcon} />
            <TextInput
              ref={confirmRef}
              style={styles.input}
              placeholder={t('confirmPassword')}
              placeholderTextColor={palette.gray400}
              value={confirmPassword}
              onChangeText={(text) => { setConfirmPassword(text); setLocalError(''); }}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
            />
          </View>

          {/* Password hint */}
          <Text style={styles.hint}>Minimum 8 caractères</Text>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.buttonText}>{t('register')}</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('hasAccount')} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>{t('login')}</Text>
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
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.base,
    paddingBottom: spacing['3xl'],
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: palette.mediterraneanBlue,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: palette.gray500,
    marginBottom: spacing['2xl'],
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
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
    paddingVertical: 14,
    fontSize: 16,
    color: palette.gray900,
  },
  eyeButton: {
    padding: spacing.sm,
  },
  hint: {
    fontSize: 12,
    color: palette.gray400,
    marginBottom: spacing.lg,
    marginTop: -spacing.sm,
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
