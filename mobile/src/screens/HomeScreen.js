import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { fetchProducts } from '../api/products';
import { products as staticProducts } from '../data/products';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import BottomTabBar from '../components/BottomTabBar';
import theme from '../theme';

export default function HomeScreen() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState(staticProducts);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch((error) => console.warn('Unable to load products from backend:', error));
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ProductCard item={item} onAdd={addToCart} />}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.productsHeading}>All Products</Text>}
        ListEmptyComponent={<Text style={styles.empty}>No products available.</Text>}
      />
      <BottomTabBar activeTab="Home" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  listContent: {
    padding: theme.spacing.lg,
    paddingBottom: 100,
  },
  productsHeading: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primaryDark,
    marginBottom: 16,
  },
  empty: {
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
});
