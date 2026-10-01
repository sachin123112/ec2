import { Link, NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { financeSidebarSections } from '../data/financeNavigation';
import './AdminSidebar.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const groups = [
  { title: 'Catalog', items: [
    { label: 'Products', path: '/admin/products', icon: 'products' },
    { label: 'Categories', path: '/admin/categories', icon: 'categories' },
    { label: 'Brands', path: '/admin/brands', icon: 'brands' },
  ] },
  { title: 'Sales', items: [
    { label: 'Offers', path: '/admin/offers', icon: 'offers' },
    { label: 'Orders', path: '/admin/orders', icon: 'orders', showPending: true },
    { label: 'Customers', path: '/admin/users', icon: 'customers' },
  ] },
  { title: 'Marketing', items: [
    { label: 'Banners', path: '/admin/links', icon: 'banners' },
    { label: 'Reviews', path: '/reports', icon: 'reviews' },
  ] },
  { title: 'Reports', items: [
    { label: 'Reports', path: '/reports', icon: 'reports' },
  ] },
  { title: 'System', items: [
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ] },
];

function Icon({ name }) {
  const paths = {
    dashboard: <path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z" />,
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
    accounts: <><path d="M12 3c-4 0-7 1.5-7 3.5S8 10 12 10s7-1.5 7-3.5S16 3 12 3Z" /><path d="M5 6.5V17c0 2 3 4 7 4s7-2 7-4V6.5" /><path d="M12 12v7m-2-5c0-1 4-1 4 0s-4 1-4 2 4 1 4 0" /></>,
    vendors: <><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" /><circle cx="9.5" cy="7" r="4" /><path d="M17 8h4m-2-2v4" /></>,
    expenses: <><rect x="3" y="5" width="18" height="15" rx="2" /><path d="M3 9h18M7 5V3h10v2m-7 8h5" /></>,
    income: <><circle cx="12" cy="12" r="9" /><path d="M12 17V7m-4 4 4-4 4 4" /></>,
    vouchers: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7m-7 4h7" /></>,
    gst: <><path d="M19 5 5 19" /><circle cx="6.5" cy="6.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></>,
    tds: <><path d="M6 3h9l4 4v14H6z" /><path d="M14 3v5h5M9 12h7m-7 4h4" /></>,
    invoices: <><path d="M5 3h14v18l-3-2-4 2-4-2-3 2z" /><path d="M8 8h8M8 12h8M8 16h4" /></>,
  };

  const filled = ['dashboard', 'products', 'categories', 'brands', 'offers', 'orders', 'customers', 'banners', 'reviews', 'accounts', 'vendors', 'expenses', 'income', 'vouchers', 'gst', 'tds', 'invoices', 'reports'].includes(name);
  return <svg className={`admin-sidebar-icon admin-sidebar-icon-${name}`} viewBox="0 0 24 24" aria-hidden="true" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function SidebarLink({ item, pendingOrders }) {
  return (
    <NavLink end to={item.path} title={item.label} className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`}>
      <Icon name={item.icon} />
      <span className="admin-sidebar-link-label">{item.label}</span>
      {item.showPending && pendingOrders > 0 && <span className="admin-sidebar-count">{pendingOrders > 99 ? '99+' : pendingOrders}</span>}
      <span className="admin-sidebar-chevron" aria-hidden="true">›</span>
    </NavLink>
  );
}

export default function AdminSidebar() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [accountsExpanded, setAccountsExpanded] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);
  const navRef = useRef(null);
  const isFinancePath = location.pathname.startsWith('/admin/accounts');

  useEffect(() => {
    setAccountsExpanded(isFinancePath);
  }, [isFinancePath]);

  useLayoutEffect(() => {
    if (navRef.current) navRef.current.scrollTop = 0;
  }, [location.pathname, location.search, accountsExpanded, isCollapsed]);

  useEffect(() => {
    if (!token) return undefined;
    let current = true;
    fetch(`${API_URL}/orders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => response.ok ? response.json() : [])
      .then(orders => {
        if (current && Array.isArray(orders)) setPendingOrders(orders.filter(order => String(order.status).toUpperCase() === 'PENDING').length);
      })
      .catch(() => {});
    return () => { current = false; };
  }, [token]);

  function toggleAccounts() {
    setAccountsExpanded(expanded => !expanded);
    if (!isFinancePath) navigate('/admin/accounts');
  }
  
  function renderFinanceLink(item) {
    const active = (searchParams.get('module') || 'dashboard') === item.key;
    return <Link key={item.key} to={`/admin/accounts?module=${item.key}`} className={`admin-sidebar-link admin-sidebar-child admin-sidebar-finance-link admin-sidebar-finance-link-${item.key}${active ? ' active' : ''}`} title={item.title}>
      <Icon name={item.icon} /><span className="admin-sidebar-link-label">{item.title}</span><span className="admin-sidebar-chevron" aria-hidden="true">›</span>
    </Link>;
  }

  return (
    <aside className={`admin-sidebar${isCollapsed ? ' collapsed' : ''}${isFinancePath ? ' admin-sidebar-finance' : ''}`} aria-label="Admin navigation">
      <div className="admin-sidebar-brand">
        <span className="admin-sidebar-paw" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 13c-3.5 0-6.5 2.1-6.5 4.7 0 1.7 1.5 2.8 3.2 2.1.9-.4 1.8-.6 3.3-.6s2.4.2 3.3.6c1.7.7 3.2-.4 3.2-2.1 0-2.6-3-4.7-6.5-4.7ZM5.1 11.7c1.2-.2 1.9-1.5 1.6-3-.3-1.5-1.5-2.5-2.7-2.3-1.2.2-1.9 1.5-1.6 3 .3 1.5 1.5 2.5 2.7 2.3Zm5-2.5c1.3 0 2.3-1.3 2.3-2.9S11.4 3.4 10.1 3.4 7.8 4.7 7.8 6.3s1 2.9 2.3 2.9Zm7.2 2.5c1.2.2 2.4-.8 2.7-2.3.3-1.5-.4-2.8-1.6-3-1.2-.2-2.4.8-2.7 2.3-.3 1.5.4 2.8 1.6 3Zm-5-2.5c1.3 0 2.3-1.3 2.3-2.9s-1-2.9-2.3-2.9S10 4.7 10 6.3s1 2.9 2.3 2.9Z" /></svg></span>
        <div className="admin-sidebar-brand-copy"><strong>Paw<span>Mart</span></strong><small>Admin Panel</small></div>
        <button type="button" className="admin-sidebar-toggle" onClick={() => setIsCollapsed(previous => !previous)} aria-label={isCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'} aria-expanded={!isCollapsed}>‹</button>
      </div>

      <nav className="admin-sidebar-nav" ref={navRef}>
        <div className="admin-sidebar-primary-links">
          <NavLink end to="/admin/dashboard" className={({ isActive }) => `admin-sidebar-link admin-sidebar-primary-link admin-sidebar-dashboard${isActive ? ' active' : ''}`} title="Dashboard">
            <Icon name="dashboard" /><span className="admin-sidebar-link-label">Dashboard</span>
          </NavLink>
          <button type="button" className={`admin-sidebar-link admin-sidebar-primary-link admin-sidebar-account-trigger${isFinancePath ? ' active' : ''}`} onClick={toggleAccounts} aria-expanded={accountsExpanded} title="Accounts">
            <Icon name="accounts" /><span className="admin-sidebar-link-label">Accounts</span><span className="admin-sidebar-group-chevron" aria-hidden="true">{accountsExpanded ? '⌄' : '›'}</span>
          </button>
        </div>
        {isFinancePath ? accountsExpanded && <div className="admin-sidebar-finance-sections">
              {financeSidebarSections.map(section => <section className={`admin-sidebar-group admin-sidebar-finance-group admin-sidebar-finance-group-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`} aria-label={section.title} key={section.title}>
            <h2 className="admin-sidebar-section-title">{section.title}</h2>
            {section.columns ? <div className="admin-sidebar-finance-report-grid">{section.groups.flatMap(group => group.items).map(renderFinanceLink)}</div> : section.groups.map(group => <div className="admin-sidebar-finance-subgroup" aria-label={group.title} key={group.title}>
              {group.items.map(renderFinanceLink)}
            </div>)}
          </section>)}
        </div> : groups.map(group => <SidebarGroup key={group.title} group={group} pendingOrders={pendingOrders} />)}
      </nav>
    </aside>
  );
}

function SidebarGroup({ group, pendingOrders }) {
  return <section className="admin-sidebar-group" aria-label={group.title}>
    <h2 className="admin-sidebar-section-title">{group.title}</h2>
    {group.items.map(item => <SidebarLink key={item.path} item={item} pendingOrders={pendingOrders} />)}
  </section>;
}
