import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import HomeScreen from '../screens/HomeScreen';
import ShopScreen from '../screens/ShopScreen';
import CartScreen from '../screens/CartScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AdminDashboardScreen from '../screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'PawMart' }} />
      <Stack.Screen name="Shop" component={ShopScreen} options={{ title: 'Shop' }} />
      <Stack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
    </Stack.Navigator>
  );
}
