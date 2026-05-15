import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, borderRadius } from '../../theme';
import { Category } from '../../types/place';
import { useLocalized } from '../../hooks/useLocalized';

interface Props {
  category: Category;
  onPress?: () => void;
  style?: ViewStyle;
}

export default function CategoryCircle({ category, onPress, style }: Props) {
  const tr = useLocalized();
  const color = category.color || palette.mediterraneanBlue;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.wrap, style]}
    >
      <View style={[styles.circle, { backgroundColor: `${color}20` }]}>
        <Ionicons
          name={(category.icon as keyof typeof Ionicons.glyphMap) || 'location'}
          size={28}
          color={color}
        />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {tr(category.name)}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginRight: spacing.base, width: 76 },
  circle: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
