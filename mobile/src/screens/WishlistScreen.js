import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import BackButton from '../components/BackButton';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../api/products';
import theme from '../theme';
import MobilePageBanner from '../components/MobilePageBanner';

export default function WishlistScreen({ navigation }) {
  const { wishlist, removeFromWishlist, addToCart } = useCart();

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <BackButton navigation={navigation} fallbackRoute="Home" />
        <Text style={styles.topBarTitle}>Wishlist</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')} accessibilityLabel="Cart">
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <MobilePageBanner page="WISHLIST" height={170} />
        <View style={styles.intro}>
          <Text style={styles.heading}>My Wishlist</Text>
          <Text style={styles.itemCount}>{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} saved</Text>
        </View>

        {wishlist.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>♡</Text>
            <Text style={styles.emptyTitle}>Discover more products</Text>
            <Text style={styles.empty}>Find something your pet will love.</Text>
            <TouchableOpacity style={styles.continueButton} onPress={() => navigation.navigate('Shop')}>
              <Text style={styles.continueButtonText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        ) : (
          wishlist.map((product) => (
            <View key={String(product.id)} style={styles.itemCard}>
              <Image source={{ uri: resolveImageUrl(product.image || product.imageUrls?.[0] || product.images?.[0], 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900&q=85') }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{product.name}</Text>
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
  container: { flex: 1, backgroundColor: '#F8F5FF' },
  topBar: { height: 64, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E9E5EF' },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#E1DCE8', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: '#29242F', fontSize: 28, lineHeight: 28, marginTop: 1 },
  topBarTitle: { flex: 1, marginLeft: 10, color: '#29242F', fontSize: 20, fontWeight: '800' },
  cartButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  cartIcon: { fontSize: 22 },
  content: { flex: 1 },
  contentContainer: { padding: 20, paddingBottom: 110 },
  intro: { marginTop: 18, marginBottom: 18 },
  heading: { fontSize: 26, fontWeight: '800', color: '#29242F', marginBottom: 4 },
  itemCount: { color: '#7A838B', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: 20 },
  emptyIcon: { color: '#8B5CF6', fontSize: 54, lineHeight: 58, marginBottom: 12 },
  emptyTitle: { color: '#29242F', fontSize: 20, fontWeight: '800', marginBottom: 7 },
  empty: { color: '#7A838B', fontSize: 15, textAlign: 'center' },
  continueButton: { marginTop: 22, height: 44, borderRadius: 12, backgroundColor: '#8B5CF6', paddingHorizontal: 22, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  itemCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E9E5EF' },
  itemImage: { width: 82, height: 82, borderRadius: 12, backgroundColor: '#F4F1F8' },
  itemInfo: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  itemName: { fontSize: 15, lineHeight: 20, fontWeight: '700', color: '#29242F', marginBottom: 4 },
  itemPrice: { fontSize: 16, fontWeight: '800', color: '#159447', marginBottom: 10 },
  itemActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buyButton: { height: 38, flex: 1, borderRadius: 10, backgroundColor: '#EF3975', alignItems: 'center', justifyContent: 'center' },
  buyButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  removeButton: { height: 38, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: '#E1DCE8', backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
  removeButtonText: { color: '#756B83', fontWeight: '700', fontSize: 12 },
});
