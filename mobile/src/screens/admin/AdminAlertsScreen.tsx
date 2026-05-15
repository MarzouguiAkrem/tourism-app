import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { safetyAdminService } from '../../services/safety.service';
import { SafetyAlert, Severity } from '../../types/safety';
import { useLocalized } from '../../hooks/useLocalized';

const SEVERITIES: { key: Severity; color: string }[] = [
  { key: 'info', color: palette.info },
  { key: 'warning', color: palette.warning },
  { key: 'danger', color: palette.error },
];

export default function AdminAlertsScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();

  const [items, setItems] = useState<SafetyAlert[]>([]);
  const [severity, setSeverity] = useState<Severity | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await safetyAdminService.list({
        severity: severity === 'all' ? undefined : severity,
        limit: 50,
        active: undefined, // include inactive too
      });
      setItems(res.items);
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [severity, t]);

  useEffect(() => {
    load();
  }, [load]);

  // Reload when we come back from the edit screen
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const remove = (a: SafetyAlert) => {
    Alert.alert(t('confirm'), t('alertDeleteConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            setBusyId(a._id);
            await safetyAdminService.remove(a._id);
            setItems((prev) => prev.filter((it) => it._id !== a._id));
          } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('error'));
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const toggleActive = async (a: SafetyAlert) => {
    try {
      setBusyId(a._id);
      const updated = await safetyAdminService.update(a._id, { active: !a.active });
      setItems((prev) => prev.map((it) => (it._id === a._id ? updated : it)));
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('manageAlerts')}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminAlertForm', {})}
          hitSlop={10}
        >
          <Ionicons name="add-circle" size={26} color={palette.mediterraneanBlue} />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Chip label={t('roleAll')} active={severity === 'all'} onPress={() => setSeverity('all')} />
        {SEVERITIES.map((s) => (
          <Chip
            key={s.key}
            label={t(`severityLevels.${s.key}`)}
            color={s.color}
            active={severity === s.key}
            onPress={() => setSeverity(s.key)}
          />
        ))}
      </ScrollView>

      {loading && items.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.mediterraneanBlue} />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(a) => a._id}
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
          ListEmptyComponent={
            <View style={styles.centered}>
              <Ionicons name="shield-checkmark" size={48} color={palette.gray400} />
              <Text style={styles.empty}>{t('noAlertsYet')}</Text>
            </View>
          }
          renderItem={({ item }) => {
            const sevColor =
              SEVERITIES.find((s) => s.key === item.severity)?.color || palette.gray500;
            return (
              <View style={[styles.card, !item.active && styles.cardInactive]}>
                <View style={styles.cardHead}>
                  <View style={[styles.sevPill, { backgroundColor: sevColor + '22' }]}>
                    <Text style={[styles.sevText, { color: sevColor }]}>
                      {t(`severityLevels.${item.severity}`)}
                    </Text>
                  </View>
                  {item.region && (
                    <Text style={styles.metaText}>
                      {t(`regions.${item.region}` as any) || item.region}
                    </Text>
                  )}
                  {!item.active && (
                    <View style={styles.inactivePill}>
                      <Text style={styles.inactiveText}>{t('inactive')}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.alertTitle}>{tr(item.title)}</Text>
                <Text style={styles.alertMessage} numberOfLines={3}>{tr(item.message)}</Text>
                {item.expiresAt && (
                  <Text style={styles.expires}>
                    {t('expiresOn')} : {new Date(item.expiresAt).toLocaleString()}
                  </Text>
                )}
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('AdminAlertForm', { alertId: item._id })}
                  >
                    <Ionicons name="pencil" size={14} color={palette.mediterraneanBlue} />
                    <Text style={styles.actionText}>{t('edit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => toggleActive(item)}
                    disabled={busyId === item._id}
                  >
                    <Ionicons
                      name={item.active ? 'pause' : 'play'}
                      size={14}
                      color={palette.mediterraneanBlue}
                    />
                    <Text style={styles.actionText}>
                      {item.active ? t('deactivate') : t('reactivate')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionDanger]}
                    onPress={() => remove(item)}
                    disabled={busyId === item._id}
                  >
                    {busyId === item._id ? (
                      <ActivityIndicator size="small" color={palette.error} />
                    ) : (
                      <>
                        <Ionicons name="trash" size={14} color={palette.error} />
                        <Text style={[styles.actionText, { color: palette.error }]}>
                          {t('delete')}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const Chip = ({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color?: string;
  onPress: () => void;
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.chip,
      active && {
        backgroundColor: color || palette.mediterraneanBlue,
        borderColor: color || palette.mediterraneanBlue,
      },
    ]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.lg, gap: spacing.sm },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.h3, color: palette.gray900 },
  filterRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: 6 },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipText: { color: palette.gray700, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: palette.white },
  list: { padding: spacing.lg, paddingTop: 0, paddingBottom: spacing['3xl'] },
  empty: { color: palette.gray500, fontSize: 14 },
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardInactive: { opacity: 0.55 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: 6 },
  sevPill: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.full },
  sevText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  metaText: { color: palette.gray500, fontSize: 12, textTransform: 'capitalize' },
  inactivePill: {
    backgroundColor: palette.gray200,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  inactiveText: { color: palette.gray700, fontSize: 10, fontWeight: '800' },
  alertTitle: { ...typography.h4, color: palette.gray900, marginBottom: 2 },
  alertMessage: { color: palette.gray700, fontSize: 13, lineHeight: 18 },
  expires: { color: palette.gray500, fontSize: 11, marginTop: 4, fontStyle: 'italic' },
  actionsRow: { flexDirection: 'row', gap: 6, marginTop: spacing.sm, flexWrap: 'wrap' },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.md,
    backgroundColor: palette.infoLight,
  },
  actionDanger: { backgroundColor: palette.errorLight },
  actionText: { color: palette.mediterraneanBlue, fontSize: 12, fontWeight: '700' },
});
