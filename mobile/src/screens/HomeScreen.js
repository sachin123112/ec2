import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { logout, isAdmin } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to PawMart</Text>
      <Text style={styles.subtitle}>Shop for your pets and manage orders on the go.</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Shop')}>
        <Text style={styles.buttonText}>Browse Shop</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('Cart')}>
        <Text style={styles.buttonText}>View Cart</Text>
      </TouchableOpacity>
      {isAdmin && (
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('AdminDashboard')}>
          <Text style={styles.buttonText}>Admin Dashboard</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.buttonTertiary} onPress={logout}>
        <Text style={styles.buttonText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#666', textAlign: 'center', marginBottom: 24 },
  button: { width: '100%', backgroundColor: '#2d6cdf', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  buttonSecondary: { width: '100%', backgroundColor: '#4caf50', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  buttonTertiary: { width: '100%', backgroundColor: '#999', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
});
