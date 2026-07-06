import { useCallback, useEffect, useMemo, useState } from 'react';
import { Line, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
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

const formatCurrency = amount => {
  if (amount == null || amount === '') return '₹0';
  const value = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (Number.isNaN(value)) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
};

const buildPeriodRange = period => {
  const now = new Date();
  const to = new Date(now);
  const from = new Date(now);
  if (period === '30') {
    from.setDate(now.getDate() - 29);
  } else {
    from.setDate(now.getDate() - 6);
  }
  return {
    label: `${from.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} - ${to.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`,
    start: from.toISOString().slice(0, 10),
    end: to.toISOString().slice(0, 10),
  };
};

export default function SalesAdmin() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [period, setPeriod] = useState('7');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const periodRange = useMemo(() => buildPeriodRange(period), [period]);

  useEffect(() => {
    setStartDate(periodRange.start);
    setEndDate(periodRange.end);
  }, [periodRange]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    if (new Date(startDate) > new Date(endDate)) {
      setStatus('Start date cannot be after end date.');
      return;
    }
    setStatus('');
  }, [startDate, endDate]);

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
      const params = new URLSearchParams({
        startDate: startDate || periodRange.start,
        endDate: endDate || periodRange.end,
      });
      const res = await fetch(`${API_URL}/orders/search?${params.toString()}`, { headers: authHeaders });
      if (res.ok) {
        setOrders(await res.json());
        setStatus('Sales data loaded successfully.');
      } else {
        setStatus('Unable to load sales data.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Unable to load sales data.');
    }
  }, [authHeaders, endDate, periodRange.end, periodRange.start, startDate]);

  useEffect(() => {
    if (!startDate || !endDate) return;
    loadData();
  }, [loadData, startDate, endDate]);

  const recentSales = useMemo(() => orders.slice(0, 6), [orders]);

  const totalSales = useMemo(() => orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0), [orders]);
  const totalOrders = orders.length;
  const uniqueCustomers = useMemo(() => new Set(orders.map(o => o.customerEmail || o.customerName || o.userId).filter(Boolean)).size, [orders]);
  const averageOrderValue = totalOrders ? Math.round(totalSales / totalOrders) : 0;
  const refundValue = useMemo(() => orders.filter(o => o.status === 'Refunded').reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0), [orders]);

  const ordersByDay = useMemo(() => {
    const labels = [];
    const data = [];
    const start = new Date(startDate || periodRange.start);
    const end = new Date(endDate || periodRange.end);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    for (let i = 0; i < days; i += 1) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      labels.push(day.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }));
      data.push(0);
    }
    orders.forEach(order => {
      const date = order.createdAt ? new Date(order.createdAt) : order.date ? new Date(order.date) : null;
      if (!date) return;
      if (date >= start && date <= end) {
        const label = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
        const index = labels.indexOf(label);
        if (index >= 0) data[index] += 1;
      }
    });
    return { labels, data };
  }, [orders, periodRange, startDate, endDate]);

  const salesTrendData = useMemo(() => ({
    labels: ordersByDay.labels,
    datasets: [
      {
        label: 'Orders',
        data: ordersByDay.data,
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 4,
      },
    ],
  }), [ordersByDay]);

  const channelData = useMemo(() => ({
    labels: ['Website', 'Mobile App', 'Marketplace', 'Others'],
    datasets: [
      {
        data: [55, 25, 15, 5],
        backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'],
        borderWidth: 0,
      },
    ],
  }), []);

  const topCategories = useMemo(() => ([
    { name: 'Dog Food', sales: '₹4,25,400', percent: '34%' },
    { name: 'Cat Food', sales: '₹2,85,300', percent: '23%' },
    { name: 'Pet Accessories', sales: '₹2,10,500', percent: '17%' },
    { name: 'Pet Toys', sales: '₹1,50,200', percent: '12%' },
    { name: 'Others', sales: '₹77,250', percent: '6%' },
  ]), []);

  return (
    <div className="sales-page">
      <div className="sales-header">
        <div>
          <h1>Sales Overview</h1>
          <p>Track and analyze your store sales performance.</p>
        </div>
        <div className="sales-header-actions">
          <div className="sales-range-pill">
            <span>{periodRange.label}</span>
            <select value={period} onChange={e => setPeriod(e.target.value)}>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
            </select>
          </div>
          <div className="sales-date-picker">
            <label>
              From
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </label>
            <label>
              To
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </label>
          </div>
          <button type="button" className="btn-primary sales-export-btn">Export Report</button>
        </div>
      </div>

      <div className="sales-summary-grid">
        <div className="sales-metric-card dashboard-card">
          <div className="metric-label">Total Sales</div>
          <div className="metric-value">{formatCurrency(totalSales)}</div>
          <div className="metric-note positive">+18.2% from last month</div>
        </div>
        <div className="sales-metric-card dashboard-card">
          <div className="metric-label">Total Orders</div>
          <div className="metric-value">{totalOrders}</div>
          <div className="metric-note positive">+12.5% from last month</div>
        </div>
        <div className="sales-metric-card dashboard-card">
          <div className="metric-label">Average Order Value</div>
          <div className="metric-value">{formatCurrency(averageOrderValue)}</div>
          <div className="metric-note positive">+8.4% from last month</div>
        </div>
        <div className="sales-metric-card dashboard-card">
          <div className="metric-label">Total Customers</div>
          <div className="metric-value">{uniqueCustomers}</div>
          <div className="metric-note positive">+9.3% from last month</div>
        </div>
        <div className="sales-metric-card dashboard-card">
          <div className="metric-label">Refunds</div>
          <div className="metric-value">{formatCurrency(refundValue)}</div>
          <div className="metric-note negative">-5.2% from last month</div>
        </div>
      </div>

      <div className="sales-main-grid">
        <div className="sales-trend-card dashboard-card">
          <div className="section-header">
            <h3>Sales Trend</h3>
            <span className="section-subtitle">Daily</span>
          </div>
          <div className="chart-shell">
            <Line
              data={salesTrendData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: '#e5e7eb' } },
                },
              }}
            />
          </div>
        </div>

        <div className="sales-channel-card dashboard-card">
          <div className="section-header">
            <h3>Sales by Channel</h3>
          </div>
          <div className="donut-chart-shell">
            <Doughnut data={channelData} options={{ plugins: { legend: { position: 'bottom' } } }} />
          </div>
          <div className="sales-channel-summary">
            <span>Total Sales</span>
            <strong>{formatCurrency(totalSales)}</strong>
          </div>
        </div>

        <div className="top-selling-card dashboard-card">
          <div className="section-header">
            <h3>Top Selling Categories</h3>
            <a href="#" className="view-all">View All</a>
          </div>
          <div className="top-selling-list">
            {topCategories.map(item => (
              <div key={item.name} className="top-selling-item">
                <div>
                  <strong>{item.name}</strong>
                  <span>{item.sales}</span>
                </div>
                <div className="top-selling-meta">
                  <span>{item.percent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="recent-sales-card dashboard-card">
        <div className="section-header">
          <h3>Recent Sales</h3>
          <a href="#" className="view-all">View All Orders</a>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Payment Method</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(order => (
                <tr key={order.id}>
                  <td>{order.orderNumber || `#ORD-${order.id}`}</td>
                  <td>{order.customerName || order.customerEmail || `Customer ${order.id}`}</td>
                  <td>{order.createdAt ? new Date(order.createdAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</td>
                  <td>{order.items?.length ?? order.itemCount ?? '-'}</td>
                  <td>{formatCurrency(order.totalAmount)}</td>
                  <td>{order.paymentMethod || 'Credit Card'}</td>
                  <td>{order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>
    </div>
  );
}
