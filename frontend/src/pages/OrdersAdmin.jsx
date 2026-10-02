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

function formatInvoiceAmount(value) {
  return `INR ${Number(value || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

async function createOrderInvoicePdf(order, customerName, customerEmail) {
  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({ format: 'a4', unit: 'mm' });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 15;
  const right = pageWidth - margin;
  const items = order.items || [];
  const total = Number(order.totalAmount || 0);
  const itemSubtotal = items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const adjustment = total - itemSubtotal;

  pdf.setFillColor(18, 35, 54);
  pdf.rect(0, 0, pageWidth, 34, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text('PawMart', margin, 16);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('ORDER INVOICE', margin, 24);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(17);
  pdf.text('INVOICE', right, 16, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Invoice no. INV-${String(order.id).padStart(6, '0')}`, right, 23, { align: 'right' });

  pdf.setTextColor(45, 55, 72);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ORDER DETAILS', margin, 44);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Order: ${order.orderNumber || order.id}`, margin, 50);
  pdf.text(`Date: ${order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Not available'}`, margin, 55);
  pdf.text(`Status: ${order.status || 'Not available'}`, margin, 60);

  const cardY = 68;
  const cardWidth = (pageWidth - margin * 2 - 8) / 2;
  const shippingLines = pdf.splitTextToSize(order.shippingAddress || 'Delivery address not recorded', cardWidth - 10).slice(0, 5);
  const customerLines = [customerName || 'Customer', customerEmail || '', order.gstin ? `GSTIN: ${order.gstin}` : ''];
  const cardHeight = Math.max(31, 16 + shippingLines.length * 4.2);
  pdf.setFillColor(247, 249, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.roundedRect(margin, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  pdf.roundedRect(margin + cardWidth + 8, cardY, cardWidth, cardHeight, 2, 2, 'FD');
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8);
  pdf.text('BILL TO', margin + 5, cardY + 7);
  pdf.text('SHIP TO', margin + cardWidth + 13, cardY + 7);
  pdf.setTextColor(45, 55, 72);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.text(customerLines.filter(Boolean), margin + 5, cardY + 14);
  pdf.text(shippingLines, margin + cardWidth + 13, cardY + 14);

  let tableY = cardY + cardHeight + 12;
  const drawTableHeader = () => {
    pdf.setFillColor(236, 241, 246);
    pdf.rect(margin, tableY, pageWidth - margin * 2, 9, 'F');
    pdf.setTextColor(51, 65, 85);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7.5);
    pdf.text('PRODUCT', margin + 3, tableY + 6);
    pdf.text('SKU', 105, tableY + 6);
    pdf.text('QTY', 142, tableY + 6, { align: 'right' });
    pdf.text('UNIT PRICE', 173, tableY + 6, { align: 'right' });
    pdf.text('AMOUNT', right - 2, tableY + 6, { align: 'right' });
    tableY += 9;
  };

  drawTableHeader();
  if (!items.length) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text('No product line items were recorded for this order.', margin + 3, tableY + 8);
    tableY += 17;
  } else {
    items.forEach(item => {
      const productLines = pdf.splitTextToSize(item.productName || 'Product', 70);
      const skuLines = item.productSku ? pdf.splitTextToSize(item.productSku, 30) : ['-'];
      const rowHeight = Math.max(12, Math.max(productLines.length, skuLines.length) * 4.2 + 5);
      if (tableY + rowHeight > 255) {
        pdf.addPage();
        tableY = 18;
        drawTableHeader();
      }
      pdf.setTextColor(45, 55, 72);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.text(productLines, margin + 3, tableY + 6);
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(7);
      pdf.text(skuLines, 105, tableY + 6);
      pdf.setTextColor(45, 55, 72);
      pdf.setFontSize(8);
      pdf.text(String(item.quantity || 0), 142, tableY + 6, { align: 'right' });
      pdf.text(formatInvoiceAmount(item.unitPrice), 173, tableY + 6, { align: 'right' });
      pdf.text(formatInvoiceAmount(item.subtotal), right - 2, tableY + 6, { align: 'right' });
      tableY += rowHeight;
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, tableY, right, tableY);
    });
  }

  if (tableY > 245) {
    pdf.addPage();
    tableY = 20;
  }
  const summaryY = tableY + 10;
  const summaryX = pageWidth - margin - 76;
  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  if (items.length) {
    pdf.text('Items subtotal', summaryX, summaryY);
    pdf.text(formatInvoiceAmount(itemSubtotal), right, summaryY, { align: 'right' });
    pdf.text(adjustment >= 0 ? 'Shipping / other charges' : 'Discount / adjustment', summaryX, summaryY + 7);
    pdf.text(formatInvoiceAmount(Math.abs(adjustment)), right, summaryY + 7, { align: 'right' });
  }
  pdf.setDrawColor(226, 232, 240);
  pdf.line(summaryX, summaryY + (items.length ? 11 : 2), right, summaryY + (items.length ? 11 : 2));
  pdf.setTextColor(18, 35, 54);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('TOTAL', summaryX, summaryY + 19);
  pdf.text(formatInvoiceAmount(total), right, summaryY + 19, { align: 'right' });

  pdf.setTextColor(100, 116, 139);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7.5);
  pdf.text('Tax breakdown is not included because tax details are not recorded for this order.', margin, 280);
  pdf.text('Generated electronically by PawMart.', margin, 285);

  return pdf.output('blob');
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
  const [invoicePreview, setInvoicePreview] = useState(null);
  const refreshPromiseRef = useRef(null);
  const invoicePreviewUrlRef = useRef(null);

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

  async function handleViewInvoice(order) {
    if (invoicePreviewUrlRef.current) URL.revokeObjectURL(invoicePreviewUrlRef.current);
    invoicePreviewUrlRef.current = null;
    setInvoicePreview({ order, url: null, loading: true, warning: '', error: '' });

    let invoiceOrder = order;
    let warning = '';
    try {
      const response = await fetchWithAuthRetry(`${API_URL}/orders/${order.id}`);
      if (response.ok) invoiceOrder = await response.json();
      else warning = `Order item details are unavailable (${response.status}); showing the available order summary.`;
    } catch {
      warning = 'Order item details are unavailable; showing the available order summary.';
    }

    try {
      const invoiceBlob = await createOrderInvoicePdf(
        invoiceOrder,
        getUserName(usersById.get(String(order.userId))) || order.customerName,
        usersById.get(String(order.userId))?.email,
      );
      const invoiceUrl = URL.createObjectURL(invoiceBlob);
      invoicePreviewUrlRef.current = invoiceUrl;
      setInvoicePreview({ order, url: invoiceUrl, loading: false, warning, error: '' });
    } catch (error) {
      setInvoicePreview({ order, url: null, loading: false, warning: '', error: error.message || 'Unable to generate invoice.' });
    }
  }

  function closeInvoicePreview() {
    if (invoicePreviewUrlRef.current) URL.revokeObjectURL(invoicePreviewUrlRef.current);
    invoicePreviewUrlRef.current = null;
    setInvoicePreview(null);
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
                            aria-label={`View invoice PDF for order ${order.orderNumber}`}
                            onClick={() => handleViewInvoice(order)}
                          >
                            PDF
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

      {invoicePreview && (
        <div
          className="order-details-backdrop"
          role="presentation"
          onMouseDown={event => event.target === event.currentTarget && closeInvoicePreview()}
        >
          <section className="invoice-preview-dialog" role="dialog" aria-modal="true" aria-labelledby="invoice-preview-title">
            <div className="order-details-header">
              <div>
                <h2 id="invoice-preview-title">Invoice preview</h2>
                <p>{invoicePreview.order.orderNumber}</p>
              </div>
              <button type="button" className="order-details-close" aria-label="Close invoice preview" onClick={closeInvoicePreview}>
                ×
              </button>
            </div>
            {invoicePreview.loading ? (
              <p className="order-details-empty">Preparing invoice...</p>
            ) : invoicePreview.error ? (
              <p className="order-details-error" role="alert">{invoicePreview.error}</p>
            ) : (
              <>
                {invoicePreview.warning && <p className="invoice-preview-warning" role="status">{invoicePreview.warning}</p>}
                <iframe className="invoice-preview-frame" src={invoicePreview.url} title={`Invoice ${invoicePreview.order.orderNumber}`} />
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
