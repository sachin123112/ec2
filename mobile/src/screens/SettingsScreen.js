import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import { goBackOrNavigate } from '../navigation/safeBack';
import theme from '../theme';

const initialSettings = [
  { key: 'orders', icon: '🛒', title: 'New Order Notifications', description: 'Get notified for new orders.', enabled: true },
  { key: 'stock', icon: '⚠️', title: 'Low Stock Alerts', description: 'Get notified when stock is low.', enabled: true },
  { key: 'reviews', icon: '⭐', title: 'Customer Reviews', description: 'Get notified for new reviews.', enabled: true },
  { key: 'status', icon: '📦', title: 'Order Status Updates', description: 'Get notified for order status changes.', enabled: true },
  { key: 'summary', icon: '📝', title: 'Daily Summary', description: 'Receive daily summary email.', enabled: false },
];

export default function SettingsScreen({ navigation }) {
  const [settings, setSettings] = useState(initialSettings);

  const toggleSetting = (key) => {
    setSettings((current) => current.map((setting) => (
      setting.key === key ? { ...setting, enabled: !setting.enabled } : setting
    )));
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backButton} onPress={() => goBackOrNavigate(navigation, 'Account')} accessibilityLabel="Go back">
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Notification Settings</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>General Settings</Text>
        <Text style={styles.subtitle}>Configure basic system information and preferences.</Text>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <Text style={styles.subtitle}>Choose when and how you want to be notified.</Text>

        <View style={styles.settingsList}>
          {settings.map((setting) => (
            <View style={styles.settingCard} key={setting.key}>
              <View style={styles.settingIcon}>
                <Text style={styles.iconText}>{setting.icon}</Text>
              </View>
              <View style={styles.settingCopy}>
                <Text style={styles.settingTitle}>{setting.title}</Text>
                <Text style={styles.settingDescription}>{setting.description}</Text>
              </View>
              <Switch
                value={setting.enabled}
                onValueChange={() => toggleSetting(setting.key)}
                trackColor={{ false: '#d9d9d9', true: '#9f8df1' }}
                thumbColor={setting.enabled ? theme.colors.primary : '#f4f4f4'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <BottomTabBar activeTab="Account" />
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
  backButton: { width: 34, height: 34, justifyContent: 'center', alignItems: 'center' },
  backIcon: { color: theme.colors.text, fontSize: 30, lineHeight: 30 },
  topBarTitle: { marginLeft: 8, color: theme.colors.text, fontSize: 20, fontWeight: '800' },
  content: { padding: 18, paddingBottom: 110 },
  heading: { color: theme.colors.text, fontSize: 26, fontWeight: '800', marginBottom: 4 },
  sectionTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '800', marginTop: 32, marginBottom: 4 },
  subtitle: { color: '#34517a', fontSize: 16, marginBottom: 18 },
  settingsList: { marginTop: 20 },
  settingCard: {
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: '#dfe3ea',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eef3ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  iconText: { fontSize: 25 },
  settingCopy: { flex: 1, marginRight: 12 },
  settingTitle: { color: '#101828', fontSize: 16, fontWeight: '800', marginBottom: 6 },
  settingDescription: { color: '#34517a', fontSize: 15 },
});
