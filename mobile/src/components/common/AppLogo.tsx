import React from 'react';
import { Image, StyleSheet, View, ImageStyle, ViewStyle } from 'react-native';

interface Props {
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
}

/**
 * App logo (Tunisia Travel — the rounded illustration with the Sidi Bou Said
 * door, crescent moon and Sahara dune). Loaded from the static bundle so it's
 * available offline.
 */
export default function AppLogo({ size = 80, style, imageStyle }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }, style]}>
      <Image
        source={require('../../../assets/logo.png')}
        style={[{ width: size, height: size }, imageStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
