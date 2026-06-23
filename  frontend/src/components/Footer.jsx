import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">🐾 PawMart</div>
          <p>Your one-stop shop for all pet needs. Quality products for happy, healthy pets.</p>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">📘</a>
            <a href="#" aria-label="Instagram">📷</a>
            <a href="#" aria-label="Twitter">🐦</a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/">Home</Link>
          <Link to="/shop">All Products</Link>
          <Link to="/cart">Cart</Link>
        </div>

        <div className="footer-col">
          <h4>Categories</h4>
          <Link to="/shop?category=Dogs">Dog Products</Link>
          <Link to="/shop?category=Cats">Cat Products</Link>
          <Link to="/shop?category=Birds">Bird Products</Link>
          <Link to="/shop?category=Fish">Fish Products</Link>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <p>📞 +91 98765 43210</p>
          <p>📧 hello@pawmart.in</p>
          <p>📍 123 Pet Lane, Bengaluru, Karnataka 560001</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 PawMart. All rights reserved. Made with ❤️ for pets.</p>
      </div>
    </footer>
  );
}
