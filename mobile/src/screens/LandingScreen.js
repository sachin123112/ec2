import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function LandingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroIcon}>🐾</Text>
        <Text style={styles.title}>PawMart</Text>
        <Text style={styles.subtitle}>Your Pet's Happy Place</Text>
        <Text style={styles.tagline}>"Everything Your Pet Needs"</Text>
        <Text style={styles.hint}>Tap to continue</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.replace('Login')}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f3ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  heroCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  heroIcon: {
    fontSize: 44,
    marginBottom: 18,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#4a2d90',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6f5ecb',
    marginBottom: 18,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: '#7d72b6',
    marginBottom: 24,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  hint: {
    fontSize: 14,
    color: '#a187d4',
  },
  button: {
    marginTop: 28,
    width: '100%',
    backgroundColor: '#6941c6',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
