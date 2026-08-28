import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../api/products';
import { products as staticProducts } from '../data/products';
import BottomTabBar from '../components/BottomTabBar';

const fallbackImage = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&q=85';
const categories = [
  { name: 'Dog Food', group: 'Food & Nutrition', icon: '🐶', image: 'https://images.unsplash.com/photo-1589924691995-400dc9a65b3d?w=500&q=85' },
  { name: 'Cat Food', group: 'Food & Nutrition', icon: '🐱', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=85' },
  { name: 'Bird Food', group: 'Food & Nutrition', icon: '🐦', image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=500&q=85' },
  { name: 'Fish Food', group: 'Food & Nutrition', icon: '🐠', image: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=500&q=85' },
  { name: 'Treats', group: 'Toys & Treats', icon: '🦴', image: 'https://images.unsplash.com/photo-1582798358481-d199fb7347bb?w=500&q=85' },
  { name: 'Pet Toys', group: 'Toys & Treats', icon: '🎾', image: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500&q=85' },
  { name: 'Beds & Comfort', group: 'Home & Comfort', icon: '🛏️', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=85' },
  { name: 'Grooming', group: 'Care & Wellness', icon: '🧴', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=85' },
  { name: 'Collars & Leashes', group: 'Accessories', icon: '🏷️', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=85' },
  { name: 'Aquarium Care', group: 'Accessories', icon: '🫧', image: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=500&q=85' },
];

function normalizeProduct(product) {
  return { ...product, image: product.imageUrls?.[0] || product.images?.[0] || product.image || fallbackImage };
}

function CategoryTile({ category, onPress }) {
  return (
    <TouchableOpacity style={styles.categoryTile} onPress={onPress} activeOpacity={0.82}>
      <Image source={{ uri: category.image }} style={styles.categoryImage} />
      <View style={styles.imageWash} />
      <Text style={styles.categoryIcon}>{category.icon}</Text>
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );
}

export default function ShopScreen() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(staticProducts.map(normalizeProduct));
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data.map(normalizeProduct)))
      .catch((error) => {
        console.warn('Unable to load products from backend:', error);
        Alert.alert('Offline mode', 'Showing the local catalog.');
      });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = !selectedCategory || product.category?.toLowerCase().includes(selectedCategory.split(' ')[0].toLowerCase());
      const matchesSearch = !query || [product.name, product.category, product.subCategory].some((field) => String(field || '').toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [products, search, selectedCategory]);

  const groups = [...new Set(categories.map((category) => category.group))];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>All Categories</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => setFavorite((value) => !value)} accessibilityLabel="Favorite"><Text style={[styles.headerIcon, favorite && styles.favoriteActive]}>{favorite ? '♥' : '♡'}</Text></TouchableOpacity>
            <Text style={styles.headerIcon}>⌕</Text>
          </View>
        </View>
        <View style={styles.searchBar}><Text style={styles.searchIcon}>⌕</Text><TextInput style={styles.searchInput} placeholder="Search pet products" placeholderTextColor="#8a9299" value={search} onChangeText={setSearch} /></View>

        {groups.map((group) => (
          <View key={group} style={styles.group}>
            <Text style={styles.groupTitle}>{group}</Text>
            <View style={styles.grid}>{categories.filter((category) => category.group === group).map((category) => <CategoryTile key={category.name} category={category} onPress={() => setSelectedCategory(category.name)} />)}</View>
          </View>
        ))}

        {(selectedCategory || search) && <View style={styles.results}>
          <View style={styles.resultsHeader}><Text style={styles.resultsTitle}>{selectedCategory || 'Search results'}</Text><TouchableOpacity onPress={() => { setSelectedCategory(''); setSearch(''); }}><Text style={styles.clear}>Clear</Text></TouchableOpacity></View>
          {filtered.map((item) => <View style={styles.productRow} key={String(item.id)}><Image source={{ uri: item.image }} style={styles.productImage} /><View style={styles.productInfo}><Text style={styles.productName}>{item.name}</Text><Text style={styles.productMeta}>{item.category} · {item.subCategory}</Text><Text style={styles.productPrice}>₹{Number(item.price || 0).toLocaleString()}</Text></View><TouchableOpacity style={styles.addButton} onPress={() => addToCart(item)}><Text style={styles.addText}>Add</Text></TouchableOpacity></View>)}
          {!filtered.length && <Text style={styles.empty}>No products found.</Text>}
        </View>}
      </ScrollView>
      <BottomTabBar activeTab="Shop" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 100 },
  pageHeader: { height: 76, borderBottomWidth: 1, borderBottomColor: '#e7eaed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pageTitle: { color: '#101820', fontSize: 27, fontWeight: '800' },
  headerActions: { position: 'absolute', right: 20, flexDirection: 'row', alignItems: 'center', gap: 18 },
  headerIcon: { color: '#101820', fontSize: 36, lineHeight: 38 },
  favoriteActive: { color: '#e53935' },
  searchBar: { height: 48, margin: 14, borderWidth: 1, borderColor: '#e0e5e9', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, backgroundColor: '#fafbfc' },
  searchIcon: { color: '#75808a', fontSize: 24, marginRight: 8 },
  searchInput: { flex: 1, color: '#101820', fontSize: 15 },
  group: { paddingHorizontal: 18, marginTop: 8 },
  groupTitle: { color: '#18212a', fontSize: 23, fontWeight: '800', marginBottom: 14, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryTile: { width: '31.5%', height: 126, borderRadius: 15, overflow: 'hidden', backgroundColor: '#f5f6f7', marginBottom: 16, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 9 },
  categoryImage: { ...StyleSheet.absoluteFillObject, resizeMode: 'cover' },
  imageWash: { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', opacity: 0.42 },
  categoryIcon: { fontSize: 27, marginBottom: 3 },
  categoryName: { color: '#151c23', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  results: { margin: 18, paddingTop: 8 },
  resultsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  resultsTitle: { color: '#18212a', fontSize: 22, fontWeight: '800' },
  clear: { color: '#7046c7', fontWeight: '800' },
  productRow: { minHeight: 92, padding: 10, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7eaed', flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  productImage: { width: 70, height: 70, borderRadius: 12, marginRight: 12 },
  productInfo: { flex: 1 },
  productName: { color: '#25213c', fontSize: 15, fontWeight: '800' },
  productMeta: { color: '#89919a', fontSize: 11, marginTop: 4 },
  productPrice: { color: '#5e36aa', fontSize: 15, fontWeight: '800', marginTop: 5 },
  addButton: { backgroundColor: '#6941c6', borderRadius: 9, paddingVertical: 9, paddingHorizontal: 15 },
  addText: { color: '#fff', fontWeight: '800' },
  empty: { color: '#77818a', textAlign: 'center', padding: 20 },
});
