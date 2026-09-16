import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
import config from '../api/config';
import { resolveImageUrl } from '../api/products';

const bannerWidth = Dimensions.get('window').width;

export default function MobilePageBanner({ page, fallback = null, height = 180 }) {
  const [banners, setBanners] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${config.API_URL}/banners?page=${page}`)
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        if (mounted) {
          setBanners(Array.isArray(data) ? data : []);
          setActiveIndex(0);
        }
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, [page]);

  useEffect(() => {
    if (banners.length < 2) return undefined;
    const timer = setInterval(() => {
      setActiveIndex(current => {
        const next = (current + 1) % banners.length;
        scrollRef.current?.scrollTo({ x: next * bannerWidth, animated: true });
        return next;
      });
    }, 4000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (!banners.length) return fallback;

  return (
    <View style={[styles.container, { height }]}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={event => setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / bannerWidth))}
      >
        {banners.map(banner => (
          <Image
            key={banner.id}
            source={{ uri: resolveImageUrl(banner.imageUrl) }}
            style={[styles.image, { height }]}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
      {banners.length > 1 && (
        <View style={styles.dots}>
          {banners.map((banner, index) => <View key={banner.id} style={[styles.dot, index === activeIndex && styles.activeDot]} />)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', overflow: 'hidden', backgroundColor: '#f1f3f5' },
  image: { width: bannerWidth },
  dots: { position: 'absolute', bottom: 10, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#fff', opacity: 0.55 },
  activeDot: { width: 18, backgroundColor: '#ffd36b', opacity: 1 },
});