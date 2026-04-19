import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, borderRadius, shadows } from '../../theme';
import { Place } from '../../types/place';
import { useLocalized } from '../../hooks/useLocalized';
import { resolveImageUrl } from '../../utils/imageUrl';
import FavoriteButton from './FavoriteButton';

const PRICE_LABEL: Record<string, string> = {
  budget: '$',
  moderate: '$$',
  luxury: '$$$',
};

interface Props {
  place: Place;
  onPress?: () => void;
  variant?: 'default' | 'compact';
  style?: ViewStyle;
}

export default function PlaceCard({ place, onPress, variant = 'default', style }: Props) {
  const tr = useLocalized();
  const image = resolveImageUrl(place.coverImage || place.images?.[0]);
  const isCompact = variant === 'compact';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, isCompact && styles.cardCompact, style]}
    >
      <View>
        <Image
          source={{ uri: image }}
          style={[styles.image, isCompact && styles.imageCompact]}
        />
        <FavoriteButton placeId={place._id} style={styles.favBtn} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {tr(place.name)}
        </Text>
        {!isCompact && place.shortDescription && (
          <Text style={styles.subtitle} numberOfLines={2}>
            {tr(place.shortDescription)}
          </Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={palette.gold} />
            <Text style={styles.metaText}>
              {place.rating?.average?.toFixed(1) ?? '0.0'}
              {place.rating?.count > 0 && (
                <Text style={styles.metaMuted}> ({place.rating.count})</Text>
              )}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} color={palette.gray500} />
            <Text style={styles.metaMuted} numberOfLines={1}>
              {place.region}
            </Text>
          </View>
          <Text style={styles.priceTag}>{PRICE_LABEL[place.priceLevel] || ''}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.sm,
  },
  cardCompact: {
    width: 220,
  },
  image: {
    width: '100%',
    height: 160,
    backgroundColor: palette.gray200,
  },
  imageCompact: {
    height: 130,
  },
  favBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  body: {
    padding: spacing.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.gray900,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: palette.gray500,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: palette.gray700,
    fontWeight: '600',
  },
  metaMuted: {
    fontSize: 12,
    color: palette.gray500,
    textTransform: 'capitalize',
  },
  priceTag: {
    marginLeft: 'auto',
    fontSize: 13,
    fontWeight: '700',
    color: palette.olive,
  },
});
