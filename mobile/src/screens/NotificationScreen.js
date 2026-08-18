import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import BottomTabBar from '../components/BottomTabBar';
import theme from '../theme';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Order Confirmed',
      message: 'Your order #12345 has been confirmed',
      timestamp: '2 hours ago',
      read: false,
      type: 'order',
    },
    {
      id: 2,
      title: 'New Product Available',
      message: 'Dog Food Premium Blend is now in stock',
      timestamp: '5 hours ago',
      read: false,
      type: 'product',
    },
    {
      id: 3,
      title: 'Delivery Update',
      message: 'Your order is on the way. Expected delivery: Tomorrow',
      timestamp: '1 day ago',
      read: true,
      type: 'delivery',
    },
    {
      id: 4,
      title: 'Special Offer',
      message: 'Get 20% off on pet accessories today!',
      timestamp: '2 days ago',
      read: true,
      type: 'promo',
    },
  ]);

  const handleMarkAsRead = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleDeleteNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notif) => notif.id !== id)
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notificationCard, item.read && styles.notificationCardRead]}
      onPress={() => handleMarkAsRead(item.id)}
    >
      <View style={styles.notificationContent}>
        <Text style={[styles.notificationTitle, !item.read && styles.boldText]}>
          {item.title}
        </Text>
        <Text style={styles.notificationMessage} numberOfLines={2}>
          {item.message}
        </Text>
        <Text style={styles.notificationTime}>{item.timestamp}</Text>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteNotification(item.id)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const unreadCount = notifications.filter((notif) => !notif.read).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Notifications</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No notifications yet</Text>
            <Text style={styles.emptySubtext}>
              You'll get notified when there's an update
            </Text>
          </View>
        ) : (
          <>
            <FlatList
              data={notifications}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderNotificationItem}
              scrollEnabled={false}
            />
            {notifications.length > 0 && (
              <TouchableOpacity style={styles.clearButton} onPress={handleClearAll}>
                <Text style={styles.clearButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <BottomTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  badge: {
    backgroundColor: theme.colors.danger || '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.gray,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.card || '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationCardRead: {
    borderLeftColor: theme.colors.gray,
    opacity: 0.6,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 4,
  },
  boldText: {
    fontWeight: '700',
  },
  notificationMessage: {
    fontSize: 13,
    color: theme.colors.secondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  notificationTime: {
    fontSize: 12,
    color: theme.colors.gray,
  },
  deleteButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
  deleteButtonText: {
    fontSize: 24,
    color: theme.colors.gray,
  },
  clearButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  clearButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
