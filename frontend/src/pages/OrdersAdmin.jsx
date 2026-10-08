import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const orderStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELED'];
const orderTrackingSteps = ['Order confirmed', 'Processing', 'Delivery'];

function getOrderTrackingState(status) {
  switch (String(status || '').toUpperCase()) {
    case 'PENDING':
      return { title: 'Order confirmed', badge: 'On track', message: 'Your order is confirmed and waiting to be prepared.', activeStep: 0 };
    case 'PROCESSING':
      return { title: 'Processing', badge: 'In progress', message: 'Your order is being prepared. Shipment updates will appear here when available.', activeStep: 1 };
    case 'COMPLETED':
      return { title: 'Delivered', badge: 'Complete', message: 'This order is marked as completed.', activeStep: 2 };
    case 'CANCELED':
      return { title: 'Canceled', badge: 'Canceled', message: 'This order was canceled.', activeStep: -1 };
    default:
      return { title: 'Order received', badge: 'Status update pending', message: 'Tracking updates are not available yet.', activeStep: 0 };
  }
}

function getUserName(user) {
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim();
  return fullName || user?.username || user?.email || null;
}

async function downloadOrderInvoice(order, customerName, customerEmail) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  const navy = [16, 35, 56];
  const orange = [255, 107, 53];
  const text = [30, 41, 55];
  const muted = [98, 113, 130];
  const border = [218, 226, 235];
  const formatMoney = value => `INR ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const orderId = String(order.orderNumber || order.id || 'ORD-UNKNOWN');
  const orderDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Date unavailable';
  const invoiceNumber = `INV-${String(order.id ?? order.orderNumber ?? '00000').replace(/\D+/g, '').padStart(6, '0')}`;
  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal || Number(item.quantity || 0) * Number(item.unitPrice || item.price || 0)), 0);
  let y = 45;

  const drawHeader = () => {
    pdf.setFillColor(...navy);
    pdf.rect(0, 0, pageWidth, 34, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.text('PawMart', margin + 4, 17);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.text('Pet Care • Happy Pets • Happy Homes', margin + 4, 24);
    pdf.setFillColor(...orange);
    pdf.roundedRect(pageWidth - margin - 39, 7, 39, 14, 2, 2, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('INVOICE', pageWidth - margin - 19.5, 16, { align: 'center' });
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7);
    pdf.text(`Order # ${orderId}`, pageWidth - margin, 25, { align: 'right' });
    pdf.text(`Invoice No: ${invoiceNumber}  |  ${orderDate}`, pageWidth - margin, 30, { align: 'right' });
  };

  const addPage = () => {
    pdf.addPage();
    drawHeader();
    y = 45;
  };

  drawHeader();
  pdf.setFillColor(240, 244, 249);
  pdf.setDrawColor(...border);
  pdf.roundedRect(margin, y, contentWidth, 28, 2, 2, 'FD');
  pdf.setTextColor(...text);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('ORDER DETAILS', margin + 6, y + 8);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Order ID: ${orderId}`, margin + 6, y + 16);
  pdf.text(`Date: ${orderDate}`, margin + 6, y + 22);
  pdf.text(`Customer: ${customerName || 'Customer'}`, margin + 80, y + 16);
  pdf.text(`Email: ${customerEmail || 'Not provided'}`, margin + 80, y + 22);
  y += 36;

  pdf.setFillColor(...navy);
  pdf.rect(margin, y, contentWidth, 9, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(7.5);
  pdf.text('#', margin + 4, y + 6);
  pdf.text('PRODUCT', margin + 13, y + 6);
  pdf.text('QTY', margin + 112, y + 6, { align: 'right' });
  pdf.text('UNIT PRICE', margin + 145, y + 6, { align: 'right' });
  pdf.text('AMOUNT', pageWidth - margin - 3, y + 6, { align: 'right' });
  y += 9;

  if (!items.length) {
    pdf.setDrawColor(...border);
    pdf.rect(margin, y, contentWidth, 12);
    pdf.setTextColor(...muted);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('No product line items were recorded for this order.', margin + 5, y + 8);
    y += 12;
  } else {
    items.forEach((item, index) => {
      if (y + 11 > pageHeight - 35) addPage();
      const quantity = Number(item.quantity || 0);
      const unitPrice = Number(item.unitPrice || item.price || 0);
      const lineTotal = Number(item.subtotal || quantity * unitPrice);
      pdf.setDrawColor(...border);
      pdf.line(margin, y + 11, pageWidth - margin, y + 11);
      pdf.setTextColor(...text);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.text(String(index + 1), margin + 4, y + 7);
      pdf.text(pdf.splitTextToSize(String(item.productName || item.name || 'Product'), 94)[0], margin + 13, y + 7);
      pdf.text(String(quantity), margin + 112, y + 7, { align: 'right' });
      pdf.text(formatMoney(unitPrice), margin + 145, y + 7, { align: 'right' });
      pdf.text(formatMoney(lineTotal), pageWidth - margin - 3, y + 7, { align: 'right' });
      y += 11;
    });
  }

  if (y + 39 > pageHeight - 25) addPage();
  const total = Number(order.totalAmount || 0);
  pdf.setTextColor(...muted);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text('Subtotal', pageWidth - margin - 75, y + 8);
  pdf.text(formatMoney(subtotal), pageWidth - margin, y + 8, { align: 'right' });
  pdf.setDrawColor(...border);
  pdf.line(pageWidth - margin - 75, y + 12, pageWidth - margin, y + 12);
  pdf.setTextColor(...navy);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('TOTAL', pageWidth - margin - 75, y + 22);
  pdf.text(formatMoney(total), pageWidth - margin, y + 22, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(...muted);
  pdf.text(`Order status: ${String(order.status || 'Unknown').toUpperCase()}`, margin, pageHeight - 14);
  pdf.text('Thank you for shopping with PawMart!', pageWidth - margin, pageHeight - 14, { align: 'right' });

  pdf.save(`${invoiceNumber}.pdf`);
}

export default function OrdersAdmin() {
  const { token, refreshSession } = useAuth();
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetailsLoading, setOrderDetailsLoading] = useState(false);
  const [orderDetailsError, setOrderDetailsError] = useState('');
  const [invoiceLoadingId, setInvoiceLoadingId] = useState(null);
  const refreshPromiseRef = useRef(null);

  const authHeaderBase = useMemo(() => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  const authHeaders = useMemo(() => ({
    ...authHeaderBase,
    'Content-Type': 'application/json',
  }), [authHeaderBase]);

  const fetchWithAuthRetry = useCallback(async (url, options = {}) => {
    let response = await fetch(url, { ...options, headers: { ...authHeaders, ...(options.headers || {}) } });
    if (response.status !== 401) return response;

    try {
      if (!refreshPromiseRef.current) {
        refreshPromiseRef.current = refreshSession().finally(() => {
          refreshPromiseRef.current = null;
        });
      }
      const refreshed = await refreshPromiseRef.current;
      response = await fetch(url, {
        ...options,
        headers: {
          ...authHeaders,
          ...(options.headers || {}),
          Authorization: `Bearer ${refreshed.accessToken}`,
        },
      });
    } catch {
      // Keep the original 401 so the page can report the authentication failure.
    }

    return response;
  }, [authHeaders, refreshSession]);

  const loadData = useCallback(async () => {
    try {
      const [res, usersRes] = await Promise.all([
        fetchWithAuthRetry(`${API_URL}/orders`),
        fetchWithAuthRetry(`${API_URL}/users`).catch(() => null),
      ]);
      if (!res.ok) {
        if (res.status === 401) setStatus('Your session expired. Please log in again.');
        else if (res.status === 403) setStatus('Admin access is required to view all orders.');
        else setStatus(`Unable to load orders (${res.status}).`);
        return;
      }
      setOrders(await res.json());
      if (usersRes?.ok) setUsers(await usersRes.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load orders data.');
    }
  }, [fetchWithAuthRetry]);

  useEffect(() => { loadData(); }, [loadData]);

  const usersById = useMemo(() => new Map(users.map(user => [String(user.id), user])), [users]);
  const trackingState = selectedOrder ? getOrderTrackingState(selectedOrder.status) : null;

  async function handleDeleteOrder(id) {
    setStatus('Deleting order...');
    const response = await fetchWithAuthRetry(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
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
    const response = await fetchWithAuthRetry(`${API_URL}/orders/${id}/status?status=${encodeURIComponent(nextStatus)}`, {
      method: 'PATCH',
    });
    if (response.ok) {
      setOrders(previous => previous.map(order => order.id === id ? { ...order, status: nextStatus } : order));
      setOpenMenuId(null);
      setStatus('Order status updated successfully.');
    } else {
      setStatus('Unable to update order status.');
    }
  }

  async function handleOpenOrderDetails(order) {
    setSelectedOrder(order);
    setOrderDetailsLoading(true);
    setOrderDetailsError('');
    try {
      const response = await fetchWithAuthRetry(`${API_URL}/orders/${order.id}`);
      if (!response.ok) throw new Error(`Unable to load order details (${response.status}).`);
      setSelectedOrder(await response.json());
    } catch (error) {
      setOrderDetailsError(error.message || 'Unable to load order details.');
    } finally {
      setOrderDetailsLoading(false);
    }
  }

  async function handleDownloadInvoice(order) {
    setInvoiceLoadingId(order.id);
    try {
      const response = await fetchWithAuthRetry(`${API_URL}/orders/${order.id}`);
      if (!response.ok) throw new Error(`Unable to load invoice details (${response.status}).`);
      const invoiceOrder = await response.json();
      const customer = usersById.get(String(order.userId));
      await downloadOrderInvoice(
        invoiceOrder,
        getUserName(customer) || order.customerName,
        customer?.email,
      );
      setStatus(`Invoice downloaded for ${order.orderNumber}.`);
    } catch (error) {
      console.error(error);
      setStatus(error.message || 'Unable to generate invoice.');
    } finally {
      setInvoiceLoadingId(null);
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
        <div className="dashboard-card wide-card orders-history-card">
          <h2>Order History</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const customerName = getUserName(usersById.get(String(order.userId)))
                    || order.customerName
                    || `User ${order.userId ?? 'unknown'}`;
                  return (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>
                        <button type="button" className="order-number-button" onClick={() => handleOpenOrderDetails(order)}>
                          {order.orderNumber}
                        </button>
                      </td>
                      <td>{customerName}</td>
                      <td>{order.totalAmount}</td>
                      <td>{order.status}</td>
                      <td>
                        <div className="order-actions">
                          <button
                            type="button"
                            className="btn-outline btn-sm order-invoice-button"
                            aria-label={`Download invoice PDF for order ${order.orderNumber}`}
                            disabled={!['COMPLETED', 'PROCESSING'].includes(order.status) || invoiceLoadingId === order.id}
                            onClick={() => handleDownloadInvoice(order)}
                          >
                            {invoiceLoadingId === order.id ? '…' : 'PDF'}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div
          className="order-details-backdrop"
          role="presentation"
          onMouseDown={event => event.target === event.currentTarget && setSelectedOrder(null)}
        >
          <section className="order-details-dialog" role="dialog" aria-modal="true" aria-labelledby="order-details-title">
            <div className="order-details-header">
              <div>
                <h2 id="order-details-title">{selectedOrder.orderNumber}</h2>
                <p>Placed {selectedOrder.createdAt || 'date unavailable'}</p>
              </div>
              <button type="button" className="order-details-close" aria-label="Close order details" onClick={() => setSelectedOrder(null)}>
                ×
              </button>
            </div>

            <div className="order-details-summary">
              <div><span>Order status</span><strong>{selectedOrder.status}</strong></div>
              <div><span>Order total</span><strong>₹{Number(selectedOrder.totalAmount || 0).toLocaleString('en-IN')}</strong></div>
            </div>

            <h3>Products</h3>
            {orderDetailsLoading ? (
              <p className="order-details-empty">Loading order items...</p>
            ) : orderDetailsError ? (
              <p className="order-details-error" role="alert">{orderDetailsError}</p>
            ) : selectedOrder.items?.length ? (
              <div className="order-details-table-scroll">
                <table>
                  <thead><tr><th>Product</th><th>Qty</th><th>Unit price</th><th>Subtotal</th></tr></thead>
                  <tbody>
                    {selectedOrder.items.map(item => (
                      <tr key={`${item.productId}-${item.productName}`}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>₹{Number(item.unitPrice || 0).toLocaleString('en-IN')}</td>
                        <td>₹{Number(item.subtotal || 0).toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="order-details-empty">No product details were stored for this order.</p>
            )}

            <section className="order-tracking-panel" aria-label="Order tracking">
              <div className="order-tracking-heading">
                <div>
                  <span>TRACKING STATUS</span>
                  <h3>{trackingState.title}</h3>
                </div>
                <span className={`order-tracking-badge${trackingState.activeStep < 0 ? ' canceled' : ''}`}>
                  {trackingState.badge}
                </span>
              </div>
              <p className="order-tracking-message">{trackingState.message}</p>
              {trackingState.activeStep < 0 ? (
                <p className="order-tracking-info">No further tracking updates are expected for a canceled order.</p>
              ) : (
                <ol className="order-tracking-steps" aria-label="Order tracking progress">
                  {orderTrackingSteps.map((step, index) => (
                    <li className={index <= trackingState.activeStep ? 'complete' : ''} key={step}>
                      <span className="order-tracking-node">{index < trackingState.activeStep ? '✓' : index + 1}</span>
                      <strong>{step}</strong>
                      <small>
                        {index === 0
                          ? selectedOrder.createdAt ? `Placed ${new Date(selectedOrder.createdAt).toLocaleDateString('en-IN')}` : 'Order placed'
                          : index < trackingState.activeStep ? 'Complete'
                            : index === trackingState.activeStep ? 'In progress' : 'Pending'}
                      </small>
                    </li>
                  ))}
                </ol>
              )}
              <p className="order-tracking-info">Delivery and courier details will appear here when the order is out for delivery.</p>
            </section>
          </section>
        </div>
      )}

    </div>
  );
}
