import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

export default function AccountScreen() {
  const navigation = useNavigation();
  const { userEmail, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Landing' }],
    });
  };

  const userName = userEmail ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1) : 'Account';

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.headerButton} onPress={() => goBackOrNavigate(navigation, 'Home')} accessibilityLabel="Go back">
          <Text style={styles.headerIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Account</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Cart')} accessibilityLabel="Cart">
            <Text style={styles.headerActionIcon}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <TouchableOpacity
          style={styles.profileCard}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="Open profile"
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{userName}</Text>
            <Text style={styles.email}>{userEmail}</Text>
          </View>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionsSection}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SavedAddresses')}>
            <Text style={styles.actionIcon}>📍</Text>
            <Text style={styles.actionButtonText}>Saved Addresses</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('HelpSupport')}>
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionButtonText}>Help & Support</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('OrderHistory')}>
            <Text style={styles.actionIcon}>📋</Text>
            <Text style={styles.actionButtonText}>Order History</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('OrderTracking')}>
            <Text style={styles.actionIcon}>📦</Text>
            <Text style={styles.actionButtonText}>Order Tracking</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Payments')}>
            <Text style={styles.actionIcon}>💳</Text>
            <Text style={styles.actionButtonText}>Payment Methods</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('NotificationSettings')}>
            <Text style={styles.actionIcon}>🔔</Text>
            <Text style={styles.actionButtonText}>Notification Settings</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      <BottomTabBar activeTab="Account" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 18,
    marginTop: 8,
    paddingVertical: 14,
  },
  logoutText: {
    color: theme.colors.danger,
    fontWeight: '800',
    fontSize: 15,
  },
  topBar: {
    height: 108,
    paddingHorizontal: 18,
    paddingTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e8defb',
  },
  headerButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcon: {
    color: theme.colors.text,
    fontSize: 30,
    lineHeight: 30,
  },
  headerTitle: {
    flex: 1,
    marginLeft: 8,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerActionIcon: {
    color: theme.colors.primary,
    fontSize: 22,
  },
  content: {
    flex: 1,
    paddingHorizontal: 18,
  },
  contentContainer: {
    paddingTop: 28,
    paddingBottom: 20,
  },
  heading: {
    fontSize: 27,
    fontWeight: '800',
    color: '#5933a5',
    marginBottom: 20,
  },
  profileCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  infoSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  editText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#e8defb',
  },
  detailRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e8defb',
  },
  detailRowLast: {
    paddingVertical: 12,
  },
  label: {
    fontSize: 12,
    color: theme.colors.muted,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  input: {
    color: theme.colors.text,
    fontSize: 16,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cancelText: { color: theme.colors.textSecondary, fontWeight: '700' },
  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
  },
  saveText: { color: theme.colors.surface, fontWeight: '700' },
  message: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  actionsSection: {
    marginBottom: 0,
  },
  actionButton: {
    backgroundColor: theme.colors.surface,
    minHeight: 48,
    paddingHorizontal: 14,
    borderRadius: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e8defb',
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 28,
    color: theme.colors.primary,
    fontSize: 18,
    textAlign: 'center',
    marginRight: 8,
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  chevron: {
    color: theme.colors.muted,
    fontSize: 24,
  },
});
