import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { palette, spacing } from '../../theme';
import { Review } from '../../types/review';
import StarRating from './StarRating';

interface Props {
  review: Review;
}

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleDateString();
  } catch {
    return '';
  }
};

export default function ReviewItem({ review }: Props) {
  const author = `${review.user?.firstName ?? ''} ${review.user?.lastName ?? ''}`.trim() || 'Anonyme';
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.author}>{author}</Text>
        <Text style={styles.date}>{formatDate(review.createdAt)}</Text>
      </View>
      <StarRating value={review.rating} size={14} />
      {!!review.title && <Text style={styles.title}>{review.title}</Text>}
      <Text style={styles.comment}>{review.comment}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.gray200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  author: { fontWeight: '700', color: palette.gray800, fontSize: 14 },
  date: { color: palette.gray400, fontSize: 12 },
  title: { fontWeight: '600', color: palette.gray800, marginTop: 4, fontSize: 14 },
  comment: { color: palette.gray700, marginTop: 2, lineHeight: 20, fontSize: 14 },
});
