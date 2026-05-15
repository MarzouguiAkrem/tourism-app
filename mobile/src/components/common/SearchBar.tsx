import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, borderRadius } from '../../theme';

interface Props {
  value?: string;
  onChangeText?: (v: string) => void;
  onSubmit?: () => void;
  onFilter?: () => void;
  placeholder?: string;
  style?: ViewStyle;
  showFilter?: boolean;
}

export default function SearchBar({
  value,
  onChangeText,
  onSubmit,
  onFilter,
  placeholder,
  style,
  showFilter = true,
}: Props) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputBox}>
        <Ionicons name="search" size={20} color={palette.gray400} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmit}
          placeholder={placeholder}
          placeholderTextColor={palette.gray400}
          style={styles.input}
          returnKeyType="search"
        />
      </View>
      {showFilter && (
        <TouchableOpacity style={styles.filterBtn} onPress={onFilter} activeOpacity={0.85}>
          <Ionicons name="options-outline" size={20} color={palette.white} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  inputBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: palette.gray100,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: palette.gray900,
    height: '100%',
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: palette.mediterraneanBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
