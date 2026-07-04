import { NavLink } from 'react-router-dom';
import './Dashboard.css';

function Icon({ type }) {
  switch (type) {
    case 'users':
      return <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'roles':
      return <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2v6" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="14" r="6" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'links':
      return <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 14a3 3 0 010-4l4-4a3 3 0 014 4l-1 1" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 10a3 3 0 010 4l-4 4a3 3 0 01-4-4l1-1" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'products':
      return <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="3" y="7" width="18" height="13" rx="2" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3v4M8 3v4" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'categories':
      return <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h16M4 17h16" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'orders':
      return <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3v4M8 3v4" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'reports':
      return <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 3h12a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 7h8M8 11h8M8 15h4" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    case 'settings':
      return <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 8a4 4 0 100 8 4 4 0 000-8z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06A2 2 0 013.3 16.88l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82L4.21 3.3A2 2 0 016.04 1.17l.06.06A1.65 1.65 0 008 1.56c.5 0 .96.19 1.31.53.35.34.59.79.59 1.31V4a2 2 0 004 0v-.09c0-.52.24-.97.59-1.31.35-.34.81-.53 1.31-.53.51 0 .97.19 1.31.53l.06-.06A2 2 0 0119.79 3.3l-.06.06a1.65 1.65 0 00-.33 1.82c.16.5.51.92 1 1.2.49.28.85.78.85 1.35v.09a1.65 1.65 0 001 1.51c.4.24.75.55 1 1z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
    default:
      return null;
  }
}

export default function AdminNav() {
  return (
    <div className="admin-navigation-page">
      <div className="dashboard-actions admin-nav-list">
        <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/admin/users"><Icon type="users" />Users</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/admin/roles"><Icon type="roles" />Roles</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/admin/links"><Icon type="links" />Links</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/admin/products"><Icon type="products" />Products</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/admin/categories"><Icon type="categories" />Categories</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/admin/orders"><Icon type="orders" />Orders</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/reports"><Icon type="reports" />Reports</NavLink>
        <NavLink className={({ isActive }) => isActive ? 'active' : ''} to="/settings"><Icon type="settings" />Settings</NavLink>
      </div>
    </div>
  );
}
