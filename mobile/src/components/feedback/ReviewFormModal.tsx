import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { palette, spacing, borderRadius } from '../../theme';
import StarRating from '../data-display/StarRating';
import { reviewsService } from '../../services/reviews.service';
import { Review } from '../../types/review';

interface Props {
  visible: boolean;
  placeId: string;
  onClose: () => void;
  onCreated?: (review: Review) => void;
}

export default function ReviewFormModal({ visible, placeId, onClose, onCreated }: Props) {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRating(5);
    setComment('');
    setError(null);
    setSubmitting(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (comment.trim().length < 3) {
      setError('Commentaire trop court (min 3 caractères)');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const review = await reviewsService.create(placeId, {
        rating,
        comment: comment.trim(),
      });
      onCreated?.(review);
      reset();
      onClose();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('writeReview')}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={22} color={palette.gray700} />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>{t('rating')}</Text>
          <View style={styles.starsWrap}>
            <StarRating value={rating} size={32} editable onChange={setRating} />
          </View>

          <Text style={styles.label}>{t('description')}</Text>
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Votre expérience..."
            placeholderTextColor={palette.gray400}
            multiline
            numberOfLines={4}
            maxLength={2000}
          />

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color={palette.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submit, submitting && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={palette.white} />
            ) : (
              <Text style={styles.submitText}>{t('save')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: palette.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.xl,
    gap: spacing.sm,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 18, fontWeight: '700', color: palette.gray900 },
  label: { fontSize: 13, color: palette.gray600, marginTop: spacing.sm, fontWeight: '600' },
  starsWrap: { alignItems: 'center', paddingVertical: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: palette.gray200,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    minHeight: 100,
    fontSize: 14,
    color: palette.gray900,
    textAlignVertical: 'top',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: palette.errorLight,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  errorText: { color: palette.error, fontSize: 13, flex: 1 },
  submit: {
    backgroundColor: palette.mediterraneanBlue,
    padding: 14,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  submitText: { color: palette.white, fontWeight: '700', fontSize: 15 },
});
