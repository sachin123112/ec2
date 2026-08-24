import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const orderStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELED'];

export default function OrdersAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);

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
      if (!res.ok) {
        if (res.status === 401) setStatus('Your session expired. Please log in again.');
        else if (res.status === 403) setStatus('Admin access is required to view all orders.');
        else setStatus(`Unable to load orders (${res.status}).`);
        return;
      }
      setOrders(await res.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load orders data.');
    }
  }, [authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

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

  async function handleUpdateStatus(id, nextStatus) {
    setStatus('Updating order status...');
    const response = await fetch(`${API_URL}/orders/${id}/status?status=${encodeURIComponent(nextStatus)}`, {
      method: 'PATCH',
      headers: authHeaders,
    });
    if (response.ok) {
      setOrders(previous => previous.map(order => order.id === id ? { ...order, status: nextStatus } : order));
      setOpenMenuId(null);
      setStatus('Order status updated successfully.');
    } else {
      setStatus('Unable to update order status.');
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
                      <div className="order-actions">
                        <div className="order-menu">
                          <button
                            type="button"
                            className="order-menu-trigger"
                            aria-label={`Edit status for order ${order.orderNumber}`}
                            aria-expanded={openMenuId === order.id}
                            onClick={() => setOpenMenuId(openMenuId === order.id ? null : order.id)}
                          >
                            ⋮
                          </button>
                          {openMenuId === order.id && (
                            <div className="order-menu-dropdown" role="menu">
                              <span className="order-menu-title">Edit status</span>
                              {orderStatuses.map(orderStatus => (
                                <button
                                  type="button"
                                  role="menuitem"
                                  className={order.status === orderStatus ? 'active' : ''}
                                  key={orderStatus}
                                  onClick={() => handleUpdateStatus(order.id, orderStatus)}
                                >
                                  {orderStatus}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      <button className="btn-danger btn-sm" onClick={() => handleDeleteOrder(order.id)}>Delete</button>
                      </div>
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
