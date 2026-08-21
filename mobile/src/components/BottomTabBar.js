import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../theme';

const tabs = [
  { key: 'Home', label: 'Home', icon: '🏠' },
  { key: 'Shop', label: 'Products', icon: '🛍️' },
  { key: 'Wishlist', label: 'Wishlist', icon: '♡' },
  { key: 'Account', label: 'Account', icon: '👤' },
];

export default function BottomTabBar({ activeTab }) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const selected = tab.key === activeTab;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selected && styles.tabSelected]}
            onPress={() => navigation.navigate(tab.key)}
          >
            <Text style={[styles.icon, selected && styles.iconSelected]}>{tab.icon}</Text>
            <Text style={[styles.label, selected && styles.labelSelected]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 78,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
    zIndex: 10,
    elevation: 12,
    shadowColor: '#30205f',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
  },
  tabSelected: {
    backgroundColor: theme.colors.accent,
  },
  icon: {
    fontSize: 20,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  iconSelected: {
    color: theme.colors.surface,
  },
  label: {
    color: theme.colors.muted,
    fontSize: theme.typography.caption,
  },
  labelSelected: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
});
