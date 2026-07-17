import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../api/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('admin@pawmart.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await loginApi(email, password);
      if (!response.ok) {
        const errorText = await response.text();
        Alert.alert('Login failed', errorText || 'Unable to login');
        return;
      }
      const data = await response.json();
      login(data.accessToken, email, data.roles || [], data.refreshToken || '');
      if (data.roles?.includes('ADMIN')) {
        navigation.replace('AdminDashboard');
      } else {
        navigation.replace('Home');
      }
    } catch (err) {
      Alert.alert('Error', 'Unable to login. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to continue shopping for your pet.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>Create account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f7f2ff' },
  heading: { fontSize: 34, fontWeight: '800', marginBottom: 10, color: '#4a2d90' },
  subtitle: { fontSize: 16, color: '#6f5ecb', marginBottom: 28 },
  input: { backgroundColor: '#fff', borderRadius: 16, padding: 16, fontSize: 16, marginBottom: 14, borderWidth: 1, borderColor: '#ede9ff' },
  button: { backgroundColor: '#6941c6', padding: 16, borderRadius: 16, alignItems: 'center', marginVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { textAlign: 'center', color: '#4a2d90', marginTop: 12, fontWeight: '700' },
});
