import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

export default function LinksScreen({ navigation }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);

  const handleAddLink = () => {
    const trimmedName = name.trim();
    const trimmedUrl = url.trim();
    if (!trimmedName || !trimmedUrl) {
      Alert.alert('Missing details', 'Enter a name and URL for the link.');
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(trimmedUrl) ? trimmedUrl : `https://${trimmedUrl}`;
    setLinks((current) => [...current, { id: `${Date.now()}`, name: trimmedName, url: normalizedUrl }]);
    setName('');
    setUrl('');
  };

  const handleRemoveLink = (id) => {
    setLinks((current) => current.filter((link) => link.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Account')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Links</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Links</Text>
        <Text style={styles.subtitle}>Create and manage useful links.</Text>

        <TextInput
          style={styles.input}
          placeholder="Link name"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="https://example.com"
          value={url}
          autoCapitalize="none"
          keyboardType="url"
          onChangeText={setUrl}
        />
        <TouchableOpacity style={styles.addButton} onPress={handleAddLink}>
          <Text style={styles.addButtonText}>Add Link</Text>
        </TouchableOpacity>

        {links.map((link) => (
          <View style={styles.linkCard} key={link.id}>
            <TouchableOpacity style={styles.linkDetails} onPress={() => Linking.openURL(link.url)}>
              <Text style={styles.linkName}>{link.name}</Text>
              <Text style={styles.linkUrl} numberOfLines={1}>{link.url}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemoveLink(link.id)} accessibilityLabel={`Remove ${link.name}`}>
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <BottomTabBar activeTab="Account" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  topBar: { height: 76, paddingHorizontal: 18, paddingTop: 8, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#e8defb' },
  backButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 30, lineHeight: 30 },
  topBarTitle: { marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: theme.spacing.lg, paddingBottom: 110 },
  heading: { fontSize: 28, fontWeight: '800', color: theme.colors.primaryDark, marginBottom: 6 },
  subtitle: { color: theme.colors.textSecondary, fontSize: 16, marginBottom: 22 },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: 20,
  },
  addButtonText: { color: theme.colors.surface, fontWeight: '700', fontSize: 16 },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    marginBottom: 10,
  },
  linkDetails: { flex: 1, marginRight: 12 },
  linkName: { color: theme.colors.text, fontWeight: '700', fontSize: 16, marginBottom: 4 },
  linkUrl: { color: theme.colors.textSecondary },
  removeText: { color: theme.colors.danger, fontWeight: '700' },
});
