import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Switch,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { adminUserService } from '../../services/user.service';
import { User } from '../../types/user';

type ParamList = {
  AdminUserForm: { userId?: string };
};

export default function AdminUserFormScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<ParamList, 'AdminUserForm'>>();
  const userId = route.params?.userId;
  const isEdit = !!userId;

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [nationality, setNationality] = useState('');
  const [role, setRole] = useState<'tourist' | 'admin'>('tourist');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    adminUserService
      .getOne(userId)
      .then((u: User) => {
        if (cancelled) return;
        setFirstName(u.firstName || '');
        setLastName(u.lastName || '');
        setEmail(u.email || '');
        setPhone(u.phone || '');
        setNationality(u.nationality || '');
        setRole(u.role);
        setIsActive(u.isActive);
      })
      .catch((err: any) => {
        if (cancelled) return;
        Alert.alert(t('error'), err?.response?.data?.message || t('error'));
        navigation.goBack();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Only re-run when userId changes — `t` and `navigation` are intentionally
    // omitted because they are referentially unstable and would cause an
    // infinite re-fetch loop (the bug that triggered the 429 rate-limit).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const validate = (): string | null => {
    if (firstName.trim().length < 2) return t('firstNameTooShort');
    if (lastName.trim().length < 2) return t('lastNameTooShort');
    if (!/^\S+@\S+\.\S+$/.test(email)) return t('invalidEmail');
    if (!isEdit && password.length < 8) return t('passwordTooShort');
    return null;
  };

  const submit = async () => {
    const err = validate();
    if (err) {
      Alert.alert(t('error'), err);
      return;
    }
    try {
      setSubmitting(true);
      if (isEdit) {
        await adminUserService.update(userId!, {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          nationality: nationality.trim() || null,
          role,
          isActive,
        });
        Alert.alert(t('saved'), t('userUpdated'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await adminUserService.create({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || null,
          nationality: nationality.trim() || null,
          role,
          isActive,
        });
        Alert.alert(t('saved'), t('userCreated'), [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (e: any) {
      Alert.alert(t('error'), e?.response?.data?.message || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={palette.mediterraneanBlue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? t('editUser') : t('createUser')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Field label={t('firstName')} value={firstName} onChange={setFirstName} />
        <Field label={t('lastName')} value={lastName} onChange={setLastName} />
        <Field
          label={t('email')}
          value={email}
          onChange={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {!isEdit && (
          <Field
            label={t('password')}
            value={password}
            onChange={setPassword}
            secure
            autoCapitalize="none"
          />
        )}
        <Field
          label={t('phone')}
          value={phone}
          onChange={setPhone}
          keyboardType="phone-pad"
        />
        <Field
          label={t('nationality')}
          value={nationality}
          onChange={setNationality}
          placeholder="FR, US, GB..."
          autoCapitalize="characters"
        />

        <Text style={styles.subLabel}>{t('role')}</Text>
        <View style={styles.row}>
          {(['tourist', 'admin'] as const).map((r) => {
            const active = role === r;
            return (
              <TouchableOpacity
                key={r}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setRole(r)}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t(r === 'admin' ? 'roleAdminSingular' : 'roleTouristSingular')}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleLabel}>{t('userActive')}</Text>
            <Text style={styles.toggleHelp}>{t('userActiveHelp')}</Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: palette.gray200, true: palette.skyBlue }}
            thumbColor={isActive ? palette.mediterraneanBlue : palette.gray400}
          />
        </View>

        <TouchableOpacity
          style={[styles.submit, submitting && styles.submitDisabled]}
          onPress={submit}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={palette.white} />
          ) : (
            <>
              <Ionicons name="checkmark" size={18} color={palette.white} />
              <Text style={styles.submitText}>{t('save')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const Field = ({ label, value, onChange, placeholder, secure, keyboardType, autoCapitalize }: any) => (
  <View style={styles.fieldRow}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={styles.fieldInput}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={palette.gray400}
      secureTextEntry={secure}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize || 'sentences'}
      autoCorrect={false}
    />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.h3, color: palette.gray900 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  fieldRow: { marginBottom: spacing.sm },
  fieldLabel: { color: palette.gray600, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  fieldInput: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: palette.gray900,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  subLabel: {
    color: palette.gray600,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipActive: {
    backgroundColor: palette.mediterraneanBlue,
    borderColor: palette.mediterraneanBlue,
  },
  chipText: { color: palette.gray700, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: palette.white },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.gray200,
    marginBottom: spacing.lg,
  },
  toggleLabel: { color: palette.gray900, fontWeight: '600', fontSize: 14 },
  toggleHelp: { color: palette.gray500, fontSize: 12, marginTop: 2 },
  submit: {
    backgroundColor: palette.mediterraneanBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.md,
  },
  submitDisabled: { opacity: 0.5 },
  submitText: { color: palette.white, fontWeight: '700', fontSize: 16 },
});
