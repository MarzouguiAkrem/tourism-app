import React from 'react';
import { TouchableOpacity, StyleSheet, StyleProp, ViewStyle, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { palette, shadows } from '../../theme';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { toggleFavorite } from '../../store/slices/favoritesSlice';

interface Props {
  placeId: string;
  size?: number;
  variant?: 'overlay' | 'inline';
  style?: StyleProp<ViewStyle>;
}

export default function FavoriteButton({
  placeId,
  size = 22,
  variant = 'overlay',
  style,
}: Props) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const favorited = useAppSelector((s) => s.favorites.ids.includes(placeId));

  const onPress = () => {
    if (!isAuthenticated) {
      Alert.alert(t('login'), 'Connectez-vous pour ajouter aux favoris');
      return;
    }
    dispatch(toggleFavorite(placeId));
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={[
        variant === 'overlay' ? styles.overlay : styles.inline,
        style,
      ]}
    >
      <Ionicons
        name={favorited ? 'heart' : 'heart-outline'}
        size={size}
        color={favorited ? palette.error : variant === 'overlay' ? palette.gray700 : palette.gray500}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  overlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  inline: {
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
