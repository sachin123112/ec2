import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function OrdersAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [orderForm, setOrderForm] = useState({ userId: '', totalAmount: '0.00', status: 'PENDING' });
  const [status, setStatus] = useState('');

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
      const res = await fetch(`${API_URL}/orders`, { headers: authHeaders });
      if (res.ok) setOrders(await res.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load orders data.');
    }
  }, [authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Orders</h1>
          <p>Track and manage orders</p>
          <div className="header-links" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <Link to="/admin/products" className="btn-outline">Products</Link>
            <Link to="/admin/users" className="btn-outline">Users</Link>
            <Link to="/admin/categories" className="btn-outline">Categories</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

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
                      <button className="btn-danger btn-sm" onClick={() => handleDeleteOrder(order.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
