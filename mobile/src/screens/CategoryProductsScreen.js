import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { fetchProducts, resolveImageUrl } from '../api/products';
import { products as staticProducts } from '../data/products';
import BottomTabBar from '../components/BottomTabBar';

const fallbackImage = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=500&q=85';

function normalizeProduct(product) {
  const image = product.imageUrls?.[0] || product.images?.[0] || product.image;
  return { ...product, image: resolveImageUrl(image, fallbackImage) };
}

export default function CategoryProductsScreen({ navigation, route }) {
  const category = route?.params?.category || {};
  const { addToCart } = useCart();
  const [products, setProducts] = useState(staticProducts.map(normalizeProduct));

  const handleBack = () => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Shop');
    }
  };

  useEffect(() => {
    fetchProducts()
      .then((data) => setProducts(data.map(normalizeProduct)))
      .catch((error) => {
        console.warn('Unable to load category products:', error);
        Alert.alert('Offline mode', 'Showing the local catalog.');
      });
  }, []);

  const categoryProducts = useMemo(() => {
    const categoryName = String(category.name || '').toLowerCase();
    const searchTerms = categoryName.split(' ');
    return products.filter((product) => {
      const productCategory = String(product.category || '').toLowerCase();
      return productCategory === categoryName || searchTerms.some((term) => term && productCategory.includes(term));
    });
  }, [category.name, products]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{category.name || 'Category'}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryIconWrap}><Text style={styles.categoryIcon}>{category.icon || '🐾'}</Text></View>
          <View style={styles.categoryHeaderText}>
            <Text style={styles.title}>{category.name || 'Category'}</Text>
            <Text style={styles.subtitle}>{categoryProducts.length} products available</Text>
          </View>
        </View>

        {!categoryProducts.length && <Text style={styles.empty}>No products found in this category.</Text>}
        <View style={styles.productGrid}>
          {categoryProducts.map((product) => (
            <View style={styles.productCard} key={String(product.id)}>
              <TouchableOpacity onPress={() => navigation.navigate('ProductDetails', { product })} activeOpacity={0.85}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                <Text style={styles.productMeta}>{product.subCategory || product.category}</Text>
                <Text style={styles.productPrice}>₹{Number(product.price || 0).toLocaleString()}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addButton} onPress={() => addToCart(product)}>
                <Text style={styles.addText}>Add to Cart</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomTabBar activeTab="Shop" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f9fb' },
  topBar: { height: 76, paddingHorizontal: 18, paddingTop: 26, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e7eaed' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f1f3f5', alignItems: 'center', justifyContent: 'center' },
  backIcon: { color: '#151b24', fontSize: 29, lineHeight: 29, marginBottom: -5 },
  topBarTitle: { flex: 1, marginLeft: 12, color: '#151b24', fontSize: 19, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 110 },
  categoryHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  categoryIconWrap: { width: 58, height: 58, borderRadius: 16, backgroundColor: '#fff0ea', alignItems: 'center', justifyContent: 'center' },
  categoryIcon: { fontSize: 32 },
  categoryHeaderText: { marginLeft: 14 },
  title: { color: '#18212a', fontSize: 25, fontWeight: '900' },
  subtitle: { color: '#7b858f', fontSize: 14, marginTop: 3 },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  productCard: { width: '48%', backgroundColor: '#fff', borderRadius: 14, padding: 10, marginBottom: 14, borderWidth: 1, borderColor: '#e7eaed' },
  productImage: { width: '100%', height: 145, borderRadius: 10, backgroundColor: '#f1f3f5' },
  productName: { color: '#18212a', fontSize: 14, fontWeight: '800', marginTop: 9, minHeight: 36 },
  productMeta: { color: '#8a9299', fontSize: 11, marginTop: 3 },
  productPrice: { color: '#138956', fontSize: 16, fontWeight: '900', marginTop: 7, marginBottom: 9 },
  addButton: { backgroundColor: '#ee3d78', borderRadius: 9, paddingVertical: 9, alignItems: 'center' },
  addText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  empty: { color: '#77818a', textAlign: 'center', paddingVertical: 30 },
});