import React, { useEffect, useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { fetchProducts } from '../api/products';
import { products as staticProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import BottomTabBar from '../components/BottomTabBar';

const heroImage = 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=900&q=85';
const promoImages = {
  rakhi: 'https://images.unsplash.com/photo-1589924691995-400dc9a65b3d?w=500&q=85',
  sweets: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=85',
  gifts: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500&q=85',
  flowers: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&q=85',
};

function normalizeProduct(product) {
  return {
    ...product,
    image: product.imageUrls?.[0] || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80',
  };
}

function PromoTile({ title, image, wide }) {
  return (
    <View style={[styles.promoTile, wide && styles.promoTileWide]}>
      <Image source={{ uri: image }} style={styles.promoImage} />
      <View style={styles.promoShade} />
      <Text style={styles.promoTitle}>{title}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(staticProducts.map(normalizeProduct));
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts()
      .then((items) => setProducts(items.map(normalizeProduct)))
      .catch((error) => console.warn('Unable to load products from backend:', error));
  }, []);

  const topPicks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => !query || product.name.toLowerCase().includes(query) || product.category?.toLowerCase().includes(query)).slice(0, 8);
  }, [products, search]);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput style={styles.searchInput} placeholder="Search for pets, food, accessories..." placeholderTextColor="#8b8b8b" value={search} onChangeText={setSearch} />
          <Text style={styles.searchHint}>⌘</Text>
        </View>

        <View style={styles.hero}>
          <Image source={{ uri: heroImage }} style={styles.heroImage} />
          <View style={styles.heroOverlay} />
          <View style={styles.heroCopy}>
            <Text style={styles.heroEyebrow}>Celebrate with love</Text>
            <Text style={styles.heroTitle}>Raksha{'\n'}Bandhan</Text>
            <Text style={styles.heroDate}>28th August, Friday</Text>
          </View>
          <View style={styles.sponsor}><Text style={styles.sponsorText}>Sponsored by</Text><Text style={styles.sponsorBrand}>PawMart</Text></View>
        </View>

        <View style={styles.specialsGrid}>
          <PromoTile title={'Rakhi\nSPECIALS'} image={promoImages.rakhi} wide />
          <View style={styles.smallTileColumn}><PromoTile title="Chocolates & More" image={promoImages.sweets} /><PromoTile title="Gifts for Brother" image={promoImages.gifts} /></View>
          <View style={styles.smallTileColumn}><PromoTile title="Mithai & Dry Fruits" image={promoImages.sweets} /><PromoTile title="Gifts for Sister" image={promoImages.flowers} /></View>
        </View>

        <View style={styles.offerStrip}>
          <View style={styles.offerImageWrap}><Image source={{ uri: promoImages.sweets }} style={styles.offerImage} /></View>
          <View style={styles.offerCopy}><Text style={styles.offerTitle}>Get up to 80% OFF</Text><Text style={styles.offerSubtitle}>on treats, toys & gift hampers</Text></View>
          <Text style={styles.offerArrow}>›</Text>
        </View>

        <View style={styles.sectionHeading}><Text style={styles.sectionTitle}>Top Picks</Text><View style={styles.headingLine} /></View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productsRow}>
          {topPicks.map((item) => (
            <TouchableOpacity key={String(item.id)} style={styles.product} onPress={() => addToCart(item)} activeOpacity={0.8}>
              <View style={styles.productImageWrap}><Image source={{ uri: item.image }} style={styles.productImage} /></View>
              <Text style={styles.productPrice}>₹{Number(item.price || 0).toLocaleString()}</Text>
              <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.productAction}>Add to cart</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
      <BottomTabBar activeTab="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff8f0' },
  scrollContent: { paddingBottom: 98 },
  searchBar: { height: 48, margin: 12, marginBottom: 8, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eaded6', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  searchIcon: { color: '#7e7e7e', fontSize: 27, lineHeight: 28, marginRight: 8 },
  searchInput: { flex: 1, color: '#332f2b', fontSize: 15, paddingVertical: 0 },
  searchHint: { color: '#ad9e96', fontSize: 17 },
  hero: { height: 190, overflow: 'hidden', backgroundColor: '#9e0d0d' },
  heroImage: { ...StyleSheet.absoluteFillObject, opacity: 0.28 },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#8f0000', opacity: 0.72 },
  heroCopy: { position: 'absolute', left: 20, top: 25 },
  heroEyebrow: { color: '#ffdcb2', fontSize: 12, letterSpacing: 0.5, marginBottom: 4 },
  heroTitle: { color: '#fff5d7', fontSize: 38, lineHeight: 36, fontWeight: '800', fontFamily: 'serif' },
  heroDate: { color: '#ffe9ca', fontSize: 11, marginTop: 8 },
  sponsor: { position: 'absolute', right: 18, top: 44, backgroundColor: '#b7352e', borderWidth: 1, borderColor: '#e57156', borderRadius: 22, paddingVertical: 8, paddingHorizontal: 15, alignItems: 'center' },
  sponsorText: { color: '#ffe8c7', fontSize: 9 },
  sponsorBrand: { color: '#fff', fontSize: 13, fontWeight: '800', marginTop: 2 },
  specialsGrid: { flexDirection: 'row', padding: 10, gap: 8, backgroundColor: '#8f0000' },
  promoTile: { height: 92, flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#edd6bd' },
  promoTileWide: { height: 192, flex: 1.25 },
  smallTileColumn: { flex: 1, gap: 8 },
  promoImage: { ...StyleSheet.absoluteFillObject },
  promoShade: { ...StyleSheet.absoluteFillObject, backgroundColor: '#4b1207', opacity: 0.25 },
  promoTitle: { position: 'absolute', left: 8, right: 8, top: 9, color: '#fff9e7', fontSize: 12, lineHeight: 15, fontWeight: '800', textAlign: 'center', textShadowColor: '#5a180c', textShadowRadius: 3 },
  offerStrip: { margin: 10, height: 64, padding: 8, borderRadius: 10, backgroundColor: '#b62b28', flexDirection: 'row', alignItems: 'center' },
  offerImageWrap: { width: 48, height: 48, borderRadius: 6, overflow: 'hidden' },
  offerImage: { width: '100%', height: '100%' },
  offerCopy: { flex: 1, paddingLeft: 9 },
  offerTitle: { color: '#fff', fontSize: 15, fontWeight: '800' },
  offerSubtitle: { color: '#ffe0cd', fontSize: 12, marginTop: 3 },
  offerArrow: { color: '#fff', backgroundColor: '#8b0909', width: 34, height: 34, borderRadius: 17, textAlign: 'center', fontSize: 30, lineHeight: 29 },
  sectionHeading: { backgroundColor: '#fff', alignItems: 'center', paddingTop: 2, paddingBottom: 5 },
  sectionTitle: { color: '#8c1715', fontSize: 18, fontWeight: '800' },
  headingLine: { width: 76, height: 2, backgroundColor: '#e2a23b', marginTop: 4 },
  productsRow: { paddingHorizontal: 12, paddingTop: 10, gap: 12 },
  product: { width: 100 },
  productImageWrap: { height: 88, borderRadius: 10, backgroundColor: '#fff1dc', overflow: 'hidden', marginBottom: 6 },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productPrice: { color: '#b51d1b', fontSize: 17, fontWeight: '800' },
  productName: { color: '#5b4438', fontSize: 11, marginTop: 2 },
  productAction: { color: '#9e291e', fontSize: 11, fontWeight: '700', marginTop: 4 },
});
