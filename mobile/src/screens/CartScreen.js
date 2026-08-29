import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useCart } from '../context/CartContext';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

export default function CartScreen({ navigation }) {
  const { cart, totalItems, totalPrice, removeFromCart, updateQty } = useCart();
  const savingsAmount = totalPrice > 0 ? Math.floor(totalPrice * 0.27) : 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Savings Banner */}
        {cart.length > 0 && (
          <View style={styles.savingsBanner}>
            <Text style={styles.savingsText}>Yay! You saved ₹{savingsAmount} on this order</Text>
            <Text style={styles.savingsArrow}>▼</Text>
          </View>
        )}

        {/* Coupons & Offers */}
        {cart.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coupons & offers</Text>
            
            {/* First Coupon */}
            <View style={styles.couponCard}>
              <View style={styles.couponIcon}>
                <Text style={styles.couponCheckmark}>✓</Text>
              </View>
              <View style={styles.couponContent}>
                <Text style={styles.couponCode}>Save ₹50 with Z-PRIMESAVE50</Text>
                <Text style={styles.couponSubtext}>Shop for ₹180 more to apply</Text>
                <Text style={styles.viewAllCoupons}>View all coupons ›</Text>
              </View>
              <Text style={styles.lockedBadge}>Locked</Text>
            </View>

            <View style={styles.divider} />

            {/* Second Coupon */}
            <View style={styles.couponCard2}>
              <View style={styles.paymentIcon}>
                <Text style={styles.paymentIconText}>pay</Text>
              </View>
              <View style={styles.couponContent}>
                <Text style={styles.couponCode}>Get Upto ₹50 Cashback on using Amazon Pay</Text>
                <Text style={styles.viewAllCoupons}>View all payment offers ›</Text>
              </View>
              <TouchableOpacity style={styles.applyButton}>
                <Text style={styles.applyButtonText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Delivery Info */}
        {cart.length > 0 && (
          <View style={styles.section}>
            <View style={styles.deliveryCard}>
              <View style={styles.deliveryIcon}>
                <Text style={styles.clockIcon}>🕐</Text>
              </View>
              <View style={styles.deliveryContent}>
                <Text style={styles.deliveryText}>Delivering in 7 mins</Text>
                <Text style={styles.itemCount}>{cart.length} items</Text>
              </View>
              <TouchableOpacity style={styles.scheduleButton}>
                <Text style={styles.scheduleText}>📅 Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Items List */}
        {cart.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items yet — start shopping!</Text>
          </View>
        ) : (
          <View style={styles.section}>
            {cart.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <Image
                  source={{ uri: item.image || 'https://via.placeholder.com/100' }}
                  style={styles.itemImage}
                />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSize}>{item.size || 'Standard'}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.originalPrice}>₹{Math.floor(item.price * 1.35).toLocaleString()}</Text>
                    <Text style={styles.currentPrice}>₹{item.price.toLocaleString()}</Text>
                  </View>
                </View>
                <View style={styles.qtyControls}>
                  {item.qty === 1 ? (
                    <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                      <Text style={styles.removeBtnText}>Remove</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.qty - 1)}>
                        <Text style={styles.qtyBtnText}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyValue}>{item.qty}</Text>
                      <TouchableOpacity style={styles.qtyBtn} onPress={() => updateQty(item.id, item.qty + 1)}>
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))}

            {/* Promo Messages */}
            <View style={styles.promoSection}>
              <Text style={styles.promoText}>🔒 Add 1 more item to get 50% off on 2nd item ›</Text>
              <Text style={styles.doorstepText}>🚪 Open & Check at Doorstep ›</Text>
              <Text style={styles.addMoreText}>Forgot something? <Text style={styles.addMoreLink}>Add More Items</Text></Text>
            </View>

            {/* Shop More Section */}
            <View style={styles.shopMoreSection}>
              <Text style={styles.shopMoreText}>Shop ₹180 more</Text>
              <Text style={styles.unlockText}>Unlock ₹50 OFF</Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Footer with Payment */}
      {cart.length > 0 && (
        <View style={styles.footer}>
          <View style={styles.paymentInfo}>
            <Text style={styles.toPayLabel}>To Pay</Text>
            <Text style={styles.toPayAmount}>₹{totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.paymentOptions}>
            <TouchableOpacity style={styles.instantOrder}>
              <Text style={styles.instantOrderText}>⚡ Instant Order</Text>
              <Text style={styles.instantOrderSub}>Pay while we deliver</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.payNowButton} onPress={() => navigation.navigate('Checkout')}>
              <Text style={styles.payNowText}>Pay Now</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },

  // Savings Banner
  savingsBanner: { backgroundColor: '#d4edda', paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 12, marginTop: 12, borderRadius: 8 },
  savingsText: { fontSize: 14, fontWeight: '700', color: '#28a745' },
  savingsArrow: { fontSize: 12, color: '#28a745' },

  // Sections
  section: { backgroundColor: '#fff', marginHorizontal: 12, marginTop: 12, borderRadius: 8, padding: 16, paddingBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 12 },
  scrollContent: { paddingBottom: 140 },

  // Coupon Card
  couponCard: { flexDirection: 'row', alignItems: 'center', paddingBottom: 12, marginBottom: 8 },
  couponIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#28a745', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  couponCheckmark: { color: '#fff', fontSize: 20, fontWeight: '700' },
  couponContent: { flex: 1 },
  couponCode: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 2 },
  couponSubtext: { fontSize: 12, color: '#ff9800', marginBottom: 4 },
  viewAllCoupons: { fontSize: 12, color: '#0066cc', fontWeight: '600' },
  lockedBadge: { fontSize: 12, fontWeight: '700', color: '#999', paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: '#ddd', borderRadius: 4 },

  // Divider
  divider: { height: 1, backgroundColor: '#e8e8e8', marginVertical: 10 },

  // Second Coupon
  couponCard2: { flexDirection: 'row', alignItems: 'center', paddingTop: 4 },
  paymentIcon: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#2c3e50', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  paymentIconText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  applyButton: { paddingHorizontal: 16, paddingVertical: 8, borderWidth: 2, borderColor: '#e91e63', borderRadius: 6 },
  applyButtonText: { fontSize: 12, fontWeight: '700', color: '#e91e63' },

  // Delivery Card
  deliveryCard: { flexDirection: 'row', alignItems: 'center' },
  deliveryIcon: { marginRight: 12 },
  clockIcon: { fontSize: 28 },
  deliveryContent: { flex: 1 },
  deliveryText: { fontSize: 16, fontWeight: '700', color: '#000' },
  itemCount: { fontSize: 12, color: '#999', marginTop: 2 },
  scheduleButton: { paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: '#ff9800', borderRadius: 6 },
  scheduleText: { fontSize: 12, fontWeight: '700', color: '#ff9800' },

  // Item Card
  itemCard: { flexDirection: 'row', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#e8e8e8' },
  itemImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12, backgroundColor: '#f0f0f0' },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '700', color: '#000', marginBottom: 4 },
  itemSize: { fontSize: 12, color: '#999', marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  originalPrice: { fontSize: 12, color: '#999', textDecorationLine: 'line-through' },
  currentPrice: { fontSize: 14, fontWeight: '700', color: '#28a745' },
  qtyControls: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  qtyBtn: { width: 28, height: 28, borderRadius: 4, borderWidth: 1, borderColor: '#ddd', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  qtyBtnText: { fontSize: 16, fontWeight: '700', color: '#333' },
  qtyValue: { fontSize: 12, fontWeight: '700', color: '#333', minWidth: 20, textAlign: 'center' },
  removeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#ddd', borderRadius: 4 },
  removeBtnText: { fontSize: 12, fontWeight: '700', color: '#333' },

  // Promo Section
  promoSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e8e8e8' },
  promoText: { fontSize: 12, color: '#0066cc', fontWeight: '700', marginBottom: 8 },
  doorstepText: { fontSize: 12, color: '#0066cc', fontWeight: '700', marginBottom: 8 },
  addMoreText: { fontSize: 12, color: '#000' },
  addMoreLink: { color: '#e91e63', fontWeight: '700' },

  // Shop More Section
  shopMoreSection: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#e8e8e8' },
  shopMoreText: { fontSize: 14, color: '#000', fontWeight: '600', marginBottom: 4 },
  unlockText: { fontSize: 12, color: '#ff9800', fontWeight: '700' },

  // Empty State
  emptyContainer: { marginTop: 60, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#999' },

  // Footer
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8e8e8', paddingHorizontal: 16, paddingVertical: 12 },
  paymentInfo: { marginBottom: 12 },
  toPayLabel: { fontSize: 12, color: '#999', marginBottom: 4 },
  toPayAmount: { fontSize: 20, fontWeight: '700', color: '#000' },
  paymentOptions: { flexDirection: 'row', gap: 10 },
  instantOrder: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  instantOrderText: { fontSize: 12, fontWeight: '700', color: '#000' },
  instantOrderSub: { fontSize: 10, color: '#999', marginTop: 2 },
  payNowButton: { flex: 1, backgroundColor: '#e91e63', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 6, justifyContent: 'center', alignItems: 'center' },
  payNowText: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
