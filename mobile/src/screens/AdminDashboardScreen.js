import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import config from '../api/config';

export default function AdminDashboardScreen() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${config.API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Unable to load stats');
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.warn(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Admin Dashboard</Text>
      {loading ? (
        <Text style={styles.message}>Loading...</Text>
      ) : stats ? (
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.label}>Total Users</Text>
            <Text style={styles.value}>{stats.totalUsers}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Total Orders</Text>
            <Text style={styles.value}>{stats.totalOrders}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Revenue</Text>
            <Text style={styles.value}>₹{stats.revenue}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.error}>Unable to fetch data.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f2ff' },
  heading: { fontSize: 28, fontWeight: '800', color: '#4a2d90', marginBottom: 24 },
  message: { color: '#6f5ecb', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 18, borderRadius: 20, backgroundColor: '#fff', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  label: { color: '#7d72b6', marginBottom: 10 },
  value: { fontSize: 28, fontWeight: '800', color: '#25213c' },
  error: { color: '#d32f2f', fontSize: 16 },
});
