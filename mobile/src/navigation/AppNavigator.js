import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import LandingScreen from '../screens/LandingScreen';
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import CartScreen from '../screens/CartScreen';
import CheckoutScreen from '../screens/CheckoutScreen';
import AccountScreen from '../screens/AccountScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WishlistScreen from '../screens/WishlistScreen';
import LinksScreen from '../screens/LinksScreen';
import SettingsScreen from '../screens/SettingsScreen';
import PaymentScreen from '../screens/PaymentScreen';
import OrderHistoryScreen from '../screens/OrderHistoryScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import SavedAddressesScreen from '../screens/SavedAddressesScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';
import NotificationScreen from '../screens/NotificationScreen';
import WalletScreen from '../screens/WalletScreen';
import AddGiftCardScreen from '../screens/AddGiftCardScreen';
import { useCart } from '../context/CartContext';
import theme from '../theme';

const Stack = createNativeStackNavigator();

function CartHeaderButton({ navigation }) {
  const { totalItems } = useCart();

  return (
    <TouchableOpacity style={{ padding: 6 }} onPress={() => navigation.navigate('Cart')} accessibilityLabel={`Cart${totalItems ? `, ${totalItems} items` : ''}`}>
      <Text style={{ fontSize: 22 }}>🛒</Text>
      {totalItems > 0 && (
        <View style={{ position: 'absolute', top: 0, right: 0, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9, backgroundColor: theme.colors.danger, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: theme.colors.surface, fontSize: 11, fontWeight: '800' }}>{totalItems > 99 ? '99+' : totalItems}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

function WalletHeaderButton({ navigation }) {
  return (
    <TouchableOpacity style={{ padding: 6, marginRight: 4 }} onPress={() => navigation.navigate('Wallet')} accessibilityLabel="Wallet">
      <Text style={{ fontSize: 22 }}>👛</Text>
    </TouchableOpacity>
  );
}

function HeaderActions({ navigation }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <WalletHeaderButton navigation={navigation} />
      <CartHeaderButton navigation={navigation} />
    </View>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Landing" screenOptions={({ navigation }) => ({ headerRight: () => <WalletHeaderButton navigation={navigation} /> })}>
      <Stack.Screen name="Landing" component={LandingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={({ navigation }) => ({
          title: 'PawMart',
          headerBackVisible: false,
          headerRight: () => (
            <HeaderActions navigation={navigation} />
          ),
        })}
      />
      <Stack.Screen
        name="Shop"
        component={ShopScreen}
        options={({ navigation }) => ({
          title: 'Products',
          headerRight: () => (
            <HeaderActions navigation={navigation} />
          ),
        })}
      />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart', headerStyle: { height: 84 } }} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AddGiftCard" component={AddGiftCardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Wishlist" component={WishlistScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Links" component={LinksScreen} options={{ headerShown: false }} />
      <Stack.Screen name="NotificationSettings" component={SettingsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Payments" component={PaymentScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="HelpSupport" component={HelpSupportScreen} options={{ headerShown: false }} />
      <Stack.Screen name="SavedAddresses" component={SavedAddressesScreen} options={{ headerShown: false }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationScreen} options={{ title: 'Notifications' }} />
    </Stack.Navigator>
  );
}
