import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }} edges={['top', 'left', 'right']}>
        <NavigationContainer>
          <AuthProvider>
            <CartProvider>
              <AppNavigator />
            </CartProvider>
          </AuthProvider>
          <StatusBar hidden />
        </NavigationContainer>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
