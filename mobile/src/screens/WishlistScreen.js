import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

export default function WishlistScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Home')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Wishlist</Text>
        <TouchableOpacity style={styles.cartButton} onPress={() => navigation.navigate('Cart')} accessibilityLabel="Cart">
          <Text style={styles.cartIcon}>🛒</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <Text style={styles.heading}>Wishlist</Text>
        <Text style={styles.empty}>Your wishlist is empty.</Text>
      </View>
      <BottomTabBar activeTab="Wishlist" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { height: 108, paddingHorizontal: 18, paddingTop: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb' },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#dfe3e7', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 29, lineHeight: 29, marginTop: 2 },
  topBarTitle: { flex: 1, marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  cartButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  cartIcon: { fontSize: 22 },
  content: { flex: 1, padding: theme.spacing.lg },
  heading: { fontSize: 28, fontWeight: '800', color: theme.colors.primaryDark, marginBottom: 16 },
  empty: { color: theme.colors.textSecondary, fontSize: 16 },
});
