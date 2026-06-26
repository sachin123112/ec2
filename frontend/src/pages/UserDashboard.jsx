import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function UserDashboard() {
  const { isAuthenticated, token, userEmail, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('Loading your orders...');
  const navigate = useNavigate();

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
  }, [isAuthenticated, navigate]);

  async function loadOrders() {
    try {
      const response = await fetch(`${API_URL}/orders`, { headers: authHeaders });
      if (!response.ok) {
        setStatus('Unable to fetch orders at the moment.');
        return;
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
      setStatus('Your recent orders are shown below.');
    } catch (error) {
      setStatus('Unable to load your dashboard data.');
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Customer Dashboard</h1>
          <p>Welcome back, {userEmail || 'valued customer'}.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/shop" className="btn-outline">Continue Shopping</Link>
          <button type="button" className="btn-outline" onClick={() => { logout(); navigate('/'); }}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <span>Recent Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="summary-card">
          <span>Account</span>
          <strong>{userEmail || 'No email'}</strong>
        </div>
        <div className="summary-card">
          <span>Shop Faster</span>
          <strong>Browse essentials</strong>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      <section className="dashboard-panel">
        <div className="dashboard-card wide-card">
          <h2>Your Recent Orders</h2>
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
                    <td colSpan="4">No orders found yet. Start shopping to create your first order.</td>
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
      </section>
    </div>
  );
}
