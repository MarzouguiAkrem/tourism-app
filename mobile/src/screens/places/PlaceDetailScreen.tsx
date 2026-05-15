import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Share,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { palette, spacing, borderRadius, shadows } from '../../theme';
import { Place } from '../../types/place';
import { Review } from '../../types/review';
import { placesService } from '../../services/places.service';
import { reviewsService } from '../../services/reviews.service';
import { useLocalized } from '../../hooks/useLocalized';
import { resolveImageUrl } from '../../utils/imageUrl';
import { HomeScreenProps } from '../../types/navigation';
import FavoriteButton from '../../components/data-display/FavoriteButton';
import ReviewItem from '../../components/data-display/ReviewItem';
import ReviewFormModal from '../../components/feedback/ReviewFormModal';
import Button from '../../components/common/Button';
import { useAppSelector } from '../../store/hooks';

const { width: SCREEN_W } = Dimensions.get('window');
const HERO_HEIGHT = 300;

const DAY_LABELS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
const PRICE_LABEL: Record<string, string> = {
  budget: '$',
  moderate: '$$',
  luxury: '$$$',
};

export default function PlaceDetailScreen({
  route,
  navigation,
}: HomeScreenProps<'PlaceDetail'>) {
  const { placeId } = route.params;
  const { t } = useTranslation();
  const tr = useLocalized();

  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviewModal, setReviewModal] = useState(false);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all([
      placesService.getOne(placeId),
      reviewsService.listByPlace(placeId, 1, 5),
    ])
      .then(([p, r]) => {
        if (!active) return;
        setPlace(p);
        setReviews(r.data);
        setReviewsCount(r.pagination.totalResults);
      })
      .catch((e) => active && setError(e?.message || t('error')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [placeId, t]);

  const handleReviewCreated = (review: Review) => {
    setReviews((prev) => [review, ...prev]);
    setReviewsCount((c) => c + 1);
    if (place) {
      const newCount = (place.rating?.count || 0) + 1;
      const newAvg =
        ((place.rating?.average || 0) * (place.rating?.count || 0) + review.rating) / newCount;
      setPlace({ ...place, rating: { average: Math.round(newAvg * 10) / 10, count: newCount } });
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={palette.mediterraneanBlue} />
      </View>
    );
  }
  if (error || !place) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={32} color={palette.error} />
        <Text style={styles.errorText}>{error || t('error')}</Text>
      </View>
    );
  }

  const hero = resolveImageUrl(place.coverImage || place.images?.[0]);
  const galleryImages = (place.images || []).filter((x) => x && x !== place.coverImage);

  const openMaps = () => {
    const [lng, lat] = place.location.coordinates;
    const label = encodeURIComponent(tr(place.name));
    const url = Platform.select({
      ios: `maps:0,0?q=${label}@${lat},${lng}`,
      android: `geo:0,0?q=${lat},${lng}(${label})`,
      default: `https://www.google.com/maps?q=${lat},${lng}`,
    });
    Linking.openURL(url!);
  };

  const onShare = () =>
    Share.share({
      title: tr(place.name),
      message: `${tr(place.name)} — ${tr(place.shortDescription)}`,
    });

  const priceText =
    place.priceRange && (place.priceRange.min || place.priceRange.max)
      ? `${place.priceRange.min ?? '?'}–${place.priceRange.max ?? '?'} ${place.priceRange.currency || 'TND'}`
      : t('free');

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Hero image with overlays */}
        <View style={styles.hero}>
          <Image source={{ uri: hero }} style={styles.heroImage} />

          {/* Top-left back button */}
          <TouchableOpacity
            style={[styles.floatingBtn, styles.topLeft]}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={22} color={palette.gray900} />
          </TouchableOpacity>

          {/* Top-right share + favorite */}
          <View style={styles.topRightStack}>
            <TouchableOpacity style={styles.floatingBtn} onPress={onShare}>
              <Ionicons name="share-outline" size={22} color={palette.gray900} />
            </TouchableOpacity>
            <FavoriteButton placeId={place._id} size={22} style={styles.floatingBtn} />
          </View>

          {/* Rating overlay */}
          <View style={styles.ratingOverlay}>
            <Ionicons name="star" size={16} color={palette.gold} fill={palette.gold as any} />
            <Text style={styles.ratingText}>
              {place.rating?.average?.toFixed(1) || '0.0'}
            </Text>
          </View>
        </View>

        {/* Title + location */}
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{tr(place.name)}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={16} color={palette.mediterraneanBlue} />
            <Text style={styles.locationText}>{place.region}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.priceTag}>{PRICE_LABEL[place.priceLevel]}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaMuted}>
              ({place.rating?.count || 0} {t('reviews').toLowerCase()})
            </Text>
          </View>
          {!!place.address && (
            <View style={[styles.locationRow, { marginTop: spacing.xs }]}>
              <Ionicons name="map-outline" size={14} color={palette.gray500} />
              <Text style={styles.metaMuted}>{place.address}</Text>
            </View>
          )}
        </View>

        {/* Description */}
        {!!place.description && tr(place.description).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('description')}</Text>
            <Text style={styles.body}>{tr(place.description)}</Text>
          </View>
        )}

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <View style={[styles.section, { paddingRight: 0 }]}>
            <Text style={styles.sectionTitle}>Galerie</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {galleryImages.map((img, i) => (
                <Image
                  key={i}
                  source={{ uri: resolveImageUrl(img) }}
                  style={styles.galleryImage}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* Opening hours */}
        {place.openingHours && place.openingHours.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('openingHours')}</Text>
            {place.openingHours.map((h) => (
              <View key={h.day} style={styles.hourRow}>
                <Text style={styles.hourDay}>{DAY_LABELS[h.day]}</Text>
                <Text style={styles.hourValue}>
                  {h.closed ? '—' : `${h.open} – ${h.close}`}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Reviews */}
        <View style={styles.section}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>
              {t('reviews')} ({reviewsCount})
            </Text>
            {isAuthenticated && (
              <TouchableOpacity onPress={() => setReviewModal(true)}>
                <Text style={styles.writeReviewLink}>{t('writeReview')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {reviews.length === 0 ? (
            <Text style={styles.body}>Aucun avis pour le moment.</Text>
          ) : (
            reviews.map((r) => <ReviewItem key={r._id} review={r} />)
          )}
        </View>

        {/* Contact */}
        {place.contact && (place.contact.phone || place.contact.email || place.contact.website) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact</Text>
            {!!place.contact.phone && (
              <ContactRow
                icon="call-outline"
                label={place.contact.phone}
                onPress={() => Linking.openURL(`tel:${place.contact!.phone}`)}
              />
            )}
            {!!place.contact.email && (
              <ContactRow
                icon="mail-outline"
                label={place.contact.email}
                onPress={() => Linking.openURL(`mailto:${place.contact!.email}`)}
              />
            )}
            {!!place.contact.website && (
              <ContactRow
                icon="globe-outline"
                label={place.contact.website}
                onPress={() => Linking.openURL(place.contact!.website!)}
              />
            )}
          </View>
        )}
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.priceLabel}>{t('entryFee')}</Text>
          <Text style={styles.priceValue}>{priceText}</Text>
        </View>
        <Button
          title={t('getDirections')}
          icon="navigate"
          onPress={openMaps}
          style={styles.directionsBtn}
        />
      </View>

      <ReviewFormModal
        visible={reviewModal}
        placeId={place._id}
        onClose={() => setReviewModal(false)}
        onCreated={handleReviewCreated}
      />
    </View>
  );
}

function ContactRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.contactRow} onPress={onPress}>
      <Ionicons name={icon} size={18} color={palette.mediterraneanBlue} />
      <Text style={styles.contactText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  errorText: { color: palette.error, fontSize: 14 },

  // ── Hero ───────────────────────────────────────────────
  hero: {
    width: SCREEN_W,
    height: HERO_HEIGHT,
    backgroundColor: palette.gray200,
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%' },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  topLeft: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 24,
    left: spacing.base,
  },
  topRightStack: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 24,
    right: spacing.base,
    gap: spacing.sm,
  },
  ratingOverlay: {
    position: 'absolute',
    bottom: spacing.base,
    right: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ratingText: { fontSize: 14, fontWeight: '700', color: palette.gray900 },

  // ── Title block ────────────────────────────────────────
  titleBlock: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.base,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: palette.gray900,
    marginBottom: spacing.sm,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  locationText: {
    fontSize: 14,
    color: palette.gray700,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  metaDot: { color: palette.gray400, marginHorizontal: 2 },
  metaMuted: { fontSize: 13, color: palette.gray500 },
  priceTag: { fontSize: 14, fontWeight: '700', color: palette.olive },

  // ── Sections ───────────────────────────────────────────
  section: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.gray900,
    marginBottom: spacing.sm,
  },
  body: { fontSize: 14, color: palette.gray600, lineHeight: 22 },
  galleryImage: {
    width: SCREEN_W / 3 - 16,
    height: 100,
    borderRadius: 12,
    marginRight: spacing.sm,
    backgroundColor: palette.gray200,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  hourDay: { fontSize: 14, fontWeight: '600', color: palette.gray800 },
  hourValue: { fontSize: 14, color: palette.gray600 },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  writeReviewLink: { color: palette.mediterraneanBlue, fontWeight: '600', fontSize: 13 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  contactText: { fontSize: 14, color: palette.gray800 },

  // ── Sticky footer ──────────────────────────────────────
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 28 : spacing.md,
    backgroundColor: palette.white,
    borderTopWidth: 1,
    borderTopColor: palette.gray100,
  },
  priceLabel: { fontSize: 12, color: palette.gray500 },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: palette.gray900,
    marginTop: 2,
  },
  directionsBtn: { paddingHorizontal: spacing.xl, paddingVertical: 14 },
});
