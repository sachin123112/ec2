import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Dashboard() {
  const { isAuthenticated, logout, token, userEmail } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');

  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0' });
  const [orderForm, setOrderForm] = useState({ userId: '', totalAmount: '0.00', status: 'PENDING' });

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
    loadData();
  }, [isAuthenticated, navigate]);

  async function loadData() {
    try {
      const [usersRes, productsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: authHeaders }),
        fetch(`${API_URL}/products`, { headers: authHeaders }),
        fetch(`${API_URL}/orders`, { headers: authHeaders }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      setStatus('Unable to load dashboard data.');
    }
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
    };

    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      setUserForm({ username: '', email: '', password: '', firstName: '', lastName: '' });
      await loadData();
      setStatus('User created successfully.');
    } else {
      setStatus('Unable to create user.');
    }
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setStatus('Creating product...');

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: productForm.name,
        description: productForm.description,
        sku: productForm.sku,
        price: parseFloat(productForm.price) || 0,
        stockQuantity: parseInt(productForm.stockQuantity, 10) || 0,
      }),
    });

    if (response.ok) {
      setProductForm({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0' });
      await loadData();
      setStatus('Product added successfully.');
    } else {
      setStatus('Unable to create product.');
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back, {userEmail || 'admin'}.</p>
        </div>
        <button type="button" className="btn-outline" onClick={() => { logout(); navigate('/login'); }}>
          Logout
        </button>
      </div>

      <div className="dashboard-tabs">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
      </div>

      <div className="dashboard-status">{status}</div>

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
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td>{user.status}</td>
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
