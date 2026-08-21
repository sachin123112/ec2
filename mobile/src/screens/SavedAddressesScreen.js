import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import config from '../api/config';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

const emptyForm = { label: '', name: '', addressLine1: '', city: '', state: '', postalCode: '', country: '', phone: '' };

export default function SavedAddressesScreen({ navigation }) {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch(`${config.API_URL}/users/me/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Unable to load addresses');
        const data = await response.json();
        setAddresses(Array.isArray(data) ? data : []);
      } catch (error) {
        Alert.alert('Unable to load addresses', 'Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) loadAddresses();
  }, [token]);

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.addressLine1.trim() || !form.city.trim() || !form.postalCode.trim()) {
      Alert.alert('Missing details', 'Name, address, city, and postal code are required.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(`${config.API_URL}/users/me/addresses`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...form, isDefault: addresses.length === 0 }),
      });
      if (!response.ok) throw new Error('Unable to save address');
      const address = await response.json();
      setAddresses((current) => [...current, address]);
      setForm(emptyForm);
      setAdding(false);
    } catch (error) {
      Alert.alert('Save failed', 'Unable to save this address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Account')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Saved Addresses</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Your Addresses</Text>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : addresses.length === 0 && !adding ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📍</Text>
            <Text style={styles.emptyTitle}>No saved addresses</Text>
            <Text style={styles.emptyText}>Add an address for faster checkout.</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <View style={styles.addressCard} key={String(address.id || address.addressLine1)}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressLabel}>{address.label || 'Address'}</Text>
                {address.isDefault && <Text style={styles.defaultBadge}>Default</Text>}
              </View>
              <Text style={styles.addressName}>{address.name}</Text>
              <Text style={styles.addressText}>{address.addressLine1}</Text>
              <Text style={styles.addressText}>{[address.city, address.state, address.postalCode].filter(Boolean).join(', ')}</Text>
              {address.phone && <Text style={styles.addressText}>{address.phone}</Text>}
            </View>
          ))
        )}

        {adding && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add Address</Text>
            <TextInput style={styles.input} placeholder="Label (Home, Work)" value={form.label} onChangeText={(value) => updateField('label', value)} />
            <TextInput style={styles.input} placeholder="Full name *" value={form.name} onChangeText={(value) => updateField('name', value)} />
            <TextInput style={styles.input} placeholder="Address line 1 *" value={form.addressLine1} onChangeText={(value) => updateField('addressLine1', value)} />
            <TextInput style={styles.input} placeholder="City *" value={form.city} onChangeText={(value) => updateField('city', value)} />
            <TextInput style={styles.input} placeholder="State" value={form.state} onChangeText={(value) => updateField('state', value)} />
            <TextInput style={styles.input} placeholder="Postal code *" value={form.postalCode} keyboardType="number-pad" onChangeText={(value) => updateField('postalCode', value)} />
            <TextInput style={styles.input} placeholder="Country" value={form.country} onChangeText={(value) => updateField('country', value)} />
            <TextInput style={styles.input} placeholder="Phone" value={form.phone} keyboardType="phone-pad" onChangeText={(value) => updateField('phone', value)} />
            <View style={styles.formActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => { setForm(emptyForm); setAdding(false); }} disabled={saving}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save Address'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {!adding && (
          <TouchableOpacity style={styles.addButton} onPress={() => setAdding(true)}>
            <Text style={styles.addButtonText}>+ Add New Address</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <BottomTabBar activeTab="Account" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { height: 108, paddingHorizontal: 18, paddingTop: 40, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb' },
  backButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 30, lineHeight: 30 },
  topBarTitle: { marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 110 },
  heading: { color: theme.colors.primaryDark, fontSize: 27, fontWeight: '800', marginBottom: 18 },
  emptyCard: { backgroundColor: theme.colors.surface, borderRadius: 18, padding: 28, alignItems: 'center', borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
  emptyIcon: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 6 },
  emptyText: { color: theme.colors.textSecondary, textAlign: 'center' },
  addressCard: { backgroundColor: theme.colors.surface, borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: theme.colors.border },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addressLabel: { color: theme.colors.primaryDark, fontSize: 16, fontWeight: '800' },
  defaultBadge: { color: '#15803d', backgroundColor: '#dcfce7', borderRadius: 12, paddingHorizontal: 9, paddingVertical: 4, fontSize: 12, fontWeight: '700', overflow: 'hidden' },
  addressName: { color: theme.colors.text, fontWeight: '700', marginBottom: 4 },
  addressText: { color: theme.colors.textSecondary, lineHeight: 21 },
  formCard: { backgroundColor: theme.colors.surface, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 12 },
  formTitle: { color: theme.colors.text, fontSize: 18, fontWeight: '800', marginBottom: 14 },
  input: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 12, fontSize: 15, marginBottom: 10 },
  formActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },
  cancelButton: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 11 },
  cancelText: { color: '#475569', fontWeight: '700' },
  saveButton: { backgroundColor: theme.colors.primary, borderRadius: 8, padding: 11 },
  saveText: { color: theme.colors.surface, fontWeight: '700' },
  addButton: { alignItems: 'center', borderWidth: 1, borderColor: '#b8c7dc', borderRadius: 8, padding: 13, marginTop: 6 },
  addButtonText: { color: '#1d4f91', fontWeight: '700' },
});
