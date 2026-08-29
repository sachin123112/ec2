import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import config from '../api/config';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

export default function ProfileScreen({ navigation }) {
  const { userEmail, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', gender: '', phone: '' });
  const [phoneError, setPhoneError] = useState('');
  const [genderOpen, setGenderOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const genderOptions = ['Male', 'Female', 'Other'];
  const profileImageUri = (imageUrl) => imageUrl && imageUrl.startsWith('http')
    ? imageUrl
    : imageUrl ? `${config.API_URL.replace('/api/v1', '')}${imageUrl}` : '';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(`${config.API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setProfile({ ...data, profileImageUrl: profileImageUri(data.profileImageUrl) });
          setForm({
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            gender: data.gender || '',
            phone: data.phone || '',
          });
        }
      } catch (error) {
        console.warn('Unable to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) loadProfile();
  }, [token]);

  const handleSave = async () => {
    const phone = form.phone.trim();
    if (phone && !/^\d{10}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit phone number.');
      return;
    }

    setPhoneError('');
    setSaving(true);
    try {
      const response = await fetch(`${config.API_URL}/users/me`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Unable to update profile');
      const data = await response.json();
      setProfile(data);
      setForm({
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        gender: data.gender || '',
        phone: data.phone || '',
      });
      setEditing(false);
    } catch (error) {
      Alert.alert('Save failed', 'Unable to update your profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission required', 'Allow photo library access to choose a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    const image = result.assets[0];
    setUploadingPhoto(true);
    try {
      const body = new FormData();
      body.append('image', {
        uri: image.uri,
        name: image.fileName || `profile-${Date.now()}.jpg`,
        type: image.mimeType || 'image/jpeg',
      });
      const response = await fetch(`${config.API_URL}/users/me/profile-image`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });
      if (!response.ok) throw new Error('Unable to upload profile photo');
      const data = await response.json();
      setProfile({ ...data, profileImageUrl: profileImageUri(data.profileImageUrl) });
    } catch (error) {
      Alert.alert('Upload failed', 'Unable to save your profile photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      firstName: profile?.firstName || '',
      lastName: profile?.lastName || '',
      gender: profile?.gender || '',
      phone: profile?.phone || '',
    });
    setPhoneError('');
    setGenderOpen(false);
    setEditing(false);
  };

  const userName = userEmail
    ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1)
    : 'Account';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Account')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileCard}>
          {profile?.profileImageUrl ? (
            <Image source={{ uri: profileImageUri(profile.profileImageUrl) }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <TouchableOpacity onPress={handlePickPhoto} disabled={uploadingPhoto}>
            <Text style={styles.photoAction}>{uploadingPhoto ? 'Uploading...' : 'Change Photo'}</Text>
          </TouchableOpacity>
          <Text style={styles.name}>{userName}</Text>
          <Text style={styles.email}>{userEmail}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          {!editing && (
            <TouchableOpacity onPress={() => setEditing(true)}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>
        {loading ? (
          <ActivityIndicator color={theme.colors.primary} />
        ) : (
          <View style={styles.infoCard}>
            <ProfileRow
              label="First Name"
              value={profile?.firstName}
              editing={editing}
              inputValue={form.firstName}
              placeholder="First name"
              onChangeText={(value) => setForm((current) => ({ ...current, firstName: value }))}
            />
            <ProfileRow
              label="Last Name"
              value={profile?.lastName}
              editing={editing}
              inputValue={form.lastName}
              placeholder="Last name"
              onChangeText={(value) => setForm((current) => ({ ...current, lastName: value }))}
            />
            <ProfileRow
              label="Email"
              value={profile?.email || userEmail}
              readOnly
            />
            <ProfileRow
              label="Gender"
              value={profile?.gender}
              editing={editing}
              inputValue={form.gender}
              placeholder="Gender"
              dropdownOpen={genderOpen}
              dropdownOptions={genderOptions}
              onToggleDropdown={() => setGenderOpen((open) => !open)}
              onSelectOption={(value) => {
                setForm((current) => ({ ...current, gender: value }));
                setGenderOpen(false);
              }}
            />
            <ProfileRow
              label="Phone"
              value={profile?.phone}
              editing={editing}
              inputValue={form.phone}
              placeholder="Phone number"
              keyboardType="phone-pad"
              maxLength={10}
              onChangeText={(value) => {
                const phone = value.replace(/\D/g, '');
                setForm((current) => ({ ...current, phone }));
                setPhoneError(phone && phone.length !== 10 ? 'Enter a valid 10-digit phone number.' : '');
              }}
              error={phoneError}
              last
            />
          </View>
        )}
        {editing && (
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit} disabled={saving}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
              <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      <BottomTabBar activeTab="Account" />
    </View>
  );
}

function ProfileRow({ label, value, last, editing, readOnly, inputValue, placeholder, keyboardType, maxLength, onChangeText, error, dropdownOpen, dropdownOptions, onToggleDropdown, onSelectOption }) {
  return (
    <View style={[styles.row, last && styles.lastRow]}>
      <Text style={styles.label}>{label}</Text>
      {editing && !readOnly && dropdownOptions ? (
        <View>
          <TouchableOpacity style={styles.dropdownButton} onPress={onToggleDropdown}>
            <Text style={inputValue ? styles.dropdownValue : styles.dropdownPlaceholder}>
              {inputValue || placeholder}
            </Text>
            <Text style={styles.dropdownArrow}>{dropdownOpen ? '⌃' : '⌄'}</Text>
          </TouchableOpacity>
          {dropdownOpen && (
            <View style={styles.dropdownMenu}>
              {dropdownOptions.map((option) => (
                <TouchableOpacity key={option} style={styles.dropdownOption} onPress={() => onSelectOption(option)}>
                  <Text style={styles.dropdownOptionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : editing && !readOnly ? (
        <TextInput
          style={styles.input}
          value={inputValue}
          placeholder={placeholder}
          keyboardType={keyboardType}
          maxLength={maxLength}
          onChangeText={onChangeText}
        />
      ) : (
        <Text style={styles.value}>{value || 'Not provided'}</Text>
      )}
      {editing && error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: {
    height: 108,
    paddingHorizontal: 18,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8defb',
  },
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#dfe3e7', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 29, lineHeight: 29, marginTop: 2 },
  title: { marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 110 },
  profileCard: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#e8defb',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },
  photoAction: { color: theme.colors.primary, fontWeight: '700', marginBottom: 12 },
  avatarText: { color: theme.colors.surface, fontSize: 36, fontWeight: '800' },
  name: { color: theme.colors.text, fontSize: 22, fontWeight: '800', marginBottom: 4 },
  email: { color: theme.colors.textSecondary, fontSize: 15 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: theme.colors.text, fontSize: 17, fontWeight: '700' },
  editText: { color: theme.colors.primary, fontWeight: '700' },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e8defb',
  },
  row: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e8defb' },
  lastRow: { borderBottomWidth: 0 },
  label: { color: theme.colors.muted, fontSize: 12, marginBottom: 4 },
  value: { color: theme.colors.text, fontSize: 16, fontWeight: '600' },
  input: {
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
  },
  dropdownButton: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
  },
  dropdownValue: { color: theme.colors.text, fontSize: 16 },
  dropdownPlaceholder: { color: theme.colors.muted, fontSize: 16 },
  dropdownArrow: { color: theme.colors.primary, fontSize: 20 },
  dropdownMenu: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    marginTop: 6,
    overflow: 'hidden',
  },
  dropdownOption: { paddingVertical: 11, paddingHorizontal: 12 },
  dropdownOptionText: { color: theme.colors.text, fontSize: 15 },
  error: { color: theme.colors.danger, fontSize: 12, marginTop: 5 },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 12 },
  cancelButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border },
  cancelText: { color: theme.colors.textSecondary, fontWeight: '700' },
  saveButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: theme.radius.md, backgroundColor: theme.colors.primary },
  saveText: { color: theme.colors.surface, fontWeight: '700' },
});
