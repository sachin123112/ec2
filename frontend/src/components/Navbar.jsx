import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ChangePasswordModal from './ChangePasswordModal';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, logout, roles } = useAuth();
  const { userEmail } = useAuth();
  const { totalItems } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMenuOpen(false);
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setUserMenuOpen(false);
    setMenuOpen(false);
    setChangePasswordOpen(true);
  };

  const categories = [
    { name: 'Dogs', path: '/shop?category=Dogs' },
    { name: 'Cats', path: '/shop?category=Cats' },
    { name: 'Birds', path: '/shop?category=Birds' },
    { name: 'Fish', path: '/shop?category=Fish' },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🐾</span>
          <span className="logo-text">PawMart</span>
        </Link>

        {/* Search */}
        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for pets, food, accessories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit">🔍</button>
        </form>

        {/* Nav Links */}
        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
          <div className={`nav-dropdown ${dropdownOpen ? 'open' : ''}`}>
            <button
              type="button"
              className="dropdown-toggle"
              aria-expanded={dropdownOpen}
              onClick={() => {
                setDropdownOpen(d => !d);
                setUserMenuOpen(false);
              }}
            >
              Shop
              <span className="dropdown-arrow">▾</span>
            </button>
            <div className={`dropdown-menu ${dropdownOpen ? 'open' : ''}`}>
              {categories.map(category => (
                <Link key={category.name} to={category.path} onClick={() => { setMenuOpen(false); setDropdownOpen(false); }}>
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          {isAuthenticated ? (
            <>
              <Link
                to="/cart"
                className="navbar-cart-link"
                aria-label={`Cart${totalItems > 0 ? `, ${totalItems} item${totalItems === 1 ? '' : 's'}` : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span>🛒 Cart</span>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </Link>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
          {isAuthenticated && (
            <div className="nav-user-menu">
              <button type="button" className="link-button" onClick={() => {
                setUserMenuOpen(u => !u);
                setDropdownOpen(false);
              }}>
                {userEmail ? userEmail.split('@')[0].charAt(0).toUpperCase() + userEmail.split('@')[0].slice(1) : 'Account'} ▾
              </button>
              {userMenuOpen && (
                <div className="nav-user-dropdown">
                  <button type="button" className="nav-user-item" onClick={() => { setUserMenuOpen(false); setMenuOpen(false); navigate(roles.includes('ADMIN') ? '/admin/dashboard' : '/dashboard#overview'); }}>
                    Account Manager
                  </button>
                  <button type="button" className="nav-user-item" onClick={handleChangePassword}>
                    Change Password
                  </button>
                  <button type="button" className="nav-user-item nav-user-item-danger" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
      
      {/* Change Password Modal */}
      <ChangePasswordModal isOpen={changePasswordOpen} onClose={() => setChangePasswordOpen(false)} />
    </nav>
  );
}
