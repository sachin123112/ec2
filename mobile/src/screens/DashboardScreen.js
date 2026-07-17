import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import config from '../api/config';
import BottomTabBar from '../components/BottomTabBar';
import theme from '../theme';

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
      <View style={styles.content}>
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
          <Text style={styles.error}>Unable to fetch admin stats.</Text>
        )}
      </View>
      <BottomTabBar activeTab="Dashboard" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, paddingBottom: 90 },
  content: { flex: 1, padding: theme.spacing.lg },
  heading: { fontSize: 28, fontWeight: '800', color: theme.colors.primaryDark, marginBottom: 24 },
  message: { color: theme.colors.textSecondary, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 18, borderRadius: theme.radius.xl, backgroundColor: theme.colors.surface, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  label: { color: theme.colors.muted, marginBottom: 10 },
  value: { fontSize: 28, fontWeight: '800', color: theme.colors.text },
  error: { color: theme.colors.danger, fontSize: 16 },
});
