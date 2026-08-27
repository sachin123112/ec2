import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function NotificationsAdmin() {
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
      // Notify Dashboard to refresh notification count
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
      // Notify Dashboard to refresh notification count
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
      // Notify Dashboard to refresh notification count
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
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order':
        return '#3b82f6';
      case 'product':
        return '#f59e0b';
      case 'user':
        return '#10b981';
      case 'system':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else if (days < 7) {
      return `${days}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="admin-page">
      <div className="notifications-header">
        <div className="notifications-title">
          <h2>Notifications</h2>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>
        {notifications.length > 0 && (
          <button
            className="clear-all-btn"
            onClick={handleClearAll}
            title="Clear all notifications"
          >
            Clear All
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Loading notifications...</p>
        </div>
      ) : error && notifications.length === 0 ? (
        <div className="error-state">
          <p>⚠️ Using demo notifications (API connection failed)</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p>No notifications</p>
          <p className="empty-subtext">You're all caught up!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`notification-item ${notification.read ? 'read' : 'unread'}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <div className="notification-icon-wrapper">
                <div
                  className="notification-icon"
                  style={{ backgroundColor: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
              </div>

              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-time">
                  {formatTime(notification.timestamp)}
                </div>
              </div>

              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNotification(notification.id);
                }}
                title="Delete notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
