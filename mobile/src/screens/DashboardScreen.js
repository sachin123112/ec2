import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import config from '../api/config';
import BottomTabBar from '../components/BottomTabBar';
import theme from '../theme';

export default function DashboardScreen() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const { token } = useAuth();
  const navigation = useNavigation();

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

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${config.API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          const notifications = Array.isArray(data) ? data : [];
          const count = notifications.filter(n => !n.read).length;
          setUnreadCount(count);
        }
      } catch (err) {
        console.warn('Error fetching notifications:', err);
      }
    };
    if (token) fetchNotifications();
  }, [token]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Dashboard</Text>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.notificationIcon}>🔔</Text>
          {unreadCount > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
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
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg, 
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  heading: { fontSize: 28, fontWeight: '800', color: theme.colors.primaryDark },
  notificationButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    position: 'relative',
  },
  notificationIcon: {
    fontSize: 24,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.colors.danger || '#d32f2f',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: { flex: 1, padding: theme.spacing.lg },
  message: { color: theme.colors.textSecondary, fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 18, borderRadius: theme.radius.xl, backgroundColor: theme.colors.surface, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  label: { color: theme.colors.muted, marginBottom: 10 },
  value: { fontSize: 28, fontWeight: '800', color: theme.colors.text },
  error: { color: theme.colors.danger, fontSize: 16 },
});
