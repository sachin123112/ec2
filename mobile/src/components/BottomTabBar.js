import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import theme from '../theme';

const tabs = [
  { key: 'Home', label: 'Home', icon: '🏠' },
  { key: 'Shop', label: 'Shop', icon: '🛍️' },
  { key: 'Cart', label: 'Cart', icon: '🛒' },
  { key: 'Notifications', label: 'Notifications', icon: '🔔' },
  { key: 'Dashboard', label: 'Dashboard', icon: '📊' },
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
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
