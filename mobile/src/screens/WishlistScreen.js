import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import { useCart } from '../context/CartContext';
import theme from '../theme';

export default function WishlistScreen({ navigation }) {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Home')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Wishlist</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')} accessibilityLabel="Cart">
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>Wishlist</Text>

        {wishlist.length === 0 ? (
          <Text style={styles.empty}>Your wishlist is empty.</Text>
        ) : (
          wishlist.map((product) => (
            <View key={String(product.id)} style={styles.itemCard}>
              <Image source={{ uri: product.image || product.imageUrls?.[0] || product.images?.[0] || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900&q=85' }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{product.name}</Text>
                <Text style={styles.itemPrice}>₹{Number(product.price || 0).toLocaleString()}</Text>
                <View style={styles.itemActions}>
                  <TouchableOpacity style={styles.buyButton} onPress={() => addToCart(product)}>
                    <Text style={styles.buyButtonText}>Add to cart</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.removeButton} onPress={() => removeFromWishlist(product.id)}>
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <BottomTabBar activeTab="Wishlist" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { height: 108, paddingHorizontal: 18, paddingTop: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb' },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#dfe3e7', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 29, lineHeight: 29, marginTop: 2 },
  topBarTitle: { flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  cartButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  cartIcon: { fontSize: 22 },
  content: { flex: 1 },
  contentContainer: { padding: theme.spacing.lg, paddingBottom: 30 },
  heading: { fontSize: 28, fontWeight: '800', color: theme.colors.primaryDark, marginBottom: 16 },
  empty: { color: theme.colors.textSecondary, fontSize: 16 },
  itemCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eceef2' },
  itemImage: { width: 88, height: 88, borderRadius: 12, backgroundColor: '#f4f5f6' },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { fontSize: 16, fontWeight: '700', color: theme.colors.text, marginBottom: 4 },
  itemPrice: { fontSize: 15, fontWeight: '800', color: '#1a9d5b', marginBottom: 10 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buyButton: { flex: 1, backgroundColor: '#ee3d78', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  buyButtonText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  removeButton: { paddingVertical: 10, paddingHorizontal: 10, borderRadius: 10, borderWidth: 1, borderColor: '#dfe3e7', alignItems: 'center' },
  removeButtonText: { color: theme.colors.textSecondary, fontWeight: '700', fontSize: 12 },
});
