import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { totalItems } = useCart();
  const { isAuthenticated, logout, roles } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

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
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Shop</Link>
          <Link to="/shop?category=Dogs" onClick={() => setMenuOpen(false)}>Dogs</Link>
          <Link to="/shop?category=Cats" onClick={() => setMenuOpen(false)}>Cats</Link>
          <Link to="/shop?category=Birds" onClick={() => setMenuOpen(false)}>Birds</Link>
          <Link to="/shop?category=Fish" onClick={() => setMenuOpen(false)}>Fish</Link>
          {isAuthenticated ? (
            <>
              <Link to={roles.includes('ADMIN') ? '/admin/dashboard' : '/dashboard'} onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <button type="button" className="link-button" onClick={() => { logout(); navigate('/'); }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
          )}
        </div>

        {/* Cart */}
        <Link to="/cart" className="navbar-cart">
          <span className="cart-icon">🛒</span>
          {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
        </Link>

        {/* Hamburger */}
        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
