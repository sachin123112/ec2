import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useCart } from '../context/CartContext';

export default function CartScreen() {
  const { cart, totalItems, totalPrice, removeFromCart, updateQty, clearCart } = useCart();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Cart</Text>
      {cart.length === 0 ? (
        <Text style={styles.empty}>Your cart is empty.</Text>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => String(item.id)}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Text>Qty: {item.qty}</Text>
                <Text>Price: ₹{item.price.toLocaleString()}</Text>
                <View style={styles.actions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => updateQty(item.id, item.qty - 1)}>
                    <Text>-</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => updateQty(item.id, item.qty + 1)}>
                    <Text>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeFromCart(item.id)}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={styles.summary}>
            <Text style={styles.summaryText}>Items: {totalItems}</Text>
            <Text style={styles.summaryText}>Total: ₹{totalPrice.toLocaleString()}</Text>
            <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
              <Text style={styles.clearButtonText}>Clear Cart</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 16 },
  empty: { textAlign: 'center', marginTop: 32, color: '#666' },
  card: { padding: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  actionButton: { width: 40, height: 40, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#ccc', marginRight: 8 },
  removeButton: { marginLeft: 'auto' },
  removeText: { color: '#d32f2f' },
  summary: { padding: 16, borderTopWidth: 1, borderTopColor: '#eee', marginTop: 16 },
  summaryText: { fontSize: 16, marginBottom: 8 },
  clearButton: { backgroundColor: '#d32f2f', padding: 12, borderRadius: 10, alignItems: 'center' },
  clearButtonText: { color: '#fff', fontWeight: '700' },
});
