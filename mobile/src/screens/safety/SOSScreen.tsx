import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { safetyService } from '../../services/safety.service';
import { EmergencyContact, EmergencyCategory } from '../../types/safety';
import { useLocalized } from '../../hooks/useLocalized';
import { useAppSelector } from '../../store/hooks';

const CATEGORY_ICON: Record<EmergencyCategory, keyof typeof Ionicons.glyphMap> = {
  police: 'shield',
  ambulance: 'medkit',
  fire: 'flame',
  'tourist-police': 'people',
  embassy: 'flag',
  hospital: 'business',
  other: 'call',
};

const CATEGORY_COLOR: Record<EmergencyCategory, string> = {
  police: palette.mediterraneanBlue,
  ambulance: palette.error,
  fire: palette.terracotta,
  'tourist-police': palette.olive,
  embassy: palette.gold,
  hospital: palette.info,
  other: palette.gray600,
};

export default function SOSScreen() {
  const { t } = useTranslation();
  const tr = useLocalized();
  const navigation = useNavigation<any>();
  const user = useAppSelector((s) => s.auth.user);

  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    safetyService
      .emergencyContacts(user?.nationality || undefined)
      .then(setContacts)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.nationality]);

  const call = (phone: string) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const shareLocation = async () => {
    try {
      setSharing(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('error'), t('locationPermissionDenied'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const payload = await safetyService.sosShare(pos.coords.longitude, pos.coords.latitude);
      await Share.share({
        message: `${payload.message}\n${payload.mapUrl}`,
        title: t('sosShareTitle'),
      });
    } catch (err: any) {
      Alert.alert(t('error'), err?.message || t('error'));
    } finally {
      setSharing(false);
    }
  };

  const grouped: Record<string, EmergencyContact[]> = {};
  contacts.forEach((c) => {
    if (!grouped[c.category]) grouped[c.category] = [];
    grouped[c.category].push(c);
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOS</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.list}>
        <TouchableOpacity
          style={styles.shareBtn}
          onPress={shareLocation}
          disabled={sharing}
          activeOpacity={0.85}
        >
          {sharing ? (
            <ActivityIndicator color={palette.white} />
          ) : (
            <>
              <Ionicons name="share-social" size={22} color={palette.white} />
              <View style={{ flex: 1 }}>
                <Text style={styles.shareBtnTitle}>{t('shareMyLocation')}</Text>
                <Text style={styles.shareBtnSubtitle}>{t('shareMyLocationSubtitle')}</Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>{t('emergencyNumbers')}</Text>

        {loading ? (
          <ActivityIndicator color={palette.mediterraneanBlue} style={{ marginTop: spacing.xl }} />
        ) : (
          Object.entries(grouped).map(([cat, list]) => (
            <View key={cat} style={styles.section}>
              <Text style={styles.categoryLabel}>
                {t(`emergencyCategories.${cat}` as any)}
              </Text>
              {list.map((c) => {
                const color = CATEGORY_COLOR[c.category];
                return (
                  <TouchableOpacity
                    key={c._id}
                    style={styles.contactCard}
                    onPress={() => call(c.phone)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.icon, { backgroundColor: color + '22' }]}>
                      <Ionicons
                        name={CATEGORY_ICON[c.category]}
                        size={22}
                        color={color}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName}>{tr(c.name)}</Text>
                      {c.address && <Text style={styles.contactAddress}>{c.address}</Text>}
                    </View>
                    <View style={styles.callBtn}>
                      <Ionicons name="call" size={18} color={palette.white} />
                      <Text style={styles.callBtnText}>{c.phone}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))
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
    paddingBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: palette.error,
  },
  headerTitle: { color: palette.white, fontSize: 24, fontWeight: '900', letterSpacing: 3 },
  list: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.terracotta,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    ...shadows.md,
  },
  shareBtnTitle: { color: palette.white, fontWeight: '700', fontSize: 16 },
  shareBtnSubtitle: { color: palette.sandLight, fontSize: 12, marginTop: 2 },
  sectionTitle: { ...typography.h4, color: palette.gray800, marginBottom: spacing.sm },
  section: { marginBottom: spacing.md },
  categoryLabel: {
    color: palette.gray600,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    letterSpacing: 0.5,
  },
  contactCard: {
    backgroundColor: palette.white,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: borderRadius.lg,
    marginBottom: 6,
    ...shadows.sm,
  },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  contactName: { color: palette.gray900, fontWeight: '700', fontSize: 14 },
  contactAddress: { color: palette.gray500, fontSize: 11, marginTop: 2 },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: palette.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  callBtnText: { color: palette.white, fontWeight: '700', fontSize: 12 },
});
