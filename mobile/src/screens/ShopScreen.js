import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../api/products';
import { products as staticProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import BottomTabBar from '../components/BottomTabBar';
import theme from '../theme';

export default function ShopScreen() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState(staticProducts);
  const [filtered, setFiltered] = useState(staticProducts);
  const { addToCart } = useCart();
  const categoryOptions = [
    { name: 'All', icon: '🐾' },
    { name: 'Dogs', icon: '🐶' },
    { name: 'Cats', icon: '🐱' },
    { name: 'Birds', icon: '🦜' },
    { name: 'Fish', icon: '🐠' },
  ];

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.warn('Unable to load products from backend:', error);
        Alert.alert('Offline mode', 'Unable to load products from backend. Showing local catalog.');
      });
  }, []);

  useEffect(() => {
    const query = search.trim().toLowerCase();
    setFiltered(products.filter((product) => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = !query || [product.name, product.category, product.subCategory]
        .some((field) => String(field || '').toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    }));
  }, [products, search, selectedCategory]);

  const handleSearch = (query) => {
    setSearch(query);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionLabel}>SEARCH</Text>
      <TextInput
        style={styles.search}
        placeholder="Search products..."
        value={search}
        onChangeText={handleSearch}
      />
      <Text style={styles.sectionLabel}>CATEGORIES</Text>
      <View style={styles.categoryList}>
        {categoryOptions.map((category) => {
          const count = category.name === 'All'
            ? products.length
            : products.filter((product) => product.category === category.name).length;
          const selected = selectedCategory === category.name;
          return (
            <TouchableOpacity
              key={category.name}
              style={[styles.categoryRow, selected && styles.categoryRowSelected]}
              onPress={() => setSelectedCategory(category.name)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[styles.categoryName, selected && styles.categoryNameSelected]}>{category.name}</Text>
              <Text style={[styles.categoryCount, selected && styles.categoryCountSelected]}>{count}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProductCard item={item} onAdd={addToCart} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No products found.</Text>}
      />
      <BottomTabBar activeTab="Shop" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  heading: { fontSize: 28, fontWeight: '800', color: theme.colors.primaryDark, marginBottom: 20 },
  sectionLabel: { color: theme.colors.muted, fontSize: 13, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  search: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 22,
  },
  categoryList: { marginBottom: 18 },
  categoryRow: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    marginBottom: 4,
  },
  categoryRowSelected: { backgroundColor: '#ff6838' },
  categoryIcon: { width: 28, fontSize: 20 },
  categoryName: { flex: 1, color: theme.colors.text, fontSize: 16 },
  categoryNameSelected: { color: theme.colors.surface, fontWeight: '700' },
  categoryCount: {
    minWidth: 26,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    textAlign: 'center',
    backgroundColor: '#eeeeee',
    color: theme.colors.muted,
    fontSize: 12,
  },
  categoryCountSelected: { backgroundColor: 'rgba(255,255,255,0.25)', color: theme.colors.surface },
  list: { paddingBottom: 100 },
  empty: { textAlign: 'center', marginTop: 24, color: theme.colors.textSecondary },
});
