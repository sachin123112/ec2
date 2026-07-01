import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import config from '../api/config';

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${config.API_URL}/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Unable to load stats');
        setStats(await response.json());
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
          <Text style={styles.statLabel}>Total Users</Text>
          <Text style={styles.statValue}>{stats.totalUsers}</Text>
          <Text style={styles.statLabel}>Total Orders</Text>
          <Text style={styles.statValue}>{stats.totalOrders}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
          <Text style={styles.statValue}>₹{stats.revenue}</Text>
        </View>
      ) : (
        <Text style={styles.error}>Unable to fetch admin stats.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  card: { padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#eee', backgroundColor: '#fafafa' },
  statLabel: { color: '#666', fontSize: 16, marginTop: 12 },
  statValue: { fontSize: 28, fontWeight: '700', marginTop: 4 },
  error: { color: '#d32f2f' },
});
