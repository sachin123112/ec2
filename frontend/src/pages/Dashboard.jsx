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
  const [tab, setTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [roles, setRoles] = useState([]);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [links, setLinks] = useState([]);
  const [status, setStatus] = useState('');

  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', roleId: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', categoryId: '' });
  const [productImages, setProductImages] = useState([]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [orderForm, setOrderForm] = useState({ userId: '', totalAmount: '0.00', status: 'PENDING' });
  const [linkForm, setLinkForm] = useState({ label: '', url: '', description: '', isActive: true });
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      const [usersRes, productsRes, ordersRes, categoriesRes, rolesRes, linksRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: authHeaders }),
        fetch(`${API_URL}/products`, { headers: authHeaders }),
        fetch(`${API_URL}/orders`, { headers: authHeaders }),
        fetch(`${API_URL}/categories`, { headers: authHeaders }),
        fetch(`${API_URL}/roles`, { headers: authHeaders }),
        fetch(`${API_URL}/links`, { headers: authHeaders }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (linksRes.ok) setLinks(await linksRes.json());
      setStatus('Data loaded successfully.');
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

  const donutData = useMemo(() => {
    const labels = categories.map(c => c.name || `Cat ${c.id}`);
    const data = categories.map((c, i) => {
      const seed = (c && c.id) ? Number(c.id) : i;
      return (Math.abs(seed) % 20) + 1;
    });
    const colors = ['#2563eb','#10b981','#f59e0b','#a78bfa','#f472b6'];
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
        },
      ],
    };
  }, [categories]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate, loadData]);

  useEffect(() => {
    return () => {
      productImagePreviews.forEach(URL.revokeObjectURL);
    };
  }, [productImagePreviews]);

  function handleProductImageSelection(event) {
    const files = Array.from(event.target.files || []);
    setProductImages(files);
    setProductImagePreviews(prev => {
      prev.forEach(URL.revokeObjectURL);
      return files.map(file => URL.createObjectURL(file));
    });
  }

  function removeProductImage(index) {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setProductImagePreviews(prev => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleCreateUser(event) {
    event.preventDefault();
    setStatus('Creating user...');

    const payload = {
      username: userForm.username,
      email: userForm.email,
      password: userForm.password,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      roleIds: userForm.roleId ? [parseInt(userForm.roleId, 10)] : [],
    };

    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setUserForm({ username: '', email: '', password: '', firstName: '', lastName: '', roleId: '' });
      await loadData();
      setStatus('User created successfully.');
    } else {
      setStatus('Unable to create user.');
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setStatus('Creating product...');

    const payload = {
      name: productForm.name,
      description: productForm.description,
      sku: productForm.sku,
      price: parseFloat(productForm.price) || 0,
      stockQuantity: parseInt(productForm.stockQuantity, 10) || 0,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId, 10) : null,
    };

    let response;
    if (productImages.length > 0) {
      const formData = new FormData();
      formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      if (payload.sku) formData.append('sku', payload.sku);
      formData.append('price', payload.price.toString());
      formData.append('stockQuantity', payload.stockQuantity.toString());
      if (payload.categoryId !== null) formData.append('categoryId', payload.categoryId.toString());
      productImages.forEach(file => formData.append('images', file));

      response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: authHeaderBase,
        body: formData,
      });
    } else {
      response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
    }

    if (response.ok) {
      setProductForm({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', categoryId: '' });
      setProductImages([]);
      setProductImagePreviews(prev => {
        prev.forEach(URL.revokeObjectURL);
        return [];
      });
      await loadData();
      setStatus('Product added successfully.');
    } else {
      setStatus('Unable to create product.');
    }
  }

  async function handleCreateCategory(event) {
    event.preventDefault();
    setStatus('Creating category...');
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: categoryForm.name }),
    });
    if (response.ok) {
      setCategoryForm({ name: '' });
      await loadData();
      setStatus('Category created successfully.');
    } else {
      setStatus('Unable to create category.');
    }
  }

  async function handleCreateOrder(event) {
    event.preventDefault();
    setStatus('Creating order...');

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: parseInt(orderForm.userId, 10),
        totalAmount: parseFloat(orderForm.totalAmount) || 0,
        status: orderForm.status,
      }),
    });

    if (response.ok) {
      setOrderForm({ userId: '', totalAmount: '0.00', status: 'PENDING' });
      await loadData();
      setStatus('Order created successfully.');
    } else {
      setStatus('Unable to create order.');
    }
  }

  async function handleDeleteUser(id) {
    setStatus('Deleting user...');
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('User deleted successfully.');
    } else {
      setStatus('Unable to delete user.');
    }
  }

  async function handleDeleteRole(id) {
    setStatus('Deleting role...');
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Role deleted successfully.');
    } else {
      setStatus('Unable to delete role.');
    }
  }

  async function handleDeleteProduct(id) {
    setStatus('Deleting product...');
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Product deleted successfully.');
    } else {
      setStatus('Unable to delete product.');
    }
  }

  async function handleDeleteCategory(id) {
    setStatus('Deleting category...');
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Category deleted successfully.');
    } else {
      setStatus('Unable to delete category.');
    }
  }

  async function handleDeleteOrder(id) {
    setStatus('Deleting order...');
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Order deleted successfully.');
    } else {
      setStatus('Unable to delete order.');
    }
  }

  async function handleCreateLink(event) {
    event.preventDefault();
    setStatus('Creating link...');

    const response = await fetch(`${API_URL}/links`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(linkForm),
    });

    if (response.ok) {
      setLinkForm({ label: '', url: '', description: '', isActive: true });
      await loadData();
      setStatus('Link created successfully.');
    } else {
      setStatus('Unable to create link.');
    }
  }

  async function handleDeleteLink(id) {
    setStatus('Deleting link...');
    const response = await fetch(`${API_URL}/links/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Link deleted successfully.');
    } else {
      setStatus('Unable to delete link.');
    }
  }

  function openDeleteModal(entity, id, label) {
    setDeleteTarget({ entity, id, label });
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { entity, id } = deleteTarget;
    setShowDeleteModal(false);

    switch (entity) {
      case 'user':
        await handleDeleteUser(id);
        break;
      case 'role':
        await handleDeleteRole(id);
        break;
      case 'product':
        await handleDeleteProduct(id);
        break;
      case 'category':
        await handleDeleteCategory(id);
        break;
      case 'order':
        await handleDeleteOrder(id);
        break;
      case 'link':
        await handleDeleteLink(id);
        break;
      default:
        break;
    }
    setDeleteTarget(null);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Dashboard Overview</h1>
          <p>Welcome back! Here's what's happening in your store today.</p>
        </div>
        <div className="dashboard-header-center">
          <input className="search-input" placeholder="Search for products, orders, users..." />
        </div>
        <div className="dashboard-header-controls">
          <div className="date-range">30 Jun 2026 - 30 Jun 2026</div>
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
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>
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

        <div className="categories-card dashboard-card">
          <div className="section-header">
            <h3>Top Categories</h3>
            <a className="view-all" href="#">View All</a>
          </div>
          <div className="categories-content">
            <div className="donut-placeholder">
              <Doughnut data={donutData} options={{ maintainAspectRatio: true, plugins: { legend: { position: 'right' } } }} />
            </div>
            <ul className="categories-list">
              {categories.slice(0,5).map((c, i) => (
                <li key={c.id}>
                  <span className="legend-dot" style={{ background: ['#2563eb','#10b981','#f59e0b','#a78bfa','#f472b6'][i % 5] }} />
                  <span className="cat-name">{c.name}</span>
                  <span className="cat-count">{donutData?.datasets?.[0]?.data?.[i] ?? 0}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid bottom-row">
        <div className="recent-orders-card dashboard-card">
          <div className="section-header">
            <h3>Recent Orders</h3>
            <a className="view-all" href="#">View All Orders</a>
          </div>
          <div className="recent-orders-body">
            {orders.length === 0 ? (
              <div className="empty-state">No orders found. Orders will appear here once customers place them.</div>
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
                    {orders.slice(0,6).map(o => (
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
            <button className="action-tile" onClick={() => setTab('products')}>
              <div className="tile-icon"> 
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Add Product</div>
            </button>
            <button className="action-tile" onClick={() => setTab('categories')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18M3 12h18M3 17h18" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Add Category</div>
            </button>
            <button className="action-tile" onClick={() => setTab('users')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">Add User</div>
            </button>
            <button className="action-tile" onClick={() => setTab('orders')}>
              <div className="tile-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3v4M8 3v4" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="tile-label">View Orders</div>
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

      <div className="dashboard-actions">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'roles' ? 'active' : ''} onClick={() => setTab('roles')}>Roles</button>
        <button className={tab === 'links' ? 'active' : ''} onClick={() => setTab('links')}>Links</button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
        <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Categories</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
      </div>

      <div className="dashboard-status">{status}</div>

      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Delete {deleteTarget.entity} <strong>{deleteTarget.label}</strong>?</p>
            <div className="modal-actions">
              <button className="btn-outline" type="button" onClick={closeDeleteModal}>Cancel</button>
              <button className="btn-danger" type="button" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <section className="dashboard-panel">
        {tab === 'users' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Create User</h2>
                <form onSubmit={handleCreateUser} className="panel-form">
                  <label>
                    Username
                    <input value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required />
                  </label>
                  <label>
                    Email
                    <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required />
                  </label>
                  <label>
                    Password
                    <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
                  </label>
                  <label>
                    Role
                    <select value={userForm.roleId} onChange={e => setUserForm({...userForm, roleId: e.target.value})} required>
                      <option value="">Select role</option>
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>{role.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    First Name
                    <input value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} />
                  </label>
                  <label>
                    Last Name
                    <input value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} />
                  </label>
                  <button type="submit" className="btn-primary">Add User</button>
                </form>
              </div>

              <div className="dashboard-card wide-card">
                <h2>User List</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td>{user.roles?.join(', ')}</td>
                          <td>{user.status}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('user', user.id, user.email)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'roles' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Add Role</h2>
                <form onSubmit={async event => {
                  event.preventDefault();
                  setStatus('Creating role...');
                  const response = await fetch(`${API_URL}/roles`, {
                    method: 'POST',
                    headers: authHeaders,
                    body: JSON.stringify({ name: roleForm.name, description: roleForm.description }),
                  });
                  if (response.ok) {
                    setRoleForm({ name: '', description: '' });
                    await loadData();
                    setStatus('Role created successfully.');
                  } else {
                    setStatus('Unable to create role.');
                  }
                }} className="panel-form">
                  <label>
                    Name
                    <input value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} required />
                  </label>
                  <label>
                    Description
                    <textarea value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})} rows={4} />
                  </label>
                  <button type="submit" className="btn-primary">Save Role</button>
                </form>
              </div>

              <div className="dashboard-card wide-card">
                <h2>Role List</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {roles.map(role => (
                        <tr key={role.id}>
                          <td>{role.id}</td>
                          <td>{role.name}</td>
                          <td>{role.description}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('role', role.id, role.name)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
        {tab === 'links' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Add Link</h2>
                <form onSubmit={handleCreateLink} className="panel-form">
                  <label>
                    Label
                    <input value={linkForm.label} onChange={e => setLinkForm({...linkForm, label: e.target.value})} required />
                  </label>
                  <label>
                    URL
                    <input type="url" value={linkForm.url} onChange={e => setLinkForm({...linkForm, url: e.target.value})} required />
                  </label>
                  <label>
                    Description
                    <textarea value={linkForm.description} onChange={e => setLinkForm({...linkForm, description: e.target.value})} rows={4} />
                  </label>
                  <label>
                    Active
                    <select value={linkForm.isActive ? 'true' : 'false'} onChange={e => setLinkForm({...linkForm, isActive: e.target.value === 'true'})}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </label>
                  <button type="submit" className="btn-primary">Save Link</button>
                </form>
              </div>

              <div className="dashboard-card wide-card">
                <h2>Link List</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Label</th>
                        <th>URL</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {links.map(link => (
                        <tr key={link.id}>
                          <td>{link.id}</td>
                          <td>{link.label}</td>
                          <td><a href={link.url} target="_blank" rel="noreferrer">Open</a></td>
                          <td>{link.isActive ? 'Active' : 'Inactive'}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('link', link.id, link.label)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'products' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Add Product</h2>
                <form onSubmit={handleCreateProduct} className="panel-form">
                  <label>
                    Name
                    <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                  </label>
                  <label>
                    SKU
                    <input value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} required />
                  </label>
                  <label>
                    Category
                    <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})}>
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Price
                    <input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                  </label>
                  <label>
                    Stock
                    <input type="number" value={productForm.stockQuantity} onChange={e => setProductForm({...productForm, stockQuantity: e.target.value})} required />
                  </label>
                  <label>
                    Description
                    <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={4} />
                  </label>
                  <label>
                    Product Images
                    <input type="file" accept="image/*" multiple onChange={handleProductImageSelection} />
                  </label>
                  {productImagePreviews.length > 0 && (
                    <div className="image-preview-grid">
                      {productImagePreviews.map((src, index) => (
                        <div key={index} className="image-preview-card">
                          <img src={src} alt={`Preview ${index + 1}`} />
                          <button type="button" className="btn-outline btn-sm" onClick={() => removeProductImage(index)}>
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <button type="submit" className="btn-primary">Save Product</button>
                </form>
              </div>

              <div className="dashboard-card wide-card">
                <h2>Product Catalog</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td>{product.id}</td>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>{product.price}</td>
                          <td>{product.stockQuantity}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('product', product.id, product.name)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'categories' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Add Category</h2>
                <form onSubmit={handleCreateCategory} className="panel-form">
                  <label>
                    Name
                    <input value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
                  </label>
                  <button type="submit" className="btn-primary">Save Category</button>
                </form>
              </div>

              <div className="dashboard-card wide-card">
                <h2>Category List</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id}>
                          <td>{cat.id}</td>
                          <td>{cat.name}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('category', cat.id, cat.name)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'orders' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Track / Add Order</h2>
                <form onSubmit={handleCreateOrder} className="panel-form">
                  <label>
                    User ID
                    <input type="number" value={orderForm.userId} onChange={e => setOrderForm({...orderForm, userId: e.target.value})} required />
                  </label>
                  <label>
                    Total Amount
                    <input type="number" step="0.01" value={orderForm.totalAmount} onChange={e => setOrderForm({...orderForm, totalAmount: e.target.value})} required />
                  </label>
                  <label>
                    Status
                    <select value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})}>
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELED">CANCELED</option>
                    </select>
                  </label>
                  <button type="submit" className="btn-primary">Add Order</button>
                </form>
              </div>

              <div className="dashboard-card wide-card">
                <h2>Order History</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Order #</th>
                        <th>User ID</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.orderNumber}</td>
                          <td>{order.userId}</td>
                          <td>{order.totalAmount}</td>
                          <td>{order.status}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('order', order.id, order.orderNumber)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
