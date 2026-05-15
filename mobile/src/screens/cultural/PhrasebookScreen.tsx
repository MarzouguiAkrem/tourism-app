import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { culturalService } from '../../services/cultural.service';
import { LexiconCategory, LexiconEntry } from '../../types/cultural';
import { useLocalized } from '../../hooks/useLocalized';

const CATEGORIES: { key: LexiconCategory | 'all'; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'all', icon: 'apps' },
  { key: 'greeting', icon: 'hand-right' },
  { key: 'food', icon: 'restaurant' },
  { key: 'directions', icon: 'navigate' },
  { key: 'shopping', icon: 'cart' },
  { key: 'emergency', icon: 'medkit' },
  { key: 'numbers', icon: 'calculator' },
  { key: 'time', icon: 'time' },
];

export default function PhrasebookScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();

  const [category, setCategory] = useState<LexiconCategory | 'all'>('all');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<LexiconEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(items.length === 0);
      const data = await culturalService.lexicon(
        category === 'all' ? undefined : category,
        search.trim() || undefined
      );
      setItems(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [category, search, items.length]);

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
  }, [category, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = useMemo(() => {
    const map: Record<string, LexiconEntry[]> = {};
    items.forEach((e) => {
      if (!map[e.category]) map[e.category] = [];
      map[e.category].push(e);
    });
    return map;
  }, [items]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('phrasebook')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchWrap}>
        <Ionicons name="search" size={18} color={palette.gray400} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t('searchWord')}
          placeholderTextColor={palette.gray400}
          style={styles.searchInput}
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={palette.gray400} />
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {CATEGORIES.map((c) => {
          const active = category === c.key;
          return (
            <TouchableOpacity
              key={c.key}
              style={[styles.tab, active && styles.tabActive]}
              onPress={() => setCategory(c.key)}
            >
              <Ionicons name={c.icon} size={14} color={active ? palette.white : palette.gray600} />
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {t(`lexiconCategories.${c.key}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={palette.mediterraneanBlue} style={{ marginTop: spacing.xl }} />
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {Object.keys(grouped).length === 0 ? (
            <Text style={styles.empty}>{t('noResults')}</Text>
          ) : (
            Object.entries(grouped).map(([cat, entries]) => (
              <View key={cat} style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t(`lexiconCategories.${cat}` as any)}
                </Text>
                {entries.map((e) => (
                  <View key={e._id} style={styles.row}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.fr}>{tr(e.word)}</Text>
                      <Text style={styles.pronunciation}>{e.pronunciation}</Text>
                    </View>
                    <Text style={styles.ar}>{e.word.ar}</Text>
                  </View>
                ))}
              </View>
            ))
          )}
        </ScrollView>
      )}
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
  searchWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    backgroundColor: palette.white,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    ...shadows.sm,
  },
  searchInput: { flex: 1, color: palette.gray900, fontSize: 14 },
  tabsRow: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xs, gap: 6 },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  tabActive: { backgroundColor: palette.mediterraneanBlue, borderColor: palette.mediterraneanBlue },
  tabText: { color: palette.gray700, fontWeight: '600', fontSize: 12 },
  tabTextActive: { color: palette.white },
  list: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  empty: { textAlign: 'center', color: palette.gray500, marginTop: spacing.xl },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    color: palette.terracotta,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: 6,
    ...shadows.sm,
  },
  fr: { color: palette.gray900, fontSize: 15, fontWeight: '600' },
  pronunciation: { color: palette.gray500, fontSize: 12, fontStyle: 'italic', marginTop: 2 },
  ar: { color: palette.mediterraneanBlue, fontSize: 18, fontWeight: '700' },
});
