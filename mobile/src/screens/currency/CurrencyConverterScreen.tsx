import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { currencyService } from '../../services/currency.service';
import { ExchangeRates } from '../../types/currency';

const COMMON = ['TND', 'EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AED', 'MAD', 'DZD', 'EGP'];

export default function CurrencyConverterScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [from, setFrom] = useState('EUR');
  const [to, setTo] = useState('TND');
  const [amount, setAmount] = useState('100');
  const [converted, setConverted] = useState<number | null>(null);

  const fetchRates = useCallback(async () => {
    try {
      setLoading(rates === null);
      const r = await currencyService.rates();
      setRates(r);
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || err?.message || t('error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [rates, t]);

  useEffect(() => {
    fetchRates();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!rates) return;
    const a = parseFloat(amount.replace(',', '.'));
    if (!isFinite(a)) {
      setConverted(null);
      return;
    }
    const fromRate = from === rates.base ? 1 : rates.rates[from];
    const toRate = to === rates.base ? 1 : rates.rates[to];
    if (!fromRate || !toRate) {
      setConverted(null);
      return;
    }
    const inBase = a / fromRate;
    setConverted(inBase * toRate);
  }, [rates, from, to, amount]);

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  const available = rates ? [rates.base, ...Object.keys(rates.rates).filter((k) => k !== rates.base)] : COMMON;
  const pickList = COMMON.filter((c) => available.includes(c));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('currencyConverter')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchRates();
            }}
            tintColor={palette.mediterraneanBlue}
          />
        }
      >
        {loading && !rates ? (
          <ActivityIndicator color={palette.mediterraneanBlue} style={{ marginTop: spacing['2xl'] }} />
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.label}>{t('amount')}</Text>
              <TextInput
                style={styles.bigInput}
                keyboardType="numeric"
                value={amount}
                onChangeText={setAmount}
                placeholder="0"
                placeholderTextColor={palette.gray300}
              />

              <View style={styles.pickRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('from')}</Text>
                  <CurrencyPicker value={from} options={pickList} onChange={setFrom} />
                </View>
                <TouchableOpacity style={styles.swap} onPress={swap}>
                  <Ionicons name="swap-horizontal" size={22} color={palette.mediterraneanBlue} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{t('to')}</Text>
                  <CurrencyPicker value={to} options={pickList} onChange={setTo} />
                </View>
              </View>

              <View style={styles.resultBox}>
                <Text style={styles.resultLabel}>
                  {amount || '0'} {from} =
                </Text>
                <Text style={styles.resultValue}>
                  {converted !== null ? converted.toFixed(2) : '—'} {to}
                </Text>
                {rates && (
                  <Text style={styles.rateLine}>
                    1 {from} ={' '}
                    {(rates.rates[to] / (from === rates.base ? 1 : rates.rates[from])).toFixed(4)}{' '}
                    {to}
                  </Text>
                )}
              </View>
            </View>

            {rates && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  {t('lastUpdate')} : {new Date(rates.fetchedAt).toLocaleString()}
                </Text>
                <Text style={styles.footerText}>
                  {t('source')} : {rates.provider}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const CurrencyPicker = ({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerScroll}>
    <View style={styles.pickerRow}>
      {options.map((c) => (
        <TouchableOpacity
          key={c}
          onPress={() => onChange(c)}
          style={[styles.pickerChip, value === c && styles.pickerChipActive]}
        >
          <Text
            style={[styles.pickerChipText, value === c && styles.pickerChipTextActive]}
          >
            {c}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
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
  headerTitle: { ...typography.h4, color: palette.gray900 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  card: { backgroundColor: palette.white, borderRadius: borderRadius.lg, padding: spacing.lg, ...shadows.sm },
  label: { color: palette.gray500, fontSize: 12, fontWeight: '600', marginBottom: spacing.xs, textTransform: 'uppercase', letterSpacing: 0.5 },
  bigInput: {
    fontSize: 32,
    fontWeight: '700',
    color: palette.gray900,
    borderBottomWidth: 1,
    borderBottomColor: palette.gray200,
    paddingBottom: spacing.sm,
    marginBottom: spacing.lg,
  },
  pickRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  swap: { padding: spacing.sm, alignSelf: 'flex-end', marginBottom: 4 },
  pickerScroll: { },
  pickerRow: { flexDirection: 'row', gap: 6 },
  pickerChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: palette.gray100,
  },
  pickerChipActive: { backgroundColor: palette.mediterraneanBlue },
  pickerChipText: { color: palette.gray700, fontWeight: '600' },
  pickerChipTextActive: { color: palette.white },
  resultBox: {
    backgroundColor: palette.sandLight,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  resultLabel: { color: palette.gray600, fontSize: 14 },
  resultValue: { fontSize: 28, fontWeight: '700', color: palette.olive, marginVertical: spacing.xs },
  rateLine: { color: palette.gray500, fontSize: 12 },
  footer: { marginTop: spacing.lg, alignItems: 'center' },
  footerText: { color: palette.gray500, fontSize: 12 },
});
