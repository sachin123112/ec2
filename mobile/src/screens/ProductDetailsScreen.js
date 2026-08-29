import React, { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useCart } from '../context/CartContext';
import { goBackOrNavigate } from '../navigation/safeBack';

const fallbackImage = 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=900&q=85';

export default function ProductDetailsScreen({ navigation, route }) {
  const product = route?.params?.product || {};
  const { addToCart, cart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [packOptions] = useState(['1 pack', '2 packs', '3 packs', '4 packs', '5 packs']);
  const [selectedPack, setSelectedPack] = useState('1 pack');
  const [showPackMenu, setShowPackMenu] = useState(false);
  const image = product.imageUrls?.[0] || product.images?.[0] || product.image || fallbackImage;
  const related = useMemo(() => cart.length ? cart.filter((item) => item.id !== product.id).slice(0, 4) : [], [cart, product.id]);
  const price = Number(product.price || 0);
  const stock = product.stockQuantity ?? (product.inStock === false ? 0 : 8);

  const addProduct = () => {
    for (let index = 0; index < quantity; index += 1) addToCart(product);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Shop')} accessibilityLabel="Go back"><Text style={styles.backIcon}>‹</Text></TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{product.name || 'Product Details'}</Text>
        <TouchableOpacity style={styles.favoriteButton} onPress={() => setFavorite((value) => !value)} accessibilityLabel="Favorite"><Text style={[styles.favoriteIcon, favorite && styles.favoriteActive]}>{favorite ? '♥' : '♡'}</Text></TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.heroImageWrap}><Image source={{ uri: image }} style={styles.heroImage} /><View style={styles.imageDots}><View style={styles.dotActive} /><View style={styles.dot} /><View style={styles.dot} /></View></View>
        <View style={styles.infoCard}>
          <View style={styles.badges}><Text style={styles.badge}>Open box verification</Text><Text style={styles.badgeBlue}>Best for pets</Text></View>
          <Text style={styles.name}>{product.name || 'Product'}</Text>
          <Text style={styles.description}>{product.description || `${product.category || 'Pet'} essential for everyday care, comfort and play.`}</Text>
          <View style={styles.metaRow}>
            <View style={styles.packSelectorWrap}>
              <Text style={styles.metaLabel}>Net Qty:</Text>
              <TouchableOpacity style={styles.packSelector} onPress={() => setShowPackMenu((value) => !value)} activeOpacity={0.8}>
                <Text style={styles.packSelectorText}>{selectedPack}</Text>
              </TouchableOpacity>
              {showPackMenu && (
                <View style={styles.packDropdown}>
                  {packOptions.map((option) => (
                    <TouchableOpacity
                      key={option}
                      style={[styles.packOption, selectedPack === option && styles.packOptionActive]}
                      onPress={() => {
                        setSelectedPack(option);
                        setShowPackMenu(false);
                      }}
                    >
                      <Text style={[styles.packOptionText, selectedPack === option && styles.packOptionTextActive]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <Text style={styles.stock}>{stock > 0 ? `⚡ ${stock} in stock` : 'Out of stock'}</Text>
          </View>
          <View style={styles.priceRow}><Text style={styles.price}>₹{price.toLocaleString()}</Text><Text style={styles.discount}>Premium quality</Text></View>
          <Text style={styles.mrp}>Inclusive of all taxes</Text>
        </View>
        <View style={styles.itemIncludedCard}>
          <Text style={styles.itemIncludedTitle}>Item Included</Text>
          <Text style={styles.itemIncludedValue}>{product.itemIncluded || `3 x ${product.name || 'Men’s Perfumes'}`}</Text>
        </View>
        <View style={styles.detailsCard}><Text style={styles.detailsTitle}>Product Details</Text><View style={styles.detailGrid}><View><Text style={styles.detailLabel}>Category</Text><Text style={styles.detailValue}>{product.category || 'Pet care'}</Text></View><View><Text style={styles.detailLabel}>Type</Text><Text style={styles.detailValue}>{product.subCategory || 'Everyday essential'}</Text></View><View><Text style={styles.detailLabel}>Rating</Text><Text style={styles.detailValue}>★ {product.rating || '4.8'}</Text></View><View><Text style={styles.detailLabel}>Availability</Text><Text style={styles.detailValue}>{stock > 0 ? 'In stock' : 'Unavailable'}</Text></View></View></View>
        <View style={styles.descriptionCard}><Text style={styles.detailsTitle}>Product Description</Text><Text style={styles.longDescription}>{product.description || 'Thoughtfully selected for happy, healthy pets. Check the package for care instructions and feeding guidance.'}</Text></View>
        {!!related.length && <View style={styles.relatedCard}><Text style={styles.detailsTitle}>Pair it with</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{related.map((item) => <View style={styles.relatedItem} key={String(item.id)}><Image source={{ uri: item.image || fallbackImage }} style={styles.relatedImage} /><Text style={styles.relatedName} numberOfLines={1}>{item.name}</Text></View>)}</ScrollView></View>}
      </ScrollView>
      <View style={styles.bottomBar}><TouchableOpacity style={styles.viewCartButton} onPress={() => navigation.navigate('Cart')}><Text style={styles.viewCartText}>🛒 View Cart</Text></TouchableOpacity><View style={styles.quantityControl}><TouchableOpacity onPress={() => setQuantity((value) => Math.max(1, value - 1))}><Text style={styles.quantityButton}>−</Text></TouchableOpacity><Text style={styles.quantity}>{quantity}</Text><TouchableOpacity onPress={() => setQuantity((value) => value + 1)}><Text style={styles.quantityButton}>+</Text></TouchableOpacity></View><TouchableOpacity style={styles.addButton} onPress={addProduct} disabled={stock <= 0}><Text style={styles.addButtonText}>{stock > 0 ? 'Add to Cart' : 'Unavailable'}</Text></TouchableOpacity></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f6fa' },
  topBar: { height: 84, paddingHorizontal: 18, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'flex-end', borderBottomWidth: 2, borderBottomColor: '#2d7ef7', paddingBottom: 9, paddingTop: 0 },
  backButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#f4f5f7', alignItems: 'center', justifyContent: 'center', marginBottom: -6 },
  backIcon: { color: '#111820', fontSize: 28, lineHeight: 28, marginTop: 0, marginBottom: 2 },
  topBarTitle: { flex: 1, color: '#151b24', fontSize: 17, fontWeight: '800', marginLeft: 12, marginBottom: 2 },
  favoriteButton: { width: 42, alignItems: 'center' },
  favoriteIcon: { color: '#e83c76', fontSize: 30 },
  favoriteActive: { color: '#e83c76' },
  content: { paddingBottom: 112 },
  heroImageWrap: { height: 330, backgroundColor: '#f8e9ef' },
  heroImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  imageDots: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 7 },
  dotActive: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ed3674' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  infoCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, marginTop: -18, padding: 22 },
  badges: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  badge: { color: '#24649a', backgroundColor: '#edf6fb', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, fontSize: 11 },
  badgeBlue: { color: '#1780a4', backgroundColor: '#e9f9fc', paddingHorizontal: 8, paddingVertical: 5, borderRadius: 6, fontSize: 11 },
  name: { color: '#171522', fontSize: 24, fontWeight: '900', marginBottom: 8 },
  description: { color: '#69727e', fontSize: 16, lineHeight: 24 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 },
  packSelectorWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, position: 'relative', flexShrink: 1 },
  metaLabel: { color: '#69727e', fontSize: 12, fontWeight: '600' },
  packSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 0,
    minWidth: 110,
  },
  packSelectorText: { color: '#1a2a3d', fontSize: 13, fontWeight: '800' },
  packDropdown: {
    position: 'absolute',
    top: 42,
    left: 54,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dfe7f1',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 20,
    minWidth: 140,
  },
  packOption: { paddingHorizontal: 14, paddingVertical: 10 },
  packOptionActive: { backgroundColor: '#edf4ff' },
  packOptionText: { color: '#1b2e4b', fontSize: 13, fontWeight: '700' },
  packOptionTextActive: { color: '#1a5df0' },
  stock: { color: '#138956', backgroundColor: '#eafaf1', padding: 7, borderRadius: 6, fontSize: 12, fontWeight: '800' },
  priceRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16, gap: 10 },
  price: { color: '#138956', fontSize: 28, fontWeight: '900' },
  discount: { color: '#138956', fontSize: 15, fontWeight: '800' },
  mrp: { color: '#8a929d', marginTop: 4, fontSize: 13 },
  itemIncludedCard: { backgroundColor: '#fff', marginTop: 10, paddingHorizontal: 22, paddingTop: 10, paddingBottom: 10 },
  itemIncludedTitle: { color: '#171522', fontSize: 17, fontWeight: '900', marginBottom: 2, lineHeight: 22 },
  itemIncludedValue: { color: '#171522', fontSize: 15, fontWeight: '700', lineHeight: 22 },
  detailsCard: { backgroundColor: '#fff', marginTop: 10, padding: 22 },
  detailsTitle: { color: '#171522', fontSize: 20, fontWeight: '900', marginBottom: 18 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 18, columnGap: 20 },
  detailLabel: { color: '#171522', fontWeight: '800', marginBottom: 4 },
  detailValue: { color: '#69727e', fontSize: 14 },
  descriptionCard: { backgroundColor: '#fff', marginTop: 10, padding: 22 },
  longDescription: { color: '#69727e', lineHeight: 24, fontSize: 15 },
  relatedCard: { backgroundColor: '#fff', marginTop: 10, padding: 22 },
  relatedItem: { width: 122, marginRight: 14 },
  relatedImage: { width: 122, height: 122, borderRadius: 12, backgroundColor: '#f4f5f6' },
  relatedName: { color: '#303744', fontSize: 13, fontWeight: '700', marginTop: 7 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: '#e4e8ec' },
  viewCartButton: { flex: 1, height: 54, borderWidth: 1, borderColor: '#ccd2da', borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  viewCartText: { color: '#18202b', fontSize: 16, fontWeight: '800' },
  quantityControl: { width: 105, height: 54, borderRadius: 14, backgroundColor: '#ee3d78', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  quantityButton: { color: '#fff', fontSize: 24, fontWeight: '700' },
  quantity: { color: '#fff', fontSize: 17, fontWeight: '900' },
  addButton: { flex: 1.05, height: 54, borderRadius: 14, backgroundColor: '#ee3d78', alignItems: 'center', justifyContent: 'center' },
  addButtonText: { color: '#fff', fontSize: 15, fontWeight: '900' },
});
