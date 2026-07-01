import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { signup as signupApi } from '../api/auth';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!fullName || !email || !password || password !== confirmPassword) {
      Alert.alert('Invalid data', 'Please fill all fields and ensure passwords match.');
      return;
    }

    setLoading(true);
    const names = fullName.split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';

    try {
      const response = await signupApi({
        username: email.split('@')[0],
        email,
        password,
        firstName,
        lastName,
      });
      if (!response.ok) {
        Alert.alert('Sign up failed', await response.text());
        return;
      }
      const data = await response.json();
      login(data.accessToken, email, data.roles || [], data.refreshToken || '');
      navigation.replace('Home');
    } catch (err) {
      Alert.alert('Error', 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create Account</Text>
      <TextInput style={styles.input} placeholder="Full name" value={fullName} onChangeText={setFullName} />
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <TextInput style={styles.input} placeholder="Confirm password" secureTextEntry value={confirmPassword} onChangeText={setConfirmPassword} />
      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Already have an account? Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#fff' },
  heading: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12, marginBottom: 12 },
  button: { backgroundColor: '#2d6cdf', padding: 14, borderRadius: 10, alignItems: 'center', marginVertical: 12 },
  buttonText: { color: '#fff', fontWeight: '700' },
  link: { textAlign: 'center', color: '#2d6cdf', marginTop: 12 },
});
