import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Dashboard() {
  const { isAuthenticated, logout, token, hardRefresh } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const start = new Date(today);
    start.setDate(today.getDate() - 29);
    const formatInput = date => date.toISOString().slice(0, 10);
    return { startDate: formatInput(start), endDate: formatInput(today) };
  });

  const normalizeSearch = query => query.trim().toLowerCase();

  const searchText = useMemo(() => normalizeSearch(searchQuery), [searchQuery]);

  const matchesSearch = useCallback((fields) => {
    if (!searchText) return true;
    return fields.some(field => String(field || '').toLowerCase().includes(searchText));
  }, [searchText]);

  const parseDateValue = value => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const isDateInRange = useMemo(() => {
    const start = parseDateValue(dateRange.startDate);
    const end = parseDateValue(dateRange.endDate);
    if (start === null || end === null) return () => true;
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    return dateValue => {
      const date = parseDateValue(dateValue);
      if (date === null) return false;
      return date >= start && date <= endOfDay;
    };
  }, [dateRange]);

  const filteredOrders = useMemo(() => orders.filter(order => {
    const dateField = order.createdAt || order.date;
    return matchesSearch([order.id, order.orderNumber, order.customerName, order.userId, order.status, order.totalAmount]) && isDateInRange(dateField);
  }), [orders, matchesSearch, isDateInRange]);
  
  const [refreshing, setRefreshing] = useState(false);

  const authHeaderBase = useMemo(() => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  const authHeaders = useMemo(() => ({
    ...authHeaderBase,
    'Content-Type': 'application/json',
  }), [authHeaderBase]);

  const loadData = useCallback(async () => {
    try {
      const [productsRes, ordersRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers: authHeaders }),
        fetch(`${API_URL}/orders`, { headers: authHeaders }),
        fetch(`${API_URL}/categories`, { headers: authHeaders }),
      ]);
        if (productsRes.ok) {
        const productsJson = await productsRes.json();
        setProducts(productsJson);
        try {
          window.dispatchEvent(new CustomEvent('products:updated', { detail: productsJson }));
        } catch {
          // ignore in non-browser environments
        }
      }
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
    } catch (error) {
      console.error(error);
      setStatus('Unable to load dashboard data.');
    }
  }, [authHeaders]);

  const salesChartData = useMemo(() => {
    // Build last 7 days labels
    const labels = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      labels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
    }

    // Aggregate orders by day
    const ordersByDay = labels.map(() => 0);
    const revenueByDay = labels.map(() => 0);
    orders.forEach(o => {
      const date = o.createdAt ? new Date(o.createdAt) : o.date ? new Date(o.date) : null;
      if (!date) return;
      const label = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const idx = labels.indexOf(label);
      if (idx >= 0) {
        ordersByDay[idx] += 1;
        revenueByDay[idx] += parseFloat(o.totalAmount || 0);
      }
    });

    return {
      labels,
      datasets: [
        {
          label: 'Orders',
          data: ordersByDay,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.08)',
          yAxisID: 'y',
        },
        {
          label: 'Revenue',
          data: revenueByDay,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.08)',
          yAxisID: 'y1',
        },
      ],
    };
  }, [orders]);

  const topCategories = useMemo(() => ([
    { name: 'Dogs', value: 2, color: '#2563eb' },
    { name: 'Fish', value: 3, color: '#10b981' },
    { name: 'Plants', value: 4, color: '#f59e0b' },
    { name: 'Birds', value: 5, color: '#a78bfa' },
    { name: 'Pet Food', value: 6, color: '#f472b6' },
    { name: 'Fish Food', value: 3, color: '#14b8a6' },
    { name: 'Aquarium', value: 34, color: '#facc15' },
  ]), []);

  const donutData = useMemo(() => ({
    labels: topCategories.map(item => item.name),
    datasets: [
      {
        data: topCategories.map(item => item.value),
        backgroundColor: topCategories.map(item => item.color),
        borderWidth: 0,
      },
    ],
  }), [topCategories]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate, loadData]);

  


  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening in your store today.</p>
        </div>
        <div className="dashboard-header-center">
          <input
            className="search-input"
            placeholder="Search for products, orders, categories..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="dashboard-header-controls">
          <div className="date-range">
            <input
              type="date"
              className="date-input"
              value={dateRange.startDate}
              onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            />
            <span>–</span>
            <input
              type="date"
              className="date-input"
              value={dateRange.endDate}
              onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
        <div className="dashboard-header-user">
          <button type="button" className="notification-btn" aria-label="Notifications" title="Notifications">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" stroke="#0f172a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
            <span className="notif-badge">3</span>
          </button>

          <div className="user-menu" role="group" aria-label="User menu">
            <div className="avatar-circle">A</div>
            <div className="user-info">
              <div className="user-name">Admin</div>
              <div className="user-role">Super Admin</div>
            </div>
          </div>
        </div>
        <div className="dashboard-actions-right">
          <button
            type="button"
            className="btn-icon"
            onClick={async () => {
              setRefreshing(true);
              try {
                await hardRefresh();
                setStatus('Session refreshed successfully.');
              } catch (error) {
                console.error(error);
                setStatus('Unable to refresh session. Please log in again.');
                logout();
                navigate('/login');
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
            aria-label="Hard refresh"
            title="Hard refresh"
          >
            {refreshing ? (
              <svg className="refresh-icon spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 10-2.62 6.06" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v6h-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 10-2.62 6.06" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v6h-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button type="button" className="btn-outline" onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <span>Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="summary-card">
          <span>Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="summary-card">
          <span>Categories</span>
          <strong>{categories.length}</strong>
        </div>
      </div>

      <div className="dashboard-main-grid bottom-row">
        <div className="recent-orders-card dashboard-card">
          <div className="section-header">
            <h3>Recent Orders</h3>
            <a className="view-all" href="#">View All Orders</a>
          </div>
          <div className="recent-orders-body">
            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                {orders.length === 0
                  ? 'No orders found. Orders will appear here once customers place them.'
                  : 'No orders match the current search or date range. Adjust your filters to see results.'}
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.slice(0,6).map(o => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>{o.customerName || o.userId}</td>
                        <td>{o.totalAmount}</td>
                        <td>{o.status}</td>
                        <td>{o.createdAt || o.date || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="quick-actions-card dashboard-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="action-tile" onClick={() => navigate('/admin/products')}>
              <div className="tile-icon"> 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Add Product</div>
            </button>
            <button className="action-tile" onClick={() => navigate('/admin/categories')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M3 12h18M3 17h18" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Manage Categories</div>
            </button>
            <button className="action-tile" onClick={() => navigate('/admin/roles')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3a4 4 0 014 4v3h1a2 2 0 012 2v2a2 2 0 01-2 2h-1v3a4 4 0 01-4 4 4 4 0 01-4-4v-3H7a2 2 0 01-2-2v-2a2 2 0 012-2h1V7a4 4 0 014-4z" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Manage Roles</div>
            </button>
            <button className="action-tile" onClick={() => navigate('/admin/users')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 6a4 4 0 100 8 4 4 0 000-8zm0 10c-4.418 0-8 1.79-8 4v1h16v-1c0-2.21-3.582-4-8-4z" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Manage Users</div>
            </button>
            <button className="action-tile" onClick={() => navigate('/admin/links')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 13a5 5 0 007.5-4.33M14 11l-1.5 1.5M12 7l-1.5 1.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M8.5 14.5a4 4 0 010-5.5" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Manage Links</div>
            </button>
            <button className="action-tile" onClick={() => navigate('/admin/orders')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3v4M8 3v4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Manage Orders</div>
            </button>
            <button className="action-tile" onClick={() => navigate('/reports')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 3v18h18" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 8l-6 3-6-3-6 3" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Generate Report</div>
            </button>
            <button className="action-tile" onClick={() => navigate('/settings')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 013.3 16.88l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.21 3.3A2 2 0 016.04 1.17l.06.06A1.65 1.65 0 008 1.56c.5 0 .96.19 1.31.53.35.34.59.79.59 1.31V4a2 2 0 004 0v-.09c0-.52.24-.97.59-1.31.35-.34.81-.53 1.31-.53.51 0 .97.19 1.31.53l.06-.06A2 2 0 0119.79 3.3l-.06.06a1.65 1.65 0 00-.33 1.82c.16.5.51.92 1 1.2.49.28.85.78.85 1.35v.09a1.65 1.65 0 001 1.51c.4.24.75.55 1 1z" stroke="#475569" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">System Settings</div>
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        <div className="sales-card dashboard-card">
          <div className="section-header">
            <h3>Sales Overview</h3>
            <select className="period-select">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="chart-placeholder">
            <Line
              data={salesChartData}
              options={{
                responsive: true,
                interaction: { mode: 'index', intersect: false },
                stacked: false,
                scales: {
                  y: { type: 'linear', display: true, position: 'left' },
                  y1: { type: 'linear', display: false, position: 'right' },
                },
                plugins: { legend: { position: 'top' } },
              }}
            />
          </div>
        </div>

        <div className="top-categories-card dashboard-card">
          <div className="top-categories-header">
            <div className="top-categories-title">
              <span className="category-badge">📊</span>
              <div>
                <h3>Top Categories</h3>
                <p>Overview of product categories</p>
              </div>
            </div>
            <button type="button" className="top-categories-action">
              View All <span className="chevron">›</span>
            </button>
          </div>

          <div className="top-categories-body">
            <div className="top-categories-chart">
              <div className="donut-chart-shell">
                <Doughnut
                  data={donutData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '70%',
                    rotation: -90,
                    plugins: {
                      legend: { display: false },
                      tooltip: { enabled: true },
                    },
                  }}
                />
                <div className="donut-center-label">
                  <strong>26</strong>
                  <span>Categories</span>
                </div>
              </div>
            </div>

            <div className="top-categories-legend">
              <ul>
                {topCategories.map(item => (
                  <li key={item.name}>
                    <span className="legend-badge" style={{ background: item.color }} />
                    <span className="legend-label">{item.name}</span>
                    <span className="legend-value">{item.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="top-categories-footer">
            <div className="footer-left">
              <span className="trend-icon">📈</span>
              <span>Top category is <strong>Dogs</strong></span>
            </div>
            <div className="footer-right">
              <span className="trend-pill">📈 20%</span>
              <span className="footer-note">from last 30 days</span>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>


      <section className="dashboard-panel">
        {/* Link management moved to separate admin page: /admin/links */}
      </section>
    </div>
  );
}
