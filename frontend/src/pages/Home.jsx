import { Link } from 'react-router-dom';
import { products, categories } from '../data/products';
import { useCart } from '../context/CartContext';
import './Home.css';

const featured = products.filter(p => p.badge === 'Best Seller' || p.badge === 'Top Rated');

const testimonials = [
  {
    id: 1,
    name: 'Priya Sharma',
    avatar: '👩',
    rating: 5,
    text: 'Amazing quality products! My dog Biscuit absolutely loves the kibble. Fast delivery and great packaging.',
  },
  {
    id: 2,
    name: 'Rahul Mehta',
    avatar: '👨',
    rating: 5,
    text: 'Best pet store online! Got the cat tower and my cats haven\'t left it since. Highly recommended.',
  },
  {
    id: 3,
    name: 'Anjali Nair',
    avatar: '👩‍🦱',
    rating: 4,
    text: 'Great variety and competitive prices. The aquarium starter kit was exactly as described. Will shop again!',
  },
];

export default function Home() {
  const { addToCart } = useCart();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tag">🐾 Welcome to PawMart</span>
          <h1>Everything Your <span>Pet Deserves</span></h1>
          <p>Premium food, toys, accessories & more for dogs, cats, birds and fish. Delivered to your door.</p>
          <div className="hero-buttons">
            <Link to="/shop" className="btn-primary">Shop Now</Link>
            <Link to="/shop?category=Dogs" className="btn-outline">Explore Dogs 🐶</Link>
          </div>
          <div className="hero-stats">
            <div><strong>500+</strong><span>Products</span></div>
            <div><strong>10k+</strong><span>Happy Pets</span></div>
            <div><strong>4.8★</strong><span>Rating</span></div>
          </div>
        </div>
        <div className="hero-image">
          <img
            src="https://images.unsplash.com/photo-1450778869180-41d0601e046e?w=600&q=80"
            alt="Happy pets"
          />
          <div className="hero-badge">🚚 Free delivery over ₹999</div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="section-header">
          <h2>Shop by Category</h2>
          <p>Find exactly what your furry, feathery or scaly friend needs</p>
        </div>
        <div className="categories-grid">
          {categories.map(cat => (
            <Link
              to={`/shop?category=${cat.name}`}
              key={cat.name}
              className="category-card"
              style={{ background: cat.bg, borderColor: cat.color }}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-name" style={{ color: cat.color }}>{cat.name}</span>
              <span className="cat-arrow" style={{ color: cat.color }}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section section-alt">
        <div className="section-header">
          <h2>Best Sellers</h2>
          <p>Our most loved products by pet parents</p>
        </div>
        <div className="products-grid">
          {featured.map(product => (
            <div key={product.id} className="product-card">
              {product.badge && <span className="product-badge">{product.badge}</span>}
              <div className="product-img-wrap">
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <span className="product-category">{product.category} · {product.subCategory}</span>
                <h3>{product.name}</h3>
                <div className="product-rating">
                  {'★'.repeat(Math.round(product.rating))}{'☆'.repeat(5 - Math.round(product.rating))}
                  <span>({product.reviews})</span>
                </div>
                <div className="product-footer">
                  <span className="product-price">₹{product.price.toLocaleString()}</span>
                  <button className="btn-add" onClick={() => addToCart(product)}>+ Add</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="section-cta">
          <Link to="/shop" className="btn-primary">View All Products →</Link>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section">
        <div className="section-header">
          <h2>Why PawMart?</h2>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <span>🏆</span>
            <h3>Premium Quality</h3>
            <p>All products are vet-approved and sourced from trusted brands.</p>
          </div>
          <div className="feature-card">
            <span>🚚</span>
            <h3>Fast Delivery</h3>
            <p>Free delivery on orders over ₹999. Same-day dispatch available.</p>
          </div>
          <div className="feature-card">
            <span>💸</span>
            <h3>Best Prices</h3>
            <p>Competitive pricing with frequent discounts and combo offers.</p>
          </div>
          <div className="feature-card">
            <span>📞</span>
            <h3>Expert Support</h3>
            <p>Our pet care experts are available 7 days a week to help you.</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section section-alt">
        <div className="section-header">
          <h2>Happy Pet Parents</h2>
          <p>What our customers say about us</p>
        </div>
        <div className="testimonials-grid">
          {testimonials.map(t => (
            <div key={t.id} className="testimonial-card">
              <p>"{t.text}"</p>
              <div className="testimonial-author">
                <span className="testimonial-avatar">{t.avatar}</span>
                <div>
                  <strong>{t.name}</strong>
                  <div className="testimonial-stars">{'★'.repeat(t.rating)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner">
        <div className="cta-content">
          <h2>🐾 Spoil Your Pet Today!</h2>
          <p>Join 10,000+ happy pet parents shopping at PawMart</p>
          <Link to="/shop" className="btn-white">Browse All Products</Link>
        </div>
      </section>
    </div>
  );
}
