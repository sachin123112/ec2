import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';
import BottomTabBar from '../components/BottomTabBar';
import theme from '../theme';

export default function CartScreen({ navigation }) {
  const { cart, totalItems, totalPrice, removeFromCart, updateQty } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.heading}>Your Cart</Text>
        {cart.length === 0 ? (
          <Text style={styles.empty}>No items yet — start shopping!</Text>
        ) : (
          <>
            <View style={styles.itemsList}>
              {cart.map((item) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.cardPrice}>₹{item.price.toLocaleString()}</Text>
                  </View>
                  <Text style={styles.cardSubtitle}>Qty: {item.qty}</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity style={styles.qtyButton} onPress={() => updateQty(item.id, item.qty - 1)}>
                      <Text style={styles.qtyButtonText}>−</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.qtyButton} onPress={() => updateQty(item.id, item.qty + 1)}>
                      <Text style={styles.qtyButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
                      <Text style={styles.removeText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>Items</Text>
              <Text style={styles.summaryValue}>{totalItems}</Text>
              <Text style={styles.summaryText}>Total</Text>
              <Text style={styles.summaryValue}>₹{totalPrice.toLocaleString()}</Text>
              <TouchableOpacity style={styles.clearButton} onPress={() => navigation.navigate('Checkout')}>
                <Text style={styles.clearButtonText}>Proceed to Checkout</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
      <BottomTabBar activeTab="Cart" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  content: { flex: 1, padding: theme.spacing.lg },
  heading: { fontSize: 28, fontWeight: '800', color: theme.colors.primaryDark, marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 32, color: theme.colors.textSecondary, fontSize: 16 },
  itemsList: { flexGrow: 0 },
  card: { padding: 18, borderRadius: theme.radius.xl, backgroundColor: theme.colors.surface, marginBottom: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardTitle: { fontSize: 18, fontWeight: '700', color: theme.colors.text },
  cardPrice: { fontSize: 16, fontWeight: '700', color: theme.colors.primary },
  cardSubtitle: { fontSize: 14, color: theme.colors.muted, marginBottom: 14 },
  actions: { flexDirection: 'row', alignItems: 'center' },
  qtyButton: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', borderRadius: theme.radius.md, backgroundColor: '#f0ebff', marginRight: 12 },
  qtyButtonText: { fontSize: 20, color: theme.colors.primaryDark, fontWeight: '700' },
  removeButton: { marginLeft: 'auto' },
  removeText: { color: theme.colors.danger, fontWeight: '700' },
  summary: { padding: 20, borderRadius: theme.radius.xl, backgroundColor: theme.colors.surface, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 4 },
  summaryText: { fontSize: 14, color: theme.colors.muted, marginTop: 10 },
  summaryValue: { fontSize: 24, fontWeight: '800', color: theme.colors.text },
  clearButton: { marginTop: 20, backgroundColor: theme.colors.primary, padding: 16, borderRadius: theme.radius.xl, alignItems: 'center' },
  clearButtonText: { color: theme.colors.surface, fontWeight: '700' },
});
