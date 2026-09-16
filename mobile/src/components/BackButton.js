import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { goBackOrNavigate } from '../navigation/safeBack';

export default function BackButton({ navigation, fallbackRoute, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={() => goBackOrNavigate(navigation, fallbackRoute)}
      accessibilityLabel="Go back"
      hitSlop={8}
    >
      <Text style={styles.icon}>‹</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: '#29242F',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '400',
  },
});