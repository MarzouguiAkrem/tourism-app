import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch } from '../../store/hooks';
import { setOnboarded } from '../../store/slices/authSlice';
import { palette } from '../../theme';
import { spacing, borderRadius } from '../../theme/spacing';

const { width } = Dimensions.get('window');

interface Slide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const slides: Slide[] = [
  {
    id: '1',
    icon: 'compass',
    title: 'Explorez la Tunisie',
    description:
      'D\u00e9couvrez les tr\u00e9sors cach\u00e9s de la Tunisie : des ruines de Carthage aux oasis du Sahara, en passant par les plages m\u00e9diterran\u00e9ennes.',
    color: palette.mediterraneanBlue,
  },
  {
    id: '2',
    icon: 'map',
    title: 'Planifiez votre voyage',
    description:
      'G\u00e9n\u00e9rez des itin\u00e9raires personnalis\u00e9s selon votre budget, vos centres d\'int\u00e9r\u00eat et la dur\u00e9e de votre s\u00e9jour.',
    color: palette.terracotta,
  },
  {
    id: '3',
    icon: 'globe',
    title: 'Vivez la culture',
    description:
      'Acc\u00e9dez \u00e0 un guide culturel complet, un convertisseur de devises et un lexique multilingue pour faciliter votre voyage.',
    color: palette.olive,
  },
];

export default function OnboardingScreen() {
  const dispatch = useAppDispatch();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      dispatch(setOnboarded());
    }
  };

  const handleSkip = () => {
    dispatch(setOnboarded());
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconCircle, { backgroundColor: item.color + '15' }]}>
        <Ionicons name={item.icon} size={64} color={item.color} />
      </View>
      <Text style={styles.slideTitle}>{item.title}</Text>
      <Text style={styles.slideDescription}>{item.description}</Text>
    </View>
  );

  const isLastSlide = currentIndex === slides.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Passer</Text>
        </TouchableOpacity>
      )}

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Bottom Section */}
      <View style={styles.bottom}>
        {/* Dots */}
        <View style={styles.dots}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                index === currentIndex && { backgroundColor: slides[currentIndex].color },
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: slides[currentIndex].color }]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {isLastSlide ? (
            <Text style={styles.buttonText}>Commencer</Text>
          ) : (
            <View style={styles.buttonContent}>
              <Text style={styles.buttonText}>Suivant</Text>
              <Ionicons name="arrow-forward" size={20} color={palette.white} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: palette.white,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: spacing.xl,
    zIndex: 10,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  skipText: {
    color: palette.gray500,
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing['3xl'],
  },
  iconCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  slideTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: palette.gray900,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  slideDescription: {
    fontSize: 15,
    color: palette.gray500,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.base,
  },
  bottom: {
    paddingHorizontal: spacing['2xl'],
    paddingBottom: spacing['2xl'],
    alignItems: 'center',
  },
  dots: {
    flexDirection: 'row',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: palette.gray300,
  },
  dotActive: {
    width: 24,
    borderRadius: 4,
  },
  button: {
    width: '100%',
    borderRadius: borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  buttonText: {
    color: palette.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
