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
import { useAppSelector } from '../../store/hooks';

const { width: SCREEN_W } = Dimensions.get('window');

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
  const [galleryIndex, setGalleryIndex] = useState(0);
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
    // Optimistic local update of average — backend recalcs on its side
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

  const images = (place.images?.length ? place.images : [place.coverImage]).filter(Boolean) as string[];
  const gallery = images.length > 0 ? images : [null];

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

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Gallery */}
        <View style={styles.galleryWrap}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) =>
              setGalleryIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_W))
            }
          >
            {gallery.map((img, idx) => (
              <Image
                key={idx}
                source={{ uri: resolveImageUrl(img) }}
                style={styles.galleryImage}
              />
            ))}
          </ScrollView>
          {gallery.length > 1 && (
            <View style={styles.dots}>
              {gallery.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i === galleryIndex && styles.dotActive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Floating buttons */}
          <TouchableOpacity style={[styles.floatingBtn, { left: spacing.base }]} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={22} color={palette.gray900} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.floatingBtn, { right: spacing.base + 50 }]} onPress={onShare}>
            <Ionicons name="share-outline" size={22} color={palette.gray900} />
          </TouchableOpacity>
          <FavoriteButton
            placeId={place._id}
            size={24}
            style={[styles.floatingBtn, { right: spacing.base }]}
          />
        </View>

        {/* Header info */}
        <View style={styles.section}>
          <Text style={styles.title}>{tr(place.name)}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="star" size={16} color={palette.gold} />
              <Text style={styles.metaStrong}>
                {place.rating?.average?.toFixed(1) || '0.0'}
              </Text>
              <Text style={styles.metaMuted}>
                ({place.rating?.count || 0} {t('reviews').toLowerCase()})
              </Text>
            </View>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.metaMuted}>{place.region}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.priceTag}>{PRICE_LABEL[place.priceLevel]}</Text>
          </View>
          {!!place.address && (
            <View style={[styles.metaRow, { marginTop: spacing.xs }]}>
              <Ionicons name="location-outline" size={16} color={palette.gray500} />
              <Text style={styles.metaMuted}>{place.address}</Text>
            </View>
          )}
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          <ActionButton icon="map" label={t('getDirections')} onPress={openMaps} primary />
        </View>

        {/* Description */}
        {!!place.description && tr(place.description).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('description')}</Text>
            <Text style={styles.body}>{tr(place.description)}</Text>
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

        {/* Price */}
        {place.priceRange && (place.priceRange.min || place.priceRange.max) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('entryFee')}</Text>
            <Text style={styles.body}>
              {place.priceRange.min ?? '?'} – {place.priceRange.max ?? '?'}{' '}
              {place.priceRange.currency || 'TND'}
            </Text>
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

      <ReviewFormModal
        visible={reviewModal}
        placeId={place._id}
        onClose={() => setReviewModal(false)}
        onCreated={handleReviewCreated}
      />
    </View>
  );
}

function ActionButton({
  icon,
  label,
  onPress,
  primary,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  primary?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.actionBtn, primary && styles.actionBtnPrimary]}
      activeOpacity={0.85}
    >
      <Ionicons name={icon} size={18} color={primary ? palette.white : palette.mediterraneanBlue} />
      <Text style={[styles.actionLabel, primary && styles.actionLabelPrimary]}>{label}</Text>
    </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: palette.gray50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  errorText: { color: palette.error, fontSize: 14 },
  galleryWrap: { width: SCREEN_W, height: 280, backgroundColor: palette.gray200 },
  galleryImage: { width: SCREEN_W, height: 280 },
  dots: {
    position: 'absolute',
    bottom: spacing.md,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.6)' },
  dotActive: { backgroundColor: palette.white, width: 16 },
  floatingBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  section: {
    backgroundColor: palette.white,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    marginTop: spacing.sm,
  },
  title: { fontSize: 22, fontWeight: '700', color: palette.gray900, marginBottom: spacing.sm },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaStrong: { fontSize: 14, fontWeight: '600', color: palette.gray800 },
  metaMuted: { fontSize: 13, color: palette.gray500, textTransform: 'capitalize' },
  metaDot: { color: palette.gray400, marginHorizontal: 2 },
  priceTag: { fontSize: 14, fontWeight: '700', color: palette.olive },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    backgroundColor: palette.white,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
    backgroundColor: palette.gray100,
    gap: 6,
  },
  actionBtnPrimary: { backgroundColor: palette.mediterraneanBlue },
  actionLabel: { color: palette.mediterraneanBlue, fontWeight: '600', fontSize: 13 },
  actionLabelPrimary: { color: palette.white },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: palette.gray900, marginBottom: spacing.sm },
  body: { fontSize: 14, color: palette.gray700, lineHeight: 22 },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  hourDay: { fontSize: 14, fontWeight: '600', color: palette.gray800 },
  hourValue: { fontSize: 14, color: palette.gray600 },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  contactText: { fontSize: 14, color: palette.gray800 },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  writeReviewLink: { color: palette.mediterraneanBlue, fontWeight: '600', fontSize: 13 },
});
