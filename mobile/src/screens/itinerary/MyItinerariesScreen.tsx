import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MyItinerariesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Itineraries</Text>
      <Text style={styles.subtitle}>Coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1B4D8E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
});
