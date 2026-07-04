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
      </div>
    </div>
  );
}
