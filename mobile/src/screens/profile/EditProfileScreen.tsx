import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updateUser, logout } from '../../store/slices/authSlice';
import { userService } from '../../services/user.service';
import { resolveImageUrl } from '../../utils/imageUrl';

const INTERESTS = [
  'history',
  'beach',
  'desert',
  'culture',
  'food',
  'adventure',
  'nature',
  'shopping',
  'nightlife',
  'architecture',
  'religious',
  'wellness',
] as const;

const LANGUAGES = ['fr', 'en', 'ar'] as const;
const BUDGETS = ['budget', 'moderate', 'luxury'] as const;

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  // Profile fields
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [nationality, setNationality] = useState(user?.nationality || '');

  // Preferences
  const [languages, setLanguages] = useState<string[]>(user?.preferences?.languages || ['fr']);
  const [interests, setInterests] = useState<string[]>(user?.preferences?.interests || []);
  const [budgetLevel, setBudgetLevel] = useState<string>(
    user?.preferences?.budgetLevel || 'moderate'
  );

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState('');

  const toggle = (list: string[], setList: (l: string[]) => void, key: string) => {
    setList(list.includes(key) ? list.filter((k) => k !== key) : [...list, key]);
  };

  const pickAvatar = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('error'), t('mediaPermissionDenied'));
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (res.canceled || !res.assets?.[0]) return;
      setAvatarLoading(true);
      const updated = await userService.uploadAvatar(res.assets[0].uri);
      dispatch(updateUser({ avatar: updated.avatar }));
      Alert.alert(t('saved'), t('avatarUpdated'));
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || err?.message || t('error'));
    } finally {
      setAvatarLoading(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSavingProfile(true);
      const updated = await userService.updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
        nationality: nationality.trim() || null,
      });
      dispatch(
        updateUser({
          firstName: updated.firstName,
          lastName: updated.lastName,
          fullName: updated.fullName,
          phone: updated.phone,
          nationality: updated.nationality,
        })
      );
      Alert.alert(t('saved'), t('profileUpdated'));
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePreferences = async () => {
    try {
      setSavingPrefs(true);
      const updated = await userService.updatePreferences({
        languages,
        interests,
        budgetLevel: budgetLevel as any,
      });
      dispatch(updateUser({ preferences: updated.preferences }));
      Alert.alert(t('saved'), t('preferencesUpdated'));
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      Alert.alert(t('error'), t('passwordRequired'));
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert(t('error'), t('passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('error'), t('passwordsDontMatch'));
      return;
    }
    try {
      setSavingPwd(true);
      await userService.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      // The backend invalidates the refresh token → force a re-login to get
      // a fresh session instead of relying on a now-stale token pair.
      Alert.alert(
        t('passwordChangedReloginTitle'),
        t('passwordChangedReloginMessage'),
        [{ text: 'OK', onPress: () => dispatch(logout()) }]
      );
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setSavingPwd(false);
    }
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      t('deleteAccountConfirmTitle'),
      t('deleteAccountConfirmMessage'),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteAccount'),
          style: 'destructive',
          onPress: deleteAccount,
        },
      ]
    );
  };

  const deleteAccount = async () => {
    try {
      setDeletingAccount(true);
      await userService.deleteAccount(deleteConfirmPassword || undefined);
      Alert.alert(t('deleteAccountSuccess'), '', [
        { text: 'OK', onPress: () => dispatch(logout()) },
      ]);
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('editProfile')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickAvatar} activeOpacity={0.85}>
            <View style={styles.avatarWrap}>
              {user?.avatar ? (
                <Image source={{ uri: resolveImageUrl(user.avatar) }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder]}>
                  <Text style={styles.avatarInitials}>
                    {(user?.firstName?.[0] || '').toUpperCase()}
                    {(user?.lastName?.[0] || '').toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.avatarBadge}>
                {avatarLoading ? (
                  <ActivityIndicator color={palette.white} size="small" />
                ) : (
                  <Ionicons name="camera" size={14} color={palette.white} />
                )}
              </View>
            </View>
          </TouchableOpacity>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Personal info */}
        <Section title={t('personalInfo')}>
          <Field label={t('firstName')} value={firstName} onChange={setFirstName} />
          <Field label={t('lastName')} value={lastName} onChange={setLastName} />
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
          <SaveBtn loading={savingProfile} onPress={saveProfile} />
        </Section>

        {/* Travel preferences */}
        <Section title={t('travelPreferences')}>
          <Text style={styles.subLabel}>{t('languages')}</Text>
          <View style={styles.chipsRow}>
            {LANGUAGES.map((l) => {
              const active = languages.includes(l);
              return (
                <TouchableOpacity
                  key={l}
                  onPress={() => toggle(languages, setLanguages, l)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {l.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.subLabel}>{t('budgetLevel')}</Text>
          <View style={styles.chipsRow}>
            {BUDGETS.map((b) => {
              const active = budgetLevel === b;
              return (
                <TouchableOpacity
                  key={b}
                  onPress={() => setBudgetLevel(b)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t(`budgetLevels.${b}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.subLabel}>{t('yourInterests')}</Text>
          <View style={styles.chipsGrid}>
            {INTERESTS.map((k) => {
              const active = interests.includes(k);
              return (
                <TouchableOpacity
                  key={k}
                  onPress={() => toggle(interests, setInterests, k)}
                  style={[styles.chip, active && styles.chipActive]}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>
                    {t(`interests.${k}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <SaveBtn loading={savingPrefs} onPress={savePreferences} />
        </Section>

        {/* Password */}
        <Section title={t('changePassword')}>
          <Field
            label={t('currentPassword')}
            value={currentPassword}
            onChange={setCurrentPassword}
            secure
          />
          <Field
            label={t('newPassword')}
            value={newPassword}
            onChange={setNewPassword}
            secure
          />
          <Field
            label={t('confirmPassword')}
            value={confirmPassword}
            onChange={setConfirmPassword}
            secure
          />
          <SaveBtn loading={savingPwd} onPress={changePassword} label={t('changePassword')} />
        </Section>

        {/* Danger zone */}
        <View style={styles.dangerSection}>
          <View style={styles.dangerHeader}>
            <Ionicons name="warning" size={16} color={palette.error} />
            <Text style={styles.dangerTitle}>{t('dangerZone')}</Text>
          </View>
          <Text style={styles.dangerWarning}>{t('deleteAccountWarning')}</Text>
          <Field
            label={t('yourPasswordOptional')}
            value={deleteConfirmPassword}
            onChange={setDeleteConfirmPassword}
            secure
          />
          <TouchableOpacity
            style={[styles.deleteBtn, deletingAccount && styles.saveBtnDisabled]}
            onPress={confirmDeleteAccount}
            disabled={deletingAccount}
          >
            {deletingAccount ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <>
                <Ionicons name="trash" size={18} color={palette.white} />
                <Text style={styles.saveBtnText}>{t('deleteAccount')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const Section = ({ title, children }: any) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
);

const Field = ({
  label,
  value,
  onChange,
  placeholder,
  secure,
  keyboardType,
  autoCapitalize,
}: any) => (
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

const SaveBtn = ({
  loading,
  onPress,
  label,
}: {
  loading: boolean;
  onPress: () => void;
  label?: string;
}) => {
  const { t } = useTranslation();
  return (
    <TouchableOpacity
      style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={palette.white} />
      ) : (
        <>
          <Ionicons name="checkmark" size={18} color={palette.white} />
          <Text style={styles.saveBtnText}>{label || t('save')}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
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
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap: { width: 100, height: 100, position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: {
    backgroundColor: palette.mediterraneanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: palette.white, fontSize: 32, fontWeight: '800' },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: palette.terracotta,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: palette.gray50,
  },
  email: { color: palette.gray500, marginTop: spacing.sm, fontSize: 13 },
  section: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.h4,
    color: palette.gray900,
    marginBottom: spacing.md,
  },
  subLabel: {
    color: palette.gray600,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  fieldRow: { marginBottom: spacing.sm },
  fieldLabel: { color: palette.gray600, fontSize: 12, fontWeight: '600', marginBottom: 4 },
  fieldInput: {
    backgroundColor: palette.gray50,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 15,
    color: palette.gray900,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipsRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginBottom: spacing.sm },
  chipsGrid: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipActive: { backgroundColor: palette.mediterraneanBlue, borderColor: palette.mediterraneanBlue },
  chipText: { color: palette.gray700, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: palette.white },
  saveBtn: {
    marginTop: spacing.md,
    backgroundColor: palette.mediterraneanBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: palette.white, fontWeight: '700', fontSize: 15 },
  dangerSection: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: palette.errorLight,
    ...shadows.sm,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.sm,
  },
  dangerTitle: {
    color: palette.error,
    fontWeight: '800',
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dangerWarning: {
    color: palette.gray600,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: spacing.sm,
  },
  deleteBtn: {
    marginTop: spacing.md,
    backgroundColor: palette.error,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
