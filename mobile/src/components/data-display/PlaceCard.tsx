import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, spacing, borderRadius, shadows } from '../../theme';
import { Place } from '../../types/place';
import { useLocalized } from '../../hooks/useLocalized';
import { resolveImageUrl } from '../../utils/imageUrl';
import FavoriteButton from './FavoriteButton';

const SCREEN_W = Dimensions.get('window').width;

interface Props {
  place: Place;
  onPress?: () => void;
  /** "compact" → 70% width horizontal card (default for carousels), "wide" → full-width row */
  variant?: 'compact' | 'wide';
  style?: ViewStyle;
}

export default function PlaceCard({ place, onPress, variant = 'compact', style }: Props) {
  const tr = useLocalized();
  const image = resolveImageUrl(place.coverImage || place.images?.[0]);

  if (variant === 'wide') {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={[styles.wide, style]}
      >
        <View style={styles.wideImageWrap}>
          <Image source={{ uri: image }} style={styles.wideImage} />
        </View>
        <View style={styles.wideInfo}>
          <Text style={styles.wideName} numberOfLines={1}>
            {tr(place.name)}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color={palette.mediterraneanBlue} />
            <Text style={styles.location} numberOfLines={1}>
              {place.region}
            </Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color={palette.gray400} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, style]}
    >
      <View style={styles.imageWrap}>
        <Image source={{ uri: image }} style={styles.image} />

        {/* Rating pill — top-right overlay */}
        <View style={styles.ratingOverlay}>
          <Ionicons name="star" size={12} color={palette.gold} />
          <Text style={styles.ratingText}>
            {place.rating?.average?.toFixed(1) ?? '0.0'}
          </Text>
        </View>

        {/* Favorite heart — top-left overlay */}
        <FavoriteButton placeId={place._id} style={styles.favOverlay} size={18} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>
          {tr(place.name)}
        </Text>
        <View style={styles.locationRow}>
          <Ionicons name="location" size={12} color={palette.mediterraneanBlue} />
          <Text style={styles.location} numberOfLines={1}>
            {place.region}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  // ── compact (carousel card) ────────────────────────────
  card: {
    width: SCREEN_W * 0.7,
    backgroundColor: palette.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: spacing.base,
    ...shadows.sm,
  },
  imageWrap: {
    width: '100%',
    height: 160,
    backgroundColor: palette.gray200,
    position: 'relative',
  },
  image: { width: '100%', height: '100%' },
  ratingOverlay: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: palette.gray900 },
  favOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
  },
  info: { padding: spacing.md },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: palette.gray900,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 12,
    color: palette.gray500,
    textTransform: 'capitalize',
  },

  // ── wide (list row) ────────────────────────────────────
  wide: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: palette.white,
    borderRadius: 16,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    ...shadows.sm,
  },
  wideImageWrap: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: palette.gray200,
    marginRight: spacing.md,
  },
  wideImage: { width: '100%', height: '100%' },
  wideInfo: { flex: 1 },
  wideName: {
    fontSize: 15,
    fontWeight: '700',
    color: palette.gray900,
    marginBottom: 4,
  },
});
