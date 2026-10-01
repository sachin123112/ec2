import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { downloadOrderInvoice } from '../utils/downloadOrderInvoice';
import './Dashboard.css';
import './OrdersAdmin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const orderStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'COMPLETED', 'CANCELED'];

export default function OrdersAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);

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

  async function handleDownloadInvoice(order) {
    setDownloadingInvoiceId(order.id);
    try {
      await downloadOrderInvoice(order, token);
      setStatus(`Invoice for ${order.orderNumber || `order ${order.id}`} downloaded.`);
    } catch (error) {
      setStatus(error.message || 'Unable to download invoice.');
    } finally {
      setDownloadingInvoiceId(null);
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
      setStatus('Order removed successfully.');
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

  const filteredOrders = orders.filter(order => {
    const orderNumber = String(order.orderNumber || order.id || '').toLowerCase();
    const customer = String(order.customerName || order.userName || order.userId || '').toLowerCase();
    const query = searchTerm.trim().toLowerCase();
    const customerQuery = customerSearch.trim().toLowerCase();
    const orderDate = order.createdAt ? new Date(order.createdAt) : null;

    if (query && !orderNumber.includes(query)) return false;
    if (customerQuery && !customer.includes(customerQuery)) return false;
    if (statusFilter !== 'ALL' && String(order.status || '').toUpperCase() !== statusFilter) return false;
    if (dateFrom && orderDate && orderDate < new Date(`${dateFrom}T00:00:00`)) return false;
    if (dateTo && orderDate && orderDate > new Date(`${dateTo}T23:59:59.999`)) return false;
    return true;
  });

  function resetFilters() {
    setSearchTerm('');
    setCustomerSearch('');
    setStatusFilter('ALL');
    setDateFrom('');
    setDateTo('');
  }

  function formatOrderDate(order) {
    if (!order.createdAt) return 'Awaiting date';
    return new Date(order.createdAt).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  }

  function formatAmount(order) {
    return `₹${Number(order.totalAmount || 0).toLocaleString('en-IN')}`;
  }

  function getStatusClass(orderStatus) {
    return String(orderStatus || 'PENDING').toLowerCase().replace('canceled', 'cancelled');
  }

  return (
    <div className="dashboard-page orders-admin-page">
      <div className="dashboard-header orders-admin-header">
        <div className="dashboard-header-left">
          <div className="orders-breadcrumb">
            <Link to="/admin/dashboard">Dashboard</Link>
            <span>›</span>
            <Link to="/admin/orders">Orders</Link>
            <span>›</span>
            <span className="orders-breadcrumb-current">Order History</span>
          </div>
          <div className="orders-title-row">
            <div className="orders-title-icon">▣</div>
            <div>
              <h1>Order History</h1>
              <p>View and manage all customer orders for your store.</p>
            </div>
          </div>
          <div className="header-links orders-header-links">
            <Link to="/admin/products" className="btn-outline">Products</Link>
            <Link to="/admin/users" className="btn-outline">Users</Link>
            <Link to="/admin/categories" className="btn-outline">Categories</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      <section className="dashboard-card orders-filter-card" aria-labelledby="filter-orders-title">
        <div className="orders-section-heading">
          <div className="orders-section-icon">⌕</div>
          <div>
            <h2 id="filter-orders-title">Filter Orders</h2>
            <p>Find an order by customer, status, or date range.</p>
          </div>
        </div>
        <div className="orders-filter-grid">
          <label>
            <span>Order ID</span>
            <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search order ID..." />
          </label>
          <label>
            <span>Customer</span>
            <input value={customerSearch} onChange={event => setCustomerSearch(event.target.value)} placeholder="Search customer name..." />
          </label>
          <label>
            <span>Order Status</span>
            <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}>
              <option value="ALL">All Status</option>
              {orderStatuses.map(orderStatus => <option key={orderStatus} value={orderStatus}>{orderStatus}</option>)}
            </select>
          </label>
          <label>
            <span>Date From</span>
            <input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} />
          </label>
          <label>
            <span>Date To</span>
            <input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} />
          </label>
          <div className="orders-filter-actions">
            <button type="button" className="btn-primary" onClick={() => setStatus('Filters applied.')}>⌕ Apply Filters</button>
            <button type="button" className="btn-outline" onClick={resetFilters}>↻ Reset</button>
          </div>
        </div>
      </section>

      <section className="dashboard-card orders-list-card">
        <div className="orders-list-heading">
          <div className="orders-section-heading">
            <div className="orders-section-icon list">▤</div>
            <div>
              <h2>Order List</h2>
              <p>View, track and manage customer orders.</p>
            </div>
          </div>
          <button type="button" className="btn-outline orders-export-button">⇩ Export</button>
        </div>

        <div className="table-scroll">
          <table className="orders-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total (₹)</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 && (
                <tr><td colSpan="9" className="orders-empty-state">No orders match the selected filters.</td></tr>
              )}
              {filteredOrders.map((order, index) => (
                <tr key={order.id}>
                  <td>{index + 1}</td>
                  <td className="order-id-cell">{order.orderNumber || `ORD-${order.id}`}</td>
                  <td>
                    <div className="customer-cell">
                      <span className="customer-avatar">{String(order.customerName || order.userName || 'C').charAt(0).toUpperCase()}</span>
                      <span>{order.customerName || order.userName || `Customer #${order.userId || '—'}`}</span>
                    </div>
                  </td>
                  <td>{order.items?.length || order.itemCount || '—'}</td>
                  <td className="order-total-cell">{formatAmount(order)}</td>
                  <td><span className="payment-label">{order.paymentMethod || 'Online'}</span></td>
                  <td><span className={`order-status-pill ${getStatusClass(order.status)}`}>{order.status || 'PENDING'}</span></td>
                  <td>{formatOrderDate(order)}</td>
                  <td>
                    <div className="order-actions">
                      <button type="button" className="order-view-button" aria-label={`View order ${order.orderNumber || order.id}`}>◉</button>
                      <button type="button" className="order-invoice-button" onClick={() => handleDownloadInvoice(order)} disabled={downloadingInvoiceId === order.id} aria-label={`Download invoice for ${order.orderNumber || order.id}`}>
                        {downloadingInvoiceId === order.id ? '…' : 'PDF'}
                      </button>
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
                              <button type="button" role="menuitem" className={order.status === orderStatus ? 'active' : ''} key={orderStatus} onClick={() => handleUpdateStatus(order.id, orderStatus)}>
                                {orderStatus}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button type="button" className="order-delete-button" onClick={() => handleDeleteOrder(order.id)}>▥ Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="orders-footer-row">
          <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          <div className="pagination-controls">
            <button type="button" aria-label="First page">«</button>
            <button type="button" aria-label="Previous page">‹</button>
            <button type="button" className="page-btn active">1</button>
            <button type="button" aria-label="Next page">›</button>
            <button type="button" aria-label="Last page">»</button>
          </div>
        </div>
      </section>
    </div>
  );
}
