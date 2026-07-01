import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useCart } from '../context/CartContext';
import { fetchProducts } from '../api/products';
import { categories, products as staticProducts } from '../data/products';

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
      <TextInput
        style={styles.search}
        placeholder="Search products"
        value={search}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardSubtitle}>{item.category} · {item.subCategory}</Text>
            <Text style={styles.cardPrice}>₹{item.price.toLocaleString()}</Text>
            <TouchableOpacity style={styles.button} onPress={() => addToCart(item)}>
              <Text style={styles.buttonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No products found.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  heading: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  search: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 16 },
  card: { padding: 16, borderWidth: 1, borderColor: '#eee', borderRadius: 12, marginBottom: 12, backgroundColor: '#fafafa' },
  cardTitle: { fontSize: 18, fontWeight: '700' },
  cardSubtitle: { color: '#666', marginVertical: 8 },
  cardPrice: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  button: { backgroundColor: '#2d6cdf', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '700' },
  empty: { textAlign: 'center', marginTop: 24, color: '#666' },
});
