import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { AuthScreenProps } from '../../types/navigation';
import api from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { palette } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';

export default function ForgotPasswordScreen({ navigation }: AuthScreenProps<'ForgotPassword'>) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!email.trim()) return;
    setIsLoading(true);
    setError('');
    try {
      await api.post(ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: email.trim().toLowerCase() });
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message || t('error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.successIcon}>
            <Ionicons name="checkmark-circle" size={64} color={palette.success} />
          </View>
          <Text style={styles.successTitle}>Email envoy\u00e9 !</Text>
          <Text style={styles.successText}>
            Si un compte existe avec l'adresse {email}, vous recevrez un lien de r\u00e9initialisation.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Retour \u00e0 la connexion</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Back Button */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={palette.gray700} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Ionicons name="key-outline" size={40} color={palette.mediterraneanBlue} />
          </View>

          <Text style={styles.title}>{t('forgotPassword')}</Text>
          <Text style={styles.subtitle}>
            Entrez votre adresse email. Nous vous enverrons un lien pour r\u00e9initialiser votre mot de passe.
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={palette.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color={palette.gray400} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder={t('email')}
              placeholderTextColor={palette.gray400}
              value={email}
              onChangeText={(text) => { setEmail(text); setError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.buttonText}>Envoyer le lien</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            style={styles.backLink}
          >
            <Ionicons name="arrow-back" size={16} color={palette.mediterraneanBlue} />
            <Text style={styles.backLinkText}>Retour \u00e0 la connexion</Text>
          </TouchableOpacity>
        </View>
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
    flex: 1,
    paddingHorizontal: spacing['2xl'],
    paddingTop: spacing.base,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: spacing.base,
    left: spacing['2xl'],
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: palette.lightBlue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    color: palette.gray500,
    textAlign: 'center',
    lineHeight: 20,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: palette.gray300,
    borderRadius: borderRadius.lg,
    backgroundColor: palette.gray50,
    marginBottom: spacing.lg,
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  backLinkText: {
    color: palette.mediterraneanBlue,
    fontSize: 14,
    fontWeight: '500',
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.gray900,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: 14,
    color: palette.gray500,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: spacing['2xl'],
  },
});
