import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows } from '../../theme';
import { currencyService } from '../../services/currency.service';
import { ExchangeRates } from '../../types/currency';

const QUICK = ['EUR', 'USD', 'GBP'] as const;

interface Props {
  onPress?: () => void;
}

export default function CurrencyWidget({ onPress }: Props) {
  const { t } = useTranslation();
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    currencyService
      .rates()
      .then((r) => mounted && setRates(r))
      .catch(() => {})
      .finally(() => mounted && setLoaded(true));
    return () => {
      mounted = false;
    };
  }, []);

  if (!loaded) return null;

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.headerRow}>
        <View style={styles.headerLeft}>
          <Ionicons name="trending-up" size={18} color={palette.gold} />
          <Text style={styles.title}>{t('exchangeRates')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={palette.gray400} />
      </View>
      <View style={styles.row}>
        {QUICK.map((c) => {
          const r = rates?.rates?.[c];
          const tnd = r ? 1 / r : null;
          return (
            <View key={c} style={styles.pill}>
              <Text style={styles.pillCode}>1 {c}</Text>
              <Text style={styles.pillValue}>
                {tnd ? `${tnd.toFixed(2)}` : '—'}
                <Text style={styles.pillUnit}> TND</Text>
              </Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { color: palette.gray800, fontWeight: '700', fontSize: 14 },
  row: { flexDirection: 'row', gap: spacing.sm },
  pill: {
    flex: 1,
    backgroundColor: palette.sandLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  pillCode: { color: palette.gray500, fontSize: 11, fontWeight: '600' },
  pillValue: { color: palette.gray900, fontWeight: '700', fontSize: 14 },
  pillUnit: { color: palette.gray400, fontWeight: '500', fontSize: 11 },
});
