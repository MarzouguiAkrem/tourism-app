import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { palette, spacing, borderRadius, shadows, typography } from '../../theme';
import { feedbackService } from '../../services/feedback.service';
import { FeedbackCategory } from '../../types/feedback';

const CATEGORIES: { key: FeedbackCategory; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'general', icon: 'chatbubble-ellipses' },
  { key: 'praise', icon: 'heart' },
  { key: 'bug', icon: 'bug' },
  { key: 'feature', icon: 'bulb' },
  { key: 'improvement', icon: 'trending-up' },
];

export default function FeedbackScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const [rating, setRating] = useState(0);
  const [category, setCategory] = useState<FeedbackCategory>('general');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (rating < 1) {
      Alert.alert(t('error'), t('feedbackRatingRequired'));
      return;
    }
    try {
      setSubmitting(true);
      await feedbackService.submit({
        rating,
        comment: comment.trim() || undefined,
        category,
        platform: Platform.OS === 'web' ? 'web' : Platform.OS === 'ios' ? 'ios' : 'android',
      });
      Alert.alert(t('saved'), t('feedbackThanks'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert(t('error'), err?.response?.data?.message || t('error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={palette.gray700} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('rateTheApp')}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>{t('feedbackIntro')}</Text>

        {/* Stars */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setRating(n)}
              activeOpacity={0.7}
              hitSlop={6}
            >
              <Ionicons
                name={n <= rating ? 'star' : 'star-outline'}
                size={42}
                color={n <= rating ? palette.gold : palette.gray300}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>{t(`ratingLabels.${rating}`)}</Text>
        )}

        {/* Category */}
        <Text style={styles.sectionTitle}>{t('feedbackCategory')}</Text>
        <View style={styles.chipsGrid}>
          {CATEGORIES.map((c) => {
            const active = category === c.key;
            return (
              <TouchableOpacity
                key={c.key}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => setCategory(c.key)}
                activeOpacity={0.85}
              >
                <Ionicons
                  name={c.icon}
                  size={14}
                  color={active ? palette.white : palette.gray600}
                />
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {t(`feedbackCategories.${c.key}`)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Comment */}
        <Text style={styles.sectionTitle}>{t('feedbackCommentLabel')}</Text>
        <TextInput
          style={styles.textarea}
          value={comment}
          onChangeText={setComment}
          placeholder={t('feedbackCommentPlaceholder')}
          placeholderTextColor={palette.gray400}
          multiline
          numberOfLines={6}
          maxLength={2000}
          textAlignVertical="top"
        />
        <Text style={styles.counter}>{comment.length} / 2000</Text>

        <TouchableOpacity
          style={[styles.submitBtn, (submitting || rating === 0) && styles.submitBtnDisabled]}
          onPress={submit}
          disabled={submitting || rating === 0}
        >
          {submitting ? (
            <ActivityIndicator color={palette.white} />
          ) : (
            <>
              <Ionicons name="send" size={18} color={palette.white} />
              <Text style={styles.submitText}>{t('send')}</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: palette.gray50 },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing['2xl'],
    paddingBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { ...typography.h3, color: palette.gray900 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  intro: { color: palette.gray600, fontSize: 14, marginBottom: spacing.lg, lineHeight: 20 },
  starsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  ratingLabel: {
    textAlign: 'center',
    color: palette.gray700,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    color: palette.gray600,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: palette.white,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  chipActive: { backgroundColor: palette.mediterraneanBlue, borderColor: palette.mediterraneanBlue },
  chipText: { color: palette.gray700, fontWeight: '600', fontSize: 13 },
  chipTextActive: { color: palette.white },
  textarea: {
    minHeight: 120,
    backgroundColor: palette.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: 14,
    color: palette.gray900,
    borderWidth: 1,
    borderColor: palette.gray200,
  },
  counter: { color: palette.gray400, fontSize: 11, textAlign: 'right', marginTop: 4 },
  submitBtn: {
    marginTop: spacing.lg,
    backgroundColor: palette.mediterraneanBlue,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.md,
  },
  submitBtnDisabled: { opacity: 0.5 },
  submitText: { color: palette.white, fontWeight: '700', fontSize: 16 },
});
