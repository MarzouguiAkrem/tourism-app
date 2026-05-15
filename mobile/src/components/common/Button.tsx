import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing } from '../../theme';

type Variant = 'primary' | 'secondary' | 'outline';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  style,
  textStyle,
  fullWidth,
}: Props) {
  const isOutline = variant === 'outline';
  const isInactive = disabled || loading;

  const containerStyle = [
    styles.base,
    variant === 'primary' && styles.primary,
    variant === 'secondary' && styles.secondary,
    isOutline && styles.outline,
    isInactive && styles.disabled,
    fullWidth && styles.fullWidth,
    style,
  ];

  const labelColor = isOutline ? palette.mediterraneanBlue : palette.white;

  return (
    <TouchableOpacity
      style={containerStyle}
      onPress={onPress}
      disabled={isInactive}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={labelColor} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={labelColor} />}
          <Text
            style={[
              styles.label,
              { color: labelColor },
              isInactive && styles.disabledLabel,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: 100, // pill
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primary: { backgroundColor: palette.mediterraneanBlue },
  secondary: { backgroundColor: palette.terracotta },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: palette.mediterraneanBlue,
  },
  disabled: { opacity: 0.5 },
  fullWidth: { alignSelf: 'stretch' },
  label: { fontSize: 15, fontWeight: '700' },
  disabledLabel: { opacity: 0.7 },
});
