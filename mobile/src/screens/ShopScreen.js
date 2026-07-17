import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../api/products';
import { categories, products as staticProducts } from '../data/products';
import ProductCard from '../components/ProductCard';
import BottomTabBar from '../components/BottomTabBar';
import theme from '../theme';

export default function ShopScreen() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState(staticProducts);
  const [filtered, setFiltered] = useState(staticProducts);
  const { addToCart } = useCart();

  useEffect(() => {
    fetchProducts()
      .then((data) => {
        setProducts(data);
        setFiltered(data);
      })
      .catch((error) => {
        console.warn('Unable to load products from backend:', error);
        Alert.alert('Offline mode', 'Unable to load products from backend. Showing local catalog.');
      });
  }, []);

  const handleSearch = (query) => {
    setSearch(query);
    const q = query.toLowerCase();
    setFiltered(
      products.filter((product) =>
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.subCategory || '').toLowerCase().includes(q)
      )
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Shop</Text>
      <Text style={styles.subtitle}>Discover pet products made for health and happiness.</Text>
      <TextInput
        style={styles.search}
        placeholder="Search products"
        value={search}
        onChangeText={handleSearch}
      />
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
  heading: { fontSize: 28, fontWeight: '800', color: theme.colors.primaryDark, marginBottom: 4 },
  subtitle: { fontSize: 16, color: theme.colors.textSecondary, marginBottom: 16 },
  search: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.md,
    fontSize: theme.typography.body,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 16,
  },
  list: { paddingBottom: 100 },
  empty: { textAlign: 'center', marginTop: 24, color: theme.colors.textSecondary },
});
