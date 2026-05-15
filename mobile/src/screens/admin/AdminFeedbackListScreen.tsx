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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { feedbackService } from '../../services/feedback.service';
import { Feedback, FeedbackStatus, FeedbackStats } from '../../types/feedback';

const STATUS_COLOR: Record<FeedbackStatus, string> = {
  'new': palette.info,
  'reviewed': palette.gold,
  'in-progress': palette.terracotta,
  'resolved': palette.success,
  'wont-fix': palette.gray500,
};

const STATUSES: FeedbackStatus[] = ['new', 'reviewed', 'in-progress', 'resolved', 'wont-fix'];

export default function AdminFeedbackListScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [items, setItems] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [statusFilter, setStatusFilter] = useState<FeedbackStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [res, st] = await Promise.all([
        feedbackService.list({
          status: statusFilter === 'all' ? undefined : statusFilter,
          limit: 50,
        }),
        feedbackService.stats(),
      ]);
      setItems(res.data);
      setStats(st);
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [statusFilter, t]);

  useEffect(() => {
    load();
  }, [load]);

  const changeStatus = (fb: Feedback) => {
    Alert.alert(
      t('feedbackStatus'),
      undefined,
      STATUSES.map((s) => ({
        text: t(`feedbackStatuses.${s}`),
        onPress: async () => {
          try {
            setBusyId(fb._id);
            const updated = await feedbackService.updateStatus(fb._id, { status: s });
            setItems((prev) => prev.map((it) => (it._id === fb._id ? updated : it)));
          } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('error'));
          } finally {
            setBusyId(null);
          }
        },
      })).concat([{ text: t('cancel'), style: 'cancel' as const, onPress: () => {} }])
    );
  };

  const remove = (fb: Feedback) => {
    Alert.alert(t('confirm'), t('feedbackDeleteConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            setBusyId(fb._id);
            await feedbackService.remove(fb._id);
            setItems((prev) => prev.filter((it) => it._id !== fb._id));
          } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('error'));
          } finally {
            setBusyId(null);
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
        <Text style={styles.headerTitle}>{t('userFeedback')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {stats && (
        <View style={styles.statsCard}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{(stats.overall.avg || 0).toFixed(1)}</Text>
            <Text style={styles.statLabel}>{t('avgRating')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.overall.total}</Text>
            <Text style={styles.statLabel}>{t('totalFeedback')}</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={[styles.statValue, { color: palette.info }]}>{stats.overall.new}</Text>
            <Text style={styles.statLabel}>{t('feedbackStatuses.new')}</Text>
          </View>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        <Chip label={t('roleAll')} active={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
        {STATUSES.map((s) => (
          <Chip
            key={s}
            label={t(`feedbackStatuses.${s}`)}
            active={statusFilter === s}
            color={STATUS_COLOR[s]}
            onPress={() => setStatusFilter(s)}
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
          keyExtractor={(f) => f._id}
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
          ListEmptyComponent={<Text style={styles.empty}>{t('noResults')}</Text>}
          renderItem={({ item }) => {
            const userObj = typeof item.user === 'object' ? item.user : null;
            return (
              <View style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.userName}>
                      {userObj ? `${userObj.firstName} ${userObj.lastName}` : t('user')}
                    </Text>
                    {userObj && <Text style={styles.userEmail}>{userObj.email}</Text>}
                  </View>
                  <View style={[styles.pill, { backgroundColor: STATUS_COLOR[item.status] + '22' }]}>
                    <Text style={[styles.pillText, { color: STATUS_COLOR[item.status] }]}>
                      {t(`feedbackStatuses.${item.status}`)}
                    </Text>
                  </View>
                </View>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Ionicons
                      key={n}
                      name={n <= item.rating ? 'star' : 'star-outline'}
                      size={14}
                      color={palette.gold}
                    />
                  ))}
                  <Text style={styles.categoryTag}>
                    · {t(`feedbackCategories.${item.category}`)}
                  </Text>
                </View>
                {item.comment ? <Text style={styles.comment}>{item.comment}</Text> : null}
                <Text style={styles.date}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => changeStatus(item)}
                    disabled={busyId === item._id}
                  >
                    <Ionicons name="swap-vertical" size={14} color={palette.mediterraneanBlue} />
                    <Text style={styles.actionText}>{t('changeStatus')}</Text>
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
      active && { backgroundColor: color || palette.mediterraneanBlue, borderColor: color || palette.mediterraneanBlue },
    ]}
  >
    <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.h3, color: palette.gray900 },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: palette.white,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800', color: palette.gray900 },
  statLabel: { color: palette.gray500, fontSize: 11, marginTop: 2 },
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
  empty: { textAlign: 'center', color: palette.gray500, marginTop: spacing.xl },
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  userName: { color: palette.gray900, fontWeight: '700', fontSize: 14 },
  userEmail: { color: palette.gray500, fontSize: 11, marginTop: 2 },
  pill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.full },
  pillText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  starsRow: { flexDirection: 'row', alignItems: 'center', gap: 1, marginBottom: 4 },
  categoryTag: { color: palette.gray600, fontSize: 11, marginLeft: spacing.xs },
  comment: { color: palette.gray800, fontSize: 13, lineHeight: 18, marginVertical: 4 },
  date: { color: palette.gray400, fontSize: 11, marginTop: 4 },
  actionsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
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
