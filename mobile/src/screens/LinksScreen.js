import React, { useEffect, useState, useRef } from 'react';
import { Alert, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

const API_URL = 'http://localhost:8080/api/v1';

export default function LinksScreen({ navigation }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannerLoading, setBannerLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollViewRef = useRef(null);
  const autoScrollInterval = useRef(null);

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentBannerIndex((prevIndex) => (prevIndex + 1) % banners.length);
      }, 4000);
      return () => clearInterval(autoScrollInterval.current);
    }
  }, [banners]);

  const loadBanners = async () => {
    try {
      setBannerLoading(true);
      const response = await fetch(`${API_URL}/banners?page=HOME`);
      if (response.ok) {
        const data = await response.json();
        setBanners(Array.isArray(data) ? data : []);
        setCurrentBannerIndex(0);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    } finally {
      setBannerLoading(false);
    }
  };

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
        {!bannerLoading && banners.length > 0 && (
          <View style={styles.bannerCarouselContainer}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              style={styles.bannerScrollView}
              onScroll={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width);
                setCurrentBannerIndex(index);
              }}
            >
              {banners.map((banner, index) => (
                <View key={`${banner.id}-${index}`} style={styles.bannerSlide}>
                  <Image
                    source={{ uri: banner.imageUrl }}
                    style={styles.bannerImage}
                    resizeMode="cover"
                  />
                </View>
              ))}
            </ScrollView>
            
            {banners.length > 1 && (
              <View style={styles.dotsContainer}>
                {banners.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      { opacity: index === currentBannerIndex ? 1 : 0.5 }
                    ]}
                  />
                ))}
              </View>
            )}
          </View>
        )}
        
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
  backButton: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: '#dfe3e7', justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 29, lineHeight: 29, marginTop: 2 },
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
  bannerCarouselContainer: {
    marginBottom: 24,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  bannerScrollView: {
    width: '100%',
    height: 180,
  },
  bannerSlide: {
    width: '100%',
    height: 180,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
    marginHorizontal: 4,
  },
});
