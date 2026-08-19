import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import BottomTabBar from '../components/BottomTabBar';
import theme from '../theme';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { logout, isAdmin } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>PawMart</Text>
        <Text style={styles.subtitle}>Your pet essentials delivered with love.</Text>
        <Text style={styles.description}>Shop premium products, manage your orders, and keep your furry family happy.</Text>

        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('Shop')}>
          <Text style={styles.primaryButtonText}>Browse Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Cart')}>
          <Text style={styles.secondaryButtonText}>View Cart</Text>
        </TouchableOpacity>
        {isAdmin && (
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('AdminDashboard')}>
            <Text style={styles.secondaryButtonText}>Admin Dashboard</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.tertiaryButton} onPress={logout}>
          <Text style={styles.tertiaryButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
      <BottomTabBar activeTab="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    color: '#6759a8',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: theme.colors.accent,
    padding: 16,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    marginBottom: 12,
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  tertiaryButton: {
    width: '100%',
    backgroundColor: '#dcd0ff',
    padding: 16,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    marginTop: 8,
  },
  tertiaryButtonText: {
    color: theme.colors.primaryDark,
    fontWeight: '700',
  },
});
