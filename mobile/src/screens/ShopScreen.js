import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { fetchProducts, resolveImageUrl } from '../api/products';
import { products as staticProducts } from '../data/products';
import BottomTabBar from '../components/BottomTabBar';
import MobilePageBanner from '../components/MobilePageBanner';
import config from '../api/config';

const fallbackImage = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&q=85';
const fallbackCategories = [
  { name: 'Pet Food', group: 'Food & Nutrition', icon: '🐶', image: 'https://images.unsplash.com/photo-1589924691995-400dc9a65b3d?w=500&q=85' },
  { name: 'Cats', group: 'Pets & Care', icon: '🐱', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=85' },
  { name: 'Birds', group: 'Pets & Care', icon: '🐦', image: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=500&q=85' },
  { name: 'Fish', group: 'Pets & Care', icon: '🐠', image: 'https://images.unsplash.com/photo-1524704654690-b56c05c78a00?w=500&q=85' },
  { name: 'Aquarium Plants', group: 'Home & Habitat', icon: '🌿', image: 'https://images.unsplash.com/photo-1520302519878-4f8b8b4f7f98?w=500&q=85' },
  { name: 'Small Pets', group: 'Pets & Care', icon: '🐹', image: 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=500&q=85' },
  { name: 'Reptiles', group: 'Pets & Care', icon: '🦎', image: 'https://images.unsplash.com/photo-1527159516962-2d7e6f7c1b6b?w=500&q=85' },
];

const categoryPresentation = Object.fromEntries(fallbackCategories.map(category => [category.name.toLowerCase(), category]));

function normalizeCategory(category) {
  const fallback = categoryPresentation[String(category.name || '').toLowerCase()] || {};
  const name = String(category.name || '');
  const normalizedName = name.toLowerCase();
  const group = normalizedName.includes('food') || normalizedName.includes('treat')
    ? 'Food & Nutrition'
    : normalizedName.includes('fish') || normalizedName.includes('aquarium')
      ? 'Aquatics'
      : normalizedName.includes('toy') || normalizedName.includes('play')
        ? 'Toys & Play'
        : normalizedName.includes('bed') || normalizedName.includes('comfort') || normalizedName.includes('tank') || normalizedName.includes('habitat') || normalizedName.includes('stone') || normalizedName.includes('wood')
          ? 'Habitat & Comfort'
          : normalizedName.includes('groom') || normalizedName.includes('collar') || normalizedName.includes('leash') || normalizedName.includes('care')
            ? 'Care & Accessories'
            : fallback.group || 'Other Categories';
  const icon = normalizedName.includes('food') || normalizedName.includes('treat')
    ? '🥣'
    : normalizedName.includes('fish') || normalizedName.includes('aquarium')
      ? '🐠'
      : normalizedName.includes('toy') || normalizedName.includes('play')
        ? '🧸'
        : normalizedName.includes('bed') || normalizedName.includes('comfort') || normalizedName.includes('tank') || normalizedName.includes('habitat')
          ? '🏡'
          : normalizedName.includes('groom') || normalizedName.includes('collar') || normalizedName.includes('leash') || normalizedName.includes('care')
            ? '✨'
            : fallback.icon || '🐾';
  return {
    ...fallback,
    ...category,
    name,
    group,
    icon,
    image: fallback.image || fallbackCategories[0].image,
  };
}

function normalizeProduct(product) {
  const image = product.imageUrls?.[0] || product.images?.[0] || product.image;
  return { ...product, image: resolveImageUrl(image, fallbackImage) };
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

export default function ShopScreen({ navigation }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(staticProducts.map(normalizeProduct));
  const [categories, setCategories] = useState(fallbackCategories);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([fetchProducts(), fetch(`${config.API_URL}/categories`)
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Unable to load categories')))])
      .then(([productData, categoryData]) => {
        setProducts(productData.map(normalizeProduct));
        if (Array.isArray(categoryData) && categoryData.length) setCategories(categoryData.map(normalizeCategory));
      })
      .catch((error) => {
        console.warn('Unable to load product categories from backend:', error);
        Alert.alert('Offline mode', 'Showing the local catalog.');
      });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesCategory = true;
      const matchesSearch = !query || [product.name, product.category, product.subCategory].some((field) => String(field || '').toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [products, search]);

  const groups = [...new Set(categories.map((category) => category.group))].sort((first, second) => {
    if (first === 'Other Categories') return 1;
    if (second === 'Other Categories') return -1;
    return 0;
  });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <MobilePageBanner page="PRODUCTS" height={170} />
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>All Categories</Text>
        </View>
        <View style={styles.searchBar}><Text style={styles.searchIcon}>⌕</Text><TextInput style={styles.searchInput} placeholder="Search pet products" placeholderTextColor="#8a9299" value={search} onChangeText={setSearch} /></View>

        {groups.map((group) => (
          <View key={group} style={styles.group}>
            <Text style={styles.groupTitle}>{group}</Text>
            <View style={styles.grid}>{categories.filter((category) => category.group === group).map((category) => <CategoryTile key={category.name} category={category} onPress={() => navigation.navigate('CategoryProducts', { category })} />)}</View>
          </View>
        ))}

        {search && <View style={styles.results}>
          <View style={styles.resultsHeader}><Text style={styles.resultsTitle}>Search results</Text><TouchableOpacity onPress={() => setSearch('')}><Text style={styles.clear}>Clear</Text></TouchableOpacity></View>
          {filtered.map((item) => <TouchableOpacity style={styles.productRow} key={String(item.id)} onPress={() => navigation.navigate('ProductDetails', { product: item })} activeOpacity={0.82}><Image source={{ uri: item.image }} style={styles.productImage} /><View style={styles.productInfo}><Text style={styles.productName}>{item.name}</Text><Text style={styles.productMeta}>{item.category} · {item.subCategory}</Text><Text style={styles.productPrice}>₹{Number(item.price || 0).toLocaleString()}</Text></View><TouchableOpacity style={styles.addButton} onPress={(event) => { event.stopPropagation(); addToCart(item); }}><Text style={styles.addText}>Add</Text></TouchableOpacity></TouchableOpacity>)}
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
  pageHeader: { height: 64, borderBottomWidth: 1, borderBottomColor: '#e7eaed', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
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
