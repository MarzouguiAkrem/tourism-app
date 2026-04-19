import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../theme';

interface Props {
  value: number;
  size?: number;
  editable?: boolean;
  onChange?: (value: number) => void;
}

export default function StarRating({ value, size = 18, editable = false, onChange }: Props) {
  const stars = [1, 2, 3, 4, 5];
  const Container = editable ? View : View;
  return (
    <Container style={styles.row}>
      {stars.map((n) => {
        const filled = n <= Math.round(value);
        const Icon = (
          <Ionicons
            name={filled ? 'star' : 'star-outline'}
            size={size}
            color={palette.gold}
          />
        );
        if (editable) {
          return (
            <TouchableOpacity
              key={n}
              onPress={() => onChange?.(n)}
              hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
            >
              {Icon}
            </TouchableOpacity>
          );
        }
        return <View key={n}>{Icon}</View>;
      })}
    </Container>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 2 },
});
