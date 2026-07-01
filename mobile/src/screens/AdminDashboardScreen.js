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
        <Text>Loading...</Text>
      ) : stats ? (
        <View style={styles.card}>
          <Text style={styles.label}>Total Users</Text>
          <Text style={styles.value}>{stats.totalUsers}</Text>
          <Text style={styles.label}>Total Orders</Text>
          <Text style={styles.value}>{stats.totalOrders}</Text>
          <Text style={styles.label}>Revenue</Text>
          <Text style={styles.value}>₹{stats.revenue}</Text>
        </View>
      ) : (
        <Text style={styles.error}>Unable to fetch data.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  label: { color: '#666', marginTop: 12 },
  value: { fontSize: 28, fontWeight: '700', marginTop: 4 },
  error: { color: '#d32f2f' },
});
