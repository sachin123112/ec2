import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import config from '../api/config';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

export default function OrderHistoryScreen({ navigation }) {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const response = await fetch(`${config.API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Unable to load orders');
        const data = await response.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        Alert.alert('Unable to load orders', 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) loadOrders();
  }, [token]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Account')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Order History</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your Orders</Text>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : orders.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptyText}>Your completed orders will appear here.</Text>
          </View>
        ) : (
          orders.map((order) => {
            const orderNumber = order.orderNumber || order.id || 'Order';
            const status = order.status || 'Pending';
            const total = Number(order.totalAmount || order.total || 0);
            const date = order.createdAt || order.date;
            return (
              <View style={styles.orderCard} key={String(order.id || orderNumber)}>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderNumber}>#{orderNumber}</Text>
                  <Text style={[styles.status, styles[`status${String(status).toLowerCase()}`]]}>{status}</Text>
                </View>
                <Text style={styles.orderDate}>{date ? new Date(date).toLocaleDateString() : 'Date unavailable'}</Text>
                <View style={styles.orderFooter}>
                  <Text style={styles.itemCount}>{order.items?.length || order.totalItems || 0} items</Text>
                  <Text style={styles.total}>₹{total.toLocaleString()}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
      <BottomTabBar activeTab="Account" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { height: 108, paddingHorizontal: 18, paddingTop: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb' },
  backButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 30, lineHeight: 30 },
  topBarTitle: { marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 110 },
  heading: { color: theme.colors.primaryDark, fontSize: 27, fontWeight: '800', marginBottom: 18 },
  emptyCard: { backgroundColor: theme.colors.surface, borderRadius: 18, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border },
  emptyIcon: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyText: { color: theme.colors.textSecondary, textAlign: 'center' },
  orderCard: { backgroundColor: theme.colors.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { color: theme.colors.text, fontSize: 16, fontWeight: '800' },
  status: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12, overflow: 'hidden', fontSize: 12, fontWeight: '700', color: '#475569', backgroundColor: '#f1f5f9' },
  statuscompleted: { color: '#15803d', backgroundColor: '#dcfce7' },
  statusdelivered: { color: '#15803d', backgroundColor: '#dcfce7' },
  statuscancelled: { color: '#b91c1c', backgroundColor: '#fee2e2' },
  orderDate: { color: theme.colors.muted, fontSize: 13, marginTop: 8 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
  itemCount: { color: theme.colors.textSecondary },
  total: { color: theme.colors.primaryDark, fontSize: 18, fontWeight: '800' },
});
