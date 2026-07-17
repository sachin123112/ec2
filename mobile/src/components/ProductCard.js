import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../theme';

export default function ProductCard({ item, onAdd }) {
  return (
    <View style={styles.card}>
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageIcon}>🐶</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.category}>{item.category} · {item.subCategory}</Text>
        <View style={styles.row}>
          <Text style={styles.price}>₹{item.price.toLocaleString()}</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => onAdd(item)}>
            <Text style={styles.addText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  imagePlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: '#ece5ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  imageIcon: {
    fontSize: 32,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.typography.body,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  category: {
    color: theme.colors.muted,
    marginBottom: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: theme.typography.body,
    fontWeight: '800',
    color: theme.colors.primaryDark,
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
  },
  addText: {
    color: theme.colors.surface,
    fontWeight: '700',
  },
});
