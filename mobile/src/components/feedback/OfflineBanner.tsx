import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { palette, spacing } from '../../theme';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';

export default function OfflineBanner() {
  const { t } = useTranslation();
  const online = useNetworkStatus();
  if (online) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" size={14} color={palette.white} />
      <Text style={styles.text}>{t('offlineWarning')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: palette.warning,
    paddingVertical: 4,
    paddingHorizontal: spacing.md,
  },
  text: { color: palette.white, fontSize: 12, fontWeight: '600' },
});
