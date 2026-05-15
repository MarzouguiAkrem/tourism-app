import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  setLanguage,
  setTheme,
  toggleOfflineMode,
  setOfflineDataDownloaded,
} from '../../store/slices/settingsSlice';
import { syncService } from '../../services/sync.service';
import { offlineCache, writeQueue } from '../../utils/offlineCache';

const LANGS: { key: 'fr' | 'en' | 'ar'; label: string; flag: string }[] = [
  { key: 'fr', label: 'Français', flag: '🇫🇷' },
  { key: 'en', label: 'English', flag: '🇬🇧' },
  { key: 'ar', label: 'العربية', flag: '🇸🇦' },
];

const THEMES: {
  key: 'light' | 'dark' | 'system';
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'light', icon: 'sunny' },
  { key: 'dark', icon: 'moon' },
  { key: 'system', icon: 'phone-portrait' },
];

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((s) => s.settings);

  const [syncing, setSyncing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const changeLanguage = async (lang: 'fr' | 'en' | 'ar') => {
    dispatch(setLanguage(lang));
    await i18n.changeLanguage(lang);
  };

  const forceSync = async () => {
    try {
      setSyncing(true);
      await syncService.downloadBundle();
      dispatch(setOfflineDataDownloaded(true));
      Alert.alert(t('saved'), t('syncCompleted'));
    } catch (err: any) {
      Alert.alert(t('error'), err?.message || t('syncFailed'));
    } finally {
      setSyncing(false);
    }
  };

  const clearCache = () => {
    Alert.alert(t('confirm'), t('clearCacheConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('clear'),
        style: 'destructive',
        onPress: async () => {
          try {
            setClearing(true);
            await offlineCache.clear();
            await writeQueue.clear();
            dispatch(setOfflineDataDownloaded(false));
            Alert.alert(t('saved'), t('cacheCleared'));
          } finally {
            setClearing(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('settings')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Language */}
        <Section title={t('language')} icon="language">
          {LANGS.map((l) => {
            const active = settings.language === l.key;
            return (
              <TouchableOpacity
                key={l.key}
                style={[styles.row, active && styles.rowActive]}
                onPress={() => changeLanguage(l.key)}
              >
                <Text style={styles.flag}>{l.flag}</Text>
                <Text style={[styles.rowText, active && styles.rowTextActive]}>{l.label}</Text>
                {active && <Ionicons name="checkmark" size={20} color={palette.mediterraneanBlue} />}
              </TouchableOpacity>
            );
          })}
        </Section>

        {/* Theme */}
        <Section title={t('theme')} icon="color-palette">
          <View style={styles.themeRow}>
            {THEMES.map((th) => {
              const active = settings.theme === th.key;
              return (
                <TouchableOpacity
                  key={th.key}
                  style={[styles.themeOption, active && styles.themeOptionActive]}
                  onPress={() => dispatch(setTheme(th.key))}
                >
                  <Ionicons
                    name={th.icon}
                    size={24}
                    color={active ? palette.mediterraneanBlue : palette.gray500}
                  />
                  <Text
                    style={[
                      styles.themeOptionLabel,
                      active && styles.themeOptionLabelActive,
                    ]}
                  >
                    {t(`themes.${th.key}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Section>

        {/* Offline */}
        <Section title={t('offlineMode')} icon="cloud-offline">
          <View style={styles.toggleRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.toggleLabel}>{t('enableOfflineMode')}</Text>
              <Text style={styles.toggleHelp}>{t('enableOfflineModeHelp')}</Text>
            </View>
            <Switch
              value={settings.offlineModeEnabled}
              onValueChange={() => {
                dispatch(toggleOfflineMode());
              }}
              trackColor={{ false: palette.gray200, true: palette.skyBlue }}
              thumbColor={settings.offlineModeEnabled ? palette.mediterraneanBlue : palette.gray400}
            />
          </View>

          {settings.lastOfflineSync && (
            <Text style={styles.lastSync}>
              {t('lastSync')} : {new Date(settings.lastOfflineSync).toLocaleString()}
            </Text>
          )}

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={forceSync}
            disabled={syncing}
          >
            {syncing ? (
              <ActivityIndicator color={palette.mediterraneanBlue} />
            ) : (
              <>
                <Ionicons name="cloud-download" size={18} color={palette.mediterraneanBlue} />
                <Text style={styles.actionBtnText}>{t('syncNow')}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.actionBtnDanger]}
            onPress={clearCache}
            disabled={clearing}
          >
            {clearing ? (
              <ActivityIndicator color={palette.error} />
            ) : (
              <>
                <Ionicons name="trash" size={18} color={palette.error} />
                <Text style={[styles.actionBtnText, { color: palette.error }]}>
                  {t('clearCache')}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </Section>

        {/* About */}
        <Section title={t('about')} icon="information-circle">
          <View style={styles.aboutRow}>
            <Text style={styles.aboutKey}>{t('version')}</Text>
            <Text style={styles.aboutValue}>1.0.0</Text>
          </View>
        </Section>
      </ScrollView>
    </View>
  );
}

const Section = ({ title, icon, children }: any) => (
  <View style={styles.section}>
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={palette.mediterraneanBlue} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {children}
  </View>
);

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
  section: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionTitle: { ...typography.h4, color: palette.gray800, fontSize: 15 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.md,
  },
  rowActive: { backgroundColor: palette.infoLight },
  flag: { fontSize: 22 },
  rowText: { flex: 1, color: palette.gray800, fontSize: 14, fontWeight: '600' },
  rowTextActive: { color: palette.mediterraneanBlue },
  themeRow: { flexDirection: 'row', gap: spacing.sm },
  themeOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: palette.gray50,
    borderWidth: 1,
    borderColor: palette.gray200,
    gap: 6,
  },
  themeOptionActive: {
    backgroundColor: palette.infoLight,
    borderColor: palette.mediterraneanBlue,
  },
  themeOptionLabel: { color: palette.gray600, fontSize: 12, fontWeight: '600' },
  themeOptionLabelActive: { color: palette.mediterraneanBlue },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  toggleLabel: { color: palette.gray900, fontWeight: '600', fontSize: 14 },
  toggleHelp: { color: palette.gray500, fontSize: 12, marginTop: 2 },
  lastSync: {
    color: palette.gray500,
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.infoLight,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  actionBtnDanger: { backgroundColor: palette.errorLight },
  actionBtnText: { color: palette.mediterraneanBlue, fontWeight: '700', fontSize: 14 },
  aboutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  aboutKey: { color: palette.gray600, fontSize: 14 },
  aboutValue: { color: palette.gray900, fontWeight: '600', fontSize: 14 },
});
