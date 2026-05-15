import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { safetyService } from '../../services/safety.service';
import { SafetyAlert, Severity } from '../../types/safety';
import { useLocalized } from '../../hooks/useLocalized';

const SEVERITY_COLOR: Record<Severity, { bg: string; fg: string; icon: keyof typeof import('@expo/vector-icons/build/Icons').Ionicons.glyphMap }> = {
  info: { bg: palette.infoLight, fg: palette.info, icon: 'information-circle' },
  warning: { bg: palette.warningLight, fg: palette.warning, icon: 'warning' },
  danger: { bg: palette.errorLight, fg: palette.error, icon: 'alert-circle' },
};

export default function SafetyScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();

  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(alerts.length === 0);
      if (nearbyMode) {
        const { status } = await Location.getForegroundPermissionsAsync();
        if (status !== 'granted') {
          setAlerts(await safetyService.alerts());
        } else {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const data = await safetyService.nearby(
            pos.coords.longitude,
            pos.coords.latitude,
            50000
          );
          setAlerts(data);
        }
      } else {
        const data = await safetyService.alerts();
        setAlerts(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [alerts.length, nearbyMode]);

  useEffect(() => {
    load();
  }, [nearbyMode]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleNearby = async () => {
    if (nearbyMode) {
      setNearbyMode(false);
      return;
    }
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('locationPermissionDenied'));
        return;
      }
      setNearbyMode(true);
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('safety')}</Text>
        <TouchableOpacity onPress={toggleNearby} hitSlop={10} disabled={locating}>
          {locating ? (
            <ActivityIndicator size="small" color={palette.mediterraneanBlue} />
          ) : (
            <Ionicons
              name={nearbyMode ? 'navigate' : 'navigate-outline'}
              size={22}
              color={nearbyMode ? palette.terracotta : palette.mediterraneanBlue}
            />
          )}
        </TouchableOpacity>
      </View>
      {nearbyMode && (
        <View style={styles.nearbyBanner}>
          <Ionicons name="locate" size={14} color={palette.terracotta} />
          <Text style={styles.nearbyBannerText}>{t('alertsNearby')}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.sosButton}
        onPress={() => navigation.navigate('SOS')}
        activeOpacity={0.85}
      >
        <Ionicons name="medkit" size={24} color={palette.white} />
        <View style={{ flex: 1 }}>
          <Text style={styles.sosTitle}>SOS</Text>
          <Text style={styles.sosSubtitle}>{t('sosSubtitle')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={22} color={palette.white} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={palette.mediterraneanBlue}
          />
        }
      >
        <Text style={styles.sectionTitle}>{t('activeAlerts')}</Text>

        {loading ? (
          <ActivityIndicator color={palette.mediterraneanBlue} style={{ marginTop: spacing.xl }} />
        ) : alerts.length === 0 ? (
          <View style={styles.emptyBox}>
            <Ionicons name="shield-checkmark" size={48} color={palette.success} />
            <Text style={styles.emptyText}>{t('noActiveAlerts')}</Text>
          </View>
        ) : (
          alerts.map((a) => {
            const sev = SEVERITY_COLOR[a.severity];
            return (
              <View key={a._id} style={[styles.card, { borderLeftColor: sev.fg }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.severityPill, { backgroundColor: sev.bg }]}>
                    <Ionicons name={sev.icon} size={14} color={sev.fg} />
                    <Text style={[styles.severityText, { color: sev.fg }]}>
                      {t(`severityLevels.${a.severity}`)}
                    </Text>
                  </View>
                  {a.region && <Text style={styles.region}>{a.region}</Text>}
                </View>
                <Text style={styles.alertTitle}>{tr(a.title)}</Text>
                <Text style={styles.alertMessage}>{tr(a.message)}</Text>
                {a.source && (
                  <Text style={styles.source}>{t('source')} : {a.source}</Text>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

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
  nearbyBanner: {
    marginHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: palette.terracotta + '15',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  nearbyBannerText: { color: palette.terracotta, fontSize: 12, fontWeight: '700' },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.error,
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.md,
  },
  sosTitle: { color: palette.white, fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  sosSubtitle: { color: palette.errorLight, fontSize: 12, marginTop: 2 },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing['3xl'] },
  sectionTitle: {
    ...typography.h4,
    color: palette.gray800,
    marginBottom: spacing.sm,
  },
  emptyBox: { alignItems: 'center', marginTop: spacing['2xl'] },
  emptyText: { color: palette.gray600, marginTop: spacing.sm, fontSize: 14 },
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderLeftWidth: 4,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  severityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  severityText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  region: { color: palette.gray500, fontSize: 12 },
  alertTitle: { ...typography.h4, color: palette.gray900, marginBottom: spacing.xs },
  alertMessage: { ...typography.bodySmall, color: palette.gray700 },
  source: { color: palette.gray500, fontSize: 11, marginTop: spacing.sm, fontStyle: 'italic' },
});
