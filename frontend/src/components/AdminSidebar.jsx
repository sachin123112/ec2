import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import './AdminSidebar.css';

const items = [
  ['Dashboard', '/admin/dashboard', '⌂'],
  ['Products', '/admin/products', '◇'],
  ['Categories', '/admin/categories', '☷'],
  ['Brands', '/admin/brands', '♧'],
  ['Offers', '/admin/offers', '◇'],
  ['Orders', '/admin/orders', '▣'],
  ['Customers', '/admin/users', '♙'],
  ['Banners', '/admin/links', '▱'],
  ['Reviews', '/reports', '☆'],
  ['Reports', '/reports', '⌁'],
  ['Settings', '/settings', '⚙'],
];

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={`admin-sidebar${isCollapsed ? ' collapsed' : ''}`} aria-label="Admin navigation">
      <div className="admin-sidebar-brand"><span className="admin-sidebar-paw">✦</span><strong>Paw<span>Mart</span></strong><button type="button" className="admin-sidebar-toggle" onClick={() => setIsCollapsed(previous => !previous)} aria-label={isCollapsed ? 'Expand admin sidebar' : 'Collapse admin sidebar'} aria-expanded={!isCollapsed}>‹</button></div>
      <nav className="admin-sidebar-nav">
        {items.map(([label, path, icon]) => (
          <NavLink key={`${label}-${path}`} to={path} className={({ isActive }) => `admin-sidebar-link${isActive ? ' active' : ''}`}>
            <span className="admin-sidebar-icon" aria-hidden="true">{icon}</span><span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
