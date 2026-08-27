import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import BottomTabBar from '../components/BottomTabBar';
import config from '../api/config';
import { goBackOrNavigate } from '../navigation/safeBack';

export default function AdminDashboardScreen({ navigation }) {
  const { token, roles } = useAuth();
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
    <View style={styles.page}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Home')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.heading}>Admin Dashboard</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.roleSection}>
          <Text style={styles.roleSectionTitle}>Roles & permissions</Text>
          <View style={styles.roleGrid}>
            {(roles.length ? roles : ['MOBILE_USER']).map((role) => (
              <View style={styles.roleCard} key={role}>
                <Text style={styles.roleTitle}>{role}</Text>
                <View style={styles.permissionBox}>
                  {(role === 'ADMIN' || role === 'MOBILE_ADMIN'
                    ? ['Dashboard access', 'Manage users', 'Manage orders']
                    : ['Browse catalog', 'Place orders', 'Manage profile']
                  ).map((permission) => <Text style={styles.permissionText} key={permission}>✓ {permission}</Text>)}
                </View>
              </View>
            ))}
          </View>
        </View>
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
      <BottomTabBar activeTab="Shop" />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f7f2ff' },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0d7f7',
  },
  backButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#25213c', fontSize: 30, lineHeight: 30 },
  heading: { fontSize: 28, fontWeight: '800', color: '#4a2d90' },
  container: { flex: 1, padding: 20 },
  message: { color: '#6f5ecb', fontSize: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: { width: '48%', padding: 18, borderRadius: 20, backgroundColor: '#fff', marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  label: { color: '#7d72b6', marginBottom: 10 },
  value: { fontSize: 28, fontWeight: '800', color: '#25213c' },
  error: { color: '#d32f2f', fontSize: 16 },
  roleSection: { marginBottom: 20 },
  roleSectionTitle: { color: '#25213c', fontSize: 20, fontWeight: '800', marginBottom: 12 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  roleCard: { width: '48%', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#dbeafe' },
  roleTitle: { color: '#25213c', fontSize: 15, fontWeight: '800', marginBottom: 10 },
  permissionBox: { backgroundColor: '#dbeafe', borderRadius: 10, padding: 10 },
  permissionText: { color: '#1d4ed8', fontSize: 12, fontWeight: '700', marginBottom: 5 },
});
