import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

function formatUserName(email) {
  if (!email) return 'Valued Customer';
  const name = email.split('@')[0].replace(/[._-]/g, ' ');
  return name
    .split(' ')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

export default function UserDashboard() {
  const { isAuthenticated, token, userEmail, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('Loading your dashboard...');
  const [activeSection, setActiveSection] = useState('profile');
  const navigate = useNavigate();

  const userName = formatUserName(userEmail);
  const authHeaders = useMemo(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate, authHeaders]);

  async function loadOrders() {
    try {
      const response = await fetch(`${API_URL}/orders`, { headers: authHeaders });
      if (!response.ok) {
        setStatus('Unable to fetch orders at the moment.');
        return;
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setStatus('Your recent activity is shown below.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to load your dashboard data.');
    }
  }

  const navItems = [
    'Overview',
    'Orders',
    'Wishlist',
    'Addresses',
    'Profile Information',
    'Payment Methods',
    'Saved Cards',
    'My Pets',
    'Notifications',
    'Help & Support',
    'Logout',
  ];

  return (
    <div className="dashboard-page profile-page">
      <div className="dashboard-header profile-header">
        <div>
          <h1>Profile Information</h1>
          <p>Manage your personal details and account information.</p>
        </div>
        <button type="button" className="btn-primary">Edit Profile</button>
      </div>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="sidebar-title">My Account</div>
          <div className="profile-nav">
            {navItems.map(item => (
              <button
                key={item}
                type="button"
                className={item === 'Profile Information' ? 'active' : ''}
                onClick={() => setActiveSection(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <main className="profile-main">
          <div className="profile-overview-card">
            <div className="profile-avatar">{userName.charAt(0).toUpperCase()}</div>
            <div>
              <p className="eyebrow">Verified Member</p>
              <h2>{userName}</h2>
              <p>{userEmail}</p>
              <p>+91 98888 12345</p>
            </div>
            <div className="profile-badge">Verified</div>
          </div>

          <div className="profile-grid">
            <section className="profile-card">
              <div className="card-header">
                <h2>Personal Information</h2>
                <button type="button" className="btn-link">Edit</button>
              </div>
              <div className="profile-detail-row">
                <span>Full Name</span>
                <strong>{userName}</strong>
              </div>
              <div className="profile-detail-row">
                <span>Email Address</span>
                <strong>{userEmail}</strong>
              </div>
              <div className="profile-detail-row">
                <span>Phone Number</span>
                <strong>+91 98888 12345</strong>
              </div>
              <div className="profile-detail-row">
                <span>Date of Birth</span>
                <strong>12 May 1995</strong>
              </div>
              <div className="profile-detail-row">
                <span>Gender</span>
                <strong>Male</strong>
              </div>
              <div className="profile-detail-row">
                <span>Joined On</span>
                <strong>28 May 2024</strong>
              </div>
            </section>

            <section className="profile-card">
              <div className="card-header">
                <h2>Default Address</h2>
                <button type="button" className="btn-link">Manage Addresses</button>
              </div>
              <div className="profile-address-card">
                <p className="profile-address-label">Home</p>
                <p>Sachin P</p>
                <p>No. 158, 1st Main, 1st 'N' Block</p>
                <p>Rajajinagar, Bengaluru</p>
                <p>Karnataka - 560010</p>
                <p>India</p>
                <p>+91 98888 12345</p>
                <div className="address-actions">
                  <button type="button" className="btn-link">Edit</button>
                  <button type="button" className="btn-danger btn-sm">Remove</button>
                </div>
              </div>
            </section>

            <section className="profile-card">
              <div className="card-header">
                <h2>Account Preferences</h2>
                <button type="button" className="btn-link">Edit</button>
              </div>
              <div className="preference-row">
                <span>Email Notifications</span>
                <strong>On</strong>
              </div>
              <div className="preference-row">
                <span>SMS Notifications</span>
                <strong>On</strong>
              </div>
              <div className="preference-row">
                <span>Marketing Emails</span>
                <strong>Off</strong>
              </div>
            </section>

            <section className="profile-card">
              <div className="card-header">
                <h2>Account Security</h2>
                <button type="button" className="btn-link">Change Password</button>
              </div>
              <div className="profile-detail-row">
                <span>Password</span>
                <strong>Strong</strong>
              </div>
              <div className="profile-detail-row">
                <span>Last Changed</span>
                <strong>28 May 2024</strong>
              </div>
              <div className="profile-detail-row">
                <span>Two-factor Authentication</span>
                <strong>Not Enabled</strong>
              </div>
              <button type="button" className="btn-outline">Enable 2FA</button>
            </section>
          </div>

          <div className="profile-summary-row">
            <div className="profile-small-card">
              <span>Secure Account</span>
              <strong>Your data is protected with 256-bit encryption</strong>
            </div>
            <div className="profile-small-card">
              <span>Privacy Protected</span>
              <strong>We never share your personal information</strong>
            </div>
            <div className="profile-small-card">
              <span>24/7 Support</span>
              <strong>Our support team is always here to help</strong>
            </div>
          </div>

          <div className="dashboard-card wide-card">
            <h2>Recent Orders</h2>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="4">No orders found yet. Continue shopping to place your first order.</td>
                    </tr>
                  ) : (
                    orders.map(order => (
                      <tr key={order.id || order.orderNumber}>
                        <td>{order.orderNumber || `#${order.id}`}</td>
                        <td>{order.status}</td>
                        <td>{order.totalAmount ? `$${Number(order.totalAmount).toFixed(2)}` : '—'}</td>
                        <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
