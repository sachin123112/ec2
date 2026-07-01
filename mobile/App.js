import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
