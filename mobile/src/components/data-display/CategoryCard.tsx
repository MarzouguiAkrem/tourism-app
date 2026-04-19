import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, borderRadius, shadows } from '../../theme';
import { Category } from '../../types/place';
import { useLocalized } from '../../hooks/useLocalized';

interface Props {
  category: Category;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function CategoryCard({ category, onPress, style }: Props) {
  const tr = useLocalized();
  const color = category.color || palette.mediterraneanBlue;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, style]}
    >
      <View style={[styles.iconWrap, { backgroundColor: `${color}20` }]}>
        <Ionicons name={(category.icon as any) || 'location'} size={26} color={color} />
      </View>
      <Text style={styles.label} numberOfLines={2}>
        {tr(category.name)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 96,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    ...shadows.sm,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: palette.gray800,
    textAlign: 'center',
  },
});
