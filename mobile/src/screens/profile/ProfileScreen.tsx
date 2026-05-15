import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const user = useAppSelector((s) => s.auth.user);
  const isAdmin = user?.role === 'admin';

  const performLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
    } catch {
      // logout() never rejects (catches API error internally), but be defensive
    }
  };

  const handleLogout = () => {
    // Alert.alert is a no-op on Expo web — fall back to window.confirm there.
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      if (typeof window !== 'undefined' && window.confirm(t('logoutConfirm'))) {
        performLogout();
      }
      return;
    }

    Alert.alert(t('confirm'), t('logoutConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: performLogout,
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.firstName?.[0]?.toUpperCase() || '?'}
            {user?.lastName?.[0]?.toUpperCase() || ''}
          </Text>
        </View>
        <Text style={styles.name}>{user?.fullName || ''}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        {isAdmin && (
          <View style={styles.roleBadge}>
            <Ionicons name="shield-checkmark" size={12} color={palette.white} />
            <Text style={styles.roleText}>{t('admin')}</Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        {isAdmin && (
          <Row
            icon="stats-chart"
            label={t('adminDashboard')}
            color={palette.terracotta}
            onPress={() => navigation.getParent()?.navigate('Admin')}
          />
        )}
        <Row
          icon="person"
          label={t('editProfile')}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <Row
          icon="settings"
          label={t('settings')}
          onPress={() => navigation.navigate('Settings')}
        />
        <Row
          icon="star"
          label={t('rateTheApp')}
          color={palette.gold}
          onPress={() => navigation.navigate('Feedback')}
        />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={palette.error} />
        <Text style={styles.logoutText}>{t('logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const Row = ({ icon, label, color, onPress }: any) => (
  <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.85}>
    <View style={[styles.rowIcon, { backgroundColor: (color || palette.mediterraneanBlue) + '22' }]}>
      <Ionicons name={icon} size={18} color={color || palette.mediterraneanBlue} />
    </View>
    <Text style={styles.rowLabel}>{label}</Text>
    <Ionicons name="chevron-forward" size={18} color={palette.gray400} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  content: { padding: spacing.lg, paddingTop: spacing['2xl'], paddingBottom: spacing['3xl'] },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: palette.mediterraneanBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: { color: palette.white, fontSize: 28, fontWeight: '800' },
  name: { ...typography.h3, color: palette.gray900 },
  email: { color: palette.gray500, fontSize: 14, marginTop: 2 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.terracotta,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  roleText: { color: palette.white, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  section: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    marginBottom: spacing.lg,
    ...shadows.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, color: palette.gray800, fontWeight: '600', fontSize: 14 },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.errorLight,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
  },
  logoutText: { color: palette.error, fontWeight: '700' },
});
