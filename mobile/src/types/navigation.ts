import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Home Stack
export type HomeStackParamList = {
  HomeMain: undefined;
  PlaceDetail: { placeId: string };
  PlacesByCategory: { categoryId: string; categoryName: string };
  CurrencyConverter: undefined;
  CulturalGuide: undefined;
  SafetyTips: undefined;
  SOS: undefined;
  Phrasebook: undefined;
  Prices: undefined;
  Heritage: undefined;
};

// Explore Stack
export type ExploreStackParamList = {
  ExploreMain: undefined;
  PlaceDetail: { placeId: string };
};

// Itinerary Stack
export type ItineraryStackParamList = {
  MyItineraries: undefined;
  ItineraryPlanner: undefined;
  ItineraryResult: { itineraryId: string };
};

// Favorites Stack
export type FavoritesStackParamList = {
  FavoritesList: undefined;
  PlaceDetail: { placeId: string };
};

// Profile Stack
export type ProfileStackParamList = {
  ProfileMain: undefined;
  EditProfile: undefined;
  Settings: undefined;
  Feedback: undefined;
};

// Admin Stack
export type AdminStackParamList = {
  AdminDashboard: undefined;
  RecommendationConfig: undefined;
  AdminUsers: undefined;
  AdminUserForm: { userId?: string };
  AdminAlerts: undefined;
  AdminAlertForm: { alertId?: string };
  AdminFeedbackList: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: NavigatorScreenParams<HomeStackParamList>;
  Explore: NavigatorScreenParams<ExploreStackParamList>;
  Itinerary: NavigatorScreenParams<ItineraryStackParamList>;
  Favorites: NavigatorScreenParams<FavoritesStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Root Stack
export type RootStackParamList = {
  Onboarding: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Admin: NavigatorScreenParams<AdminStackParamList>;
};

// Screen props helpers
export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type HomeScreenProps<T extends keyof HomeStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<HomeStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type ExploreScreenProps<T extends keyof ExploreStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<ExploreStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;

export type FavoritesScreenProps<T extends keyof FavoritesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<FavoritesStackParamList, T>,
    BottomTabScreenProps<MainTabParamList>
  >;
