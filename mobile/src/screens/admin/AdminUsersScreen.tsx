import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { adminUserService } from '../../services/user.service';
import { User } from '../../types/user';
import { resolveImageUrl } from '../../utils/imageUrl';
import { useAppSelector } from '../../store/hooks';

type RoleFilter = 'all' | 'tourist' | 'admin';

export default function AdminUsersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const me = useAppSelector((s) => s.auth.user);

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Debounce search input by 350ms so each keystroke doesn't hammer the API
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => clearTimeout(id);
  }, [search]);

  const fetchUsers = useCallback(
    async (targetPage = 1, append = false) => {
      try {
        if (!append) setLoading(true);
        const res = await adminUserService.list({
          page: targetPage,
          limit: 20,
          search: debouncedSearch || undefined,
          role: roleFilter === 'all' ? undefined : roleFilter,
        });
        setUsers((prev) => (append ? [...prev, ...res.data] : res.data));
        setPage(res.pagination.page);
        setTotalPages(res.pagination.totalPages);
      } catch (err: any) {
        Alert.alert(t('error'), err?.response?.data?.message || t('error'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [debouncedSearch, roleFilter, t]
  );

  useEffect(() => {
    fetchUsers(1, false);
  }, [fetchUsers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers(1, false);
  };

  const loadMore = () => {
    if (loading || page >= totalPages) return;
    fetchUsers(page + 1, true);
  };

  const replaceLocal = (updated: User) => {
    setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
  };

  const toggleRole = async (user: User) => {
    if (user._id === me?._id) return; // never demote/promote self
    const nextRole = user.role === 'admin' ? 'tourist' : 'admin';
    try {
      setBusyId(user._id);
      const updated = await adminUserService.update(user._id, { role: nextRole });
      replaceLocal(updated);
      Alert.alert(t('saved'), t('userUpdated'));
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setBusyId(null);
    }
  };

  const deactivate = (user: User) => {
    Alert.alert(t('confirm'), t('deactivateUserConfirm'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deactivate'),
        style: 'destructive',
        onPress: async () => {
          try {
            setBusyId(user._id);
            await adminUserService.deactivate(user._id);
            replaceLocal({ ...user, isActive: false });
            Alert.alert(t('saved'), t('userDeactivated'));
          } catch (err: any) {
            Alert.alert(t('error'), err?.response?.data?.message || t('error'));
          } finally {
            setBusyId(null);
          }
        },
      },
    ]);
  };

  const reactivate = async (user: User) => {
    try {
      setBusyId(user._id);
      const updated = await adminUserService.reactivate(user._id);
      replaceLocal(updated);
      Alert.alert(t('saved'), t('userReactivated'));
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setBusyId(null);
    }
  };

  const openActions = (user: User) => {
    const isSelf = user._id === me?._id;
    const buttons: any[] = [];

    buttons.push({
      text: t('edit'),
      onPress: () => navigation.navigate('AdminUserForm', { userId: user._id }),
    });

    if (!isSelf) {
      buttons.push({
        text: user.role === 'admin' ? t('demoteToTourist') : t('promoteToAdmin'),
        onPress: () => toggleRole(user),
      });
      buttons.push({
        text: user.isActive ? t('deactivate') : t('reactivate'),
        style: user.isActive ? 'destructive' : 'default',
        onPress: () => (user.isActive ? deactivate(user) : reactivate(user)),
      });
    }
    buttons.push({ text: t('cancel'), style: 'cancel' });

    Alert.alert(
      `${user.firstName} ${user.lastName}`,
      isSelf ? '—' : user.email,
      buttons
    );
  };

  const filteredCount = useMemo(() => users.length, [users]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('userManagement')}</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AdminUserForm', {})}
          hitSlop={10}
        >
          <Ionicons name="person-add" size={22} color={palette.mediterraneanBlue} />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={palette.gray400} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchUser')}
          placeholderTextColor={palette.gray400}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
            <Ionicons name="close-circle" size={18} color={palette.gray400} />
          </TouchableOpacity>
        )}
      </View>

      {/* Role filter chips */}
      <View style={styles.filterRow}>
        {(['all', 'tourist', 'admin'] as RoleFilter[]).map((r) => {
          const active = roleFilter === r;
          const label = r === 'all' ? t('roleAll') : r === 'admin' ? t('roleAdmin') : t('roleTourist');
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setRoleFilter(r)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
        <View style={{ flex: 1 }} />
        <Text style={styles.count}>{filteredCount}</Text>
      </View>

      {loading && users.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator color={palette.mediterraneanBlue} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={palette.mediterraneanBlue}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <Text style={styles.empty}>{t('noUsersFound')}</Text>
          }
          renderItem={({ item }) => (
            <UserRow
              user={item}
              isSelf={item._id === me?._id}
              busy={busyId === item._id}
              onPress={() => openActions(item)}
              onEdit={() => navigation.navigate('AdminUserForm', { userId: item._id })}
              onDelete={() => deactivate(item)}
              t={t}
            />
          )}
        />
      )}
    </View>
  );
}

const UserRow = ({
  user,
  isSelf,
  busy,
  onPress,
  onEdit,
  onDelete,
  t,
}: {
  user: User;
  isSelf: boolean;
  busy: boolean;
  onPress: () => void;
  onEdit: () => void;
  onDelete: () => void;
  t: (k: string) => string;
}) => {
  // Inline icon actions are reserved for active tourist accounts (other than
  // yourself). Admins keep the ellipsis menu (promote/demote logic etc.).
  const showInlineActions = user.role === 'tourist' && !isSelf && user.isActive;

  return (
    <TouchableOpacity
      style={[styles.row, !user.isActive && styles.rowInactive]}
      onPress={onPress}
      activeOpacity={0.85}
      disabled={busy}
    >
      {user.avatar ? (
        <Image source={{ uri: resolveImageUrl(user.avatar) }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Text style={styles.avatarInitials}>
            {(user.firstName?.[0] || '').toUpperCase()}
            {(user.lastName?.[0] || '').toUpperCase()}
          </Text>
        </View>
      )}
      <View style={{ flex: 1 }}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {user.firstName} {user.lastName}
          </Text>
          {user.role === 'admin' && (
            <View style={styles.adminPill}>
              <Ionicons name="shield-checkmark" size={10} color={palette.white} />
              <Text style={styles.adminPillText}>ADMIN</Text>
            </View>
          )}
          {isSelf && (
            <View style={styles.selfPill}>
              <Text style={styles.selfPillText}>YOU</Text>
            </View>
          )}
        </View>
        <Text style={styles.email} numberOfLines={1}>
          {user.email}
        </Text>
        <View style={styles.metaRow}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: user.isActive ? palette.success : palette.gray400 },
            ]}
          />
          <Text style={styles.metaText}>
            {user.isActive ? t('userActive') : t('userInactive')}
          </Text>
          {user.createdAt && (
            <Text style={styles.metaText}>
              · {new Date(user.createdAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {busy ? (
        <ActivityIndicator color={palette.mediterraneanBlue} />
      ) : showInlineActions ? (
        <View style={styles.inlineActions}>
          <TouchableOpacity
            onPress={onEdit}
            hitSlop={8}
            style={[styles.iconBtn, styles.iconBtnEdit]}
          >
            <Ionicons name="create-outline" size={18} color={palette.mediterraneanBlue} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onDelete}
            hitSlop={8}
            style={[styles.iconBtn, styles.iconBtnDelete]}
          >
            <Ionicons name="trash-outline" size={18} color={palette.error} />
          </TouchableOpacity>
        </View>
      ) : (
        <Ionicons name="ellipsis-vertical" size={18} color={palette.gray400} />
      )}
    </TouchableOpacity>
  );
};

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
  searchWrap: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  searchInput: { flex: 1, color: palette.gray900, fontSize: 14, paddingVertical: 0 },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: palette.gray100,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipActive: {
    backgroundColor: palette.mediterraneanBlue,
    borderColor: palette.mediterraneanBlue,
  },
  chipText: { color: palette.gray700, fontSize: 12, fontWeight: '600' },
  chipTextActive: { color: palette.white },
  count: {
    color: palette.gray500,
    fontSize: 12,
    fontWeight: '700',
    marginRight: spacing.xs,
  },
  list: { padding: spacing.lg, paddingTop: spacing.xs, paddingBottom: spacing['3xl'] },
  empty: {
    textAlign: 'center',
    color: palette.gray500,
    marginTop: spacing.xl,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.white,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  rowInactive: { opacity: 0.55 },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  avatarPlaceholder: {
    backgroundColor: palette.mediterraneanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { color: palette.white, fontSize: 14, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  name: { color: palette.gray900, fontWeight: '700', fontSize: 14, flexShrink: 1 },
  email: { color: palette.gray500, fontSize: 12, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  metaText: { color: palette.gray500, fontSize: 11 },
  adminPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: palette.terracotta,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  adminPillText: { color: palette.white, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  selfPill: {
    backgroundColor: palette.gray200,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
  },
  selfPillText: { color: palette.gray700, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  inlineActions: { flexDirection: 'row', gap: 6 },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnEdit: { backgroundColor: palette.infoLight },
  iconBtnDelete: { backgroundColor: palette.errorLight },
});
