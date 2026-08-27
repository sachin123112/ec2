import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function NotificationsUser() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const data = await response.json();
        setNotifications(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setNotifications([]);
        setError(err.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchNotifications();
    }
  }, [token]);

  const handleMarkAsRead = async (id) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Unable to mark notification as read (${response.status})`);
      setNotifications(prev => prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      ));
      // Notify UserDashboard to refresh notification count
      window.dispatchEvent(new CustomEvent('notification:updated'));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Unable to delete notification (${response.status})`);
      setNotifications(prev => prev.filter(notif => notif.id !== id));
      // Notify UserDashboard to refresh notification count
      window.dispatchEvent(new CustomEvent('notification:updated'));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleClearAll = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/clear-all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Unable to clear notifications (${response.status})`);
      setNotifications([]);
      // Notify UserDashboard to refresh notification count
      window.dispatchEvent(new CustomEvent('notification:updated'));
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'product':
        return '📉';
      case 'user':
        return '👤';
      case 'system':
        return '⚙️';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#2563eb';
      case 'product':
        return '#f59e0b';
      case 'user':
        return '#8b5cf6';
      case 'system':
        return '#6b7280';
      default:
        return '#3b82f6';
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <div className="notifications-title-section">
          <h2 className="notifications-title">Notifications</h2>
          {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
        </div>
        {notifications.length > 0 && (
          <button type="button" className="clear-all-btn" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      {loading && <div className="loading-state">Loading notifications...</div>}

      {error && <div className="error-state">Error: {error}</div>}

      {!loading && !error && notifications.length === 0 && (
        <div className="empty-state">
          <p>No notifications yet</p>
          <p style={{ fontSize: '12px', color: '#999' }}>You'll see updates about your orders and account here</p>
        </div>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              style={{
                borderLeftColor: getNotificationColor(notification.type),
              }}
            >
              <div className="notification-icon-wrapper">
                <span className="notification-icon">{getNotificationIcon(notification.type)}</span>
              </div>

              <div className="notification-content">
                <div className="notification-title">{notification.title}</div>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">{formatTime(notification.timestamp)}</div>
              </div>

              <div className="notification-actions">
                {!notification.read && (
                  <button
                    type="button"
                    className="notification-action-btn"
                    title="Mark as read"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    ✓
                  </button>
                )}
                <button
                  type="button"
                  className="delete-btn"
                  title="Delete"
                  onClick={() => handleDeleteNotification(notification.id)}
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
