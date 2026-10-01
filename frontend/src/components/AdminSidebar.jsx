import { NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AdminSidebar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const dashboardItem = { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' };
const groups = [
  { label: 'Catalog', items: [
    { label: 'Products', path: '/admin/products', icon: 'products' },
    { label: 'Categories', path: '/admin/categories', icon: 'categories' },
    { label: 'Brands', path: '/admin/brands', icon: 'brands' },
  ] },
  { label: 'Sales', items: [
    { label: 'Offers', path: '/admin/offers', icon: 'offers' },
    { label: 'Orders', path: '/admin/orders', icon: 'orders' },
    { label: 'Customers', path: '/admin/users', icon: 'customers' },
  ] },
  { label: 'Marketing', items: [
    { label: 'Banners', path: '/admin/links', icon: 'banners' },
    { label: 'Reviews', path: '/reviews', icon: 'reviews' },
  ] },
  { label: 'Reports', items: [
    { label: 'Reports', path: '/reports', icon: 'reports' },
  ] },
  { label: 'System', items: [
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ] },
];

function SidebarIcon({ type }) {
  const paths = {
    dashboard: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" /></>,
    products: <><path d="m12 2 9 5-9 5-9-5z" /><path d="M3 7v10l9 5V12M21 7v10l-9 5" /></>,
    categories: <><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="2" /><rect x="3" y="13" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /></>,
    brands: <><path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0l-7.2-7.2A2 2 0 0 1 2.8 12V5a2 2 0 0 1 2-2h7a2 2 0 0 1 1.4.6l7.4 7a2 2 0 0 1 0 2.8Z" /><circle cx="7.5" cy="7.5" r="1" /></>,
    offers: <><path d="M19 5 5 19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
    orders: <><path d="M3 4h2l2.2 10.2a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L21 8H6" /><circle cx="10" cy="20" r="1.3" /><circle cx="18" cy="20" r="1.3" /></>,
    customers: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    banners: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
    reviews: <><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9z" /></>,
    reports: <><path d="M4 20V11M10 20V4M16 20v-7M22 20H2" /></>,
    settings: <><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" /><path d="m19.4 15 .1.1a2 2 0 0 1-2.8 2.8l-.1-.1a2 2 0 0 0-3.4 1.4v.2a2 2 0 0 1-4 0v-.2a2 2 0 0 0-3.4-1.4l-.1.1a2 2 0 0 1-2.8-2.8l.1-.1a2 2 0 0 0-1.4-3.4h-.2a2 2 0 0 1 0-4h.2a2 2 0 0 0 1.4-3.4l-.1-.1a2 2 0 0 1 2.8-2.8l.1.1a2 2 0 0 0 3.4-1.4v-.2a2 2 0 0 1 4 0v.2a2 2 0 0 0 3.4 1.4l.1-.1a2 2 0 0 1 2.8 2.8l-.1.1a2 2 0 0 0 1.4 3.4h.2a2 2 0 0 1 0 4h-.2a2 2 0 0 0-1.4 3.4Z" /></>,
  };

  return <svg className={`admin-sidebar-icon admin-sidebar-icon-${type}`} viewBox="0 0 24 24" aria-hidden="true" fill={type === 'products' || type === 'brands' || type === 'reviews' ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[type]}</svg>;
}

function SidebarLink({ item, pendingOrders, exact = false }) {
  return (
    <NavLink end={exact} to={item.path} className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`} title={item.label}>
      <SidebarIcon type={item.icon} />
      <span className="admin-sidebar-link-label">{item.label}</span>
      {item.icon === 'orders' && pendingOrders > 0 && <span className="admin-sidebar-count">{pendingOrders > 99 ? '99+' : pendingOrders}</span>}
      <span className="admin-sidebar-chevron" aria-hidden="true">›</span>
    </NavLink>
  );
}

export default function AdminSidebar() {
  const { token } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    if (!token) return undefined;
    let isCurrent = true;

    fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => response.ok ? response.json() : [])
      .then(orders => {
        if (isCurrent && Array.isArray(orders)) {
          setPendingOrders(orders.filter(order => String(order.status).toUpperCase() === 'PENDING').length);
        }
      })
      .catch(() => {});

    return () => { isCurrent = false; };
  }, [token]);

  return (
    <aside className={`admin-sidebar${isCollapsed ? ' collapsed' : ''}`} aria-label="Admin navigation">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-paw" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 13c-3.5 0-6.5 2.1-6.5 4.7 0 1.7 1.5 2.8 3.2 2.1.9-.4 1.8-.6 3.3-.6s2.4.2 3.3.6c1.7.7 3.2-.4 3.2-2.1 0-2.6-3-4.7-6.5-4.7ZM5.1 11.7c1.2-.2 1.9-1.5 1.6-3-.3-1.5-1.5-2.5-2.7-2.3-1.2.2-1.9 1.5-1.6 3 .3 1.5 1.5 2.5 2.7 2.3Zm5-2.5c1.3 0 2.3-1.3 2.3-2.9S11.4 3.4 10.1 3.4 7.8 4.7 7.8 6.3s1 2.9 2.3 2.9Zm7.2 2.5c1.2.2 2.4-.8 2.7-2.3.3-1.5-.4-2.8-1.6-3-1.2-.2-2.4.8-2.7 2.3-.3 1.5.4 2.8 1.6 3Zm-5-2.5c1.3 0 2.3-1.3 2.3-2.9s-1-2.9-2.3-2.9S10 4.7 10 6.3s1 2.9 2.3 2.9Z" /></svg></span>
        <div className="admin-sidebar-brand-copy"><strong>Paw<span>Mart</span></strong><small>Admin Panel</small></div>
        <button type="button" className="admin-sidebar-toggle" onClick={() => setIsCollapsed(previous => !previous)} aria-label={isCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'} aria-expanded={!isCollapsed}>‹</button>
      </div>
      <nav className="admin-sidebar-nav">
        <SidebarLink item={dashboardItem} exact />
        {groups.map(group => (
          <section className="admin-sidebar-group" key={group.label} aria-label={group.label}>
            <h2 className="admin-sidebar-section-title">{group.label}</h2>
            {group.items.map(item => <SidebarLink key={item.path} item={item} pendingOrders={pendingOrders} />)}
          </section>
        ))}
      </nav>
    </aside>
  );
}
