import { Link } from 'react-router-dom';
import { categories } from '../data/products';
import { useCart } from '../context/CartContext';
import { useEffect, useState } from 'react';
import './Home.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const API_ORIGIN = API_URL.replace(/\/api\/v1\/?$/, '');

function resolveBannerUrl(imageUrl) {
  if (!imageUrl || /^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  return `${API_ORIGIN}/${imageUrl.replace(/^\/+/, '')}`;
}

const fallbackFeatured = [
  { id: 'fallback-1', name: 'Royal Canin Dog Food', category: 'Dogs', subCategory: 'Food', price: 1299, rating: 4.8, reviews: 120, image: '/images/product-royal-canin.png', badge: 'Best Seller', inStock: true },
  { id: 'fallback-2', name: 'Pedigree Adult Dog Food', category: 'Dogs', subCategory: 'Food', price: 999, rating: 4.7, reviews: 94, image: '/images/product-pedigree.png', badge: 'Popular', inStock: true },
  { id: 'fallback-3', name: 'Whiskas Cat Food', category: 'Cats', subCategory: 'Food', price: 899, rating: 4.6, reviews: 64, image: '/images/product-whiskas.png', badge: 'Top Rated', inStock: true },
  { id: 'fallback-4', name: 'Kong Chew Toy', category: 'Dogs', subCategory: 'Toys', price: 499, rating: 4.8, reviews: 38, image: '/images/product-kong.png', badge: 'Best Seller', inStock: true },
  { id: 'fallback-5', name: 'Comfort Pet Bed', category: 'Dogs', subCategory: 'Home Care', price: 799, rating: 4.7, reviews: 52, image: '/images/product-bed.png', badge: 'Popular', inStock: true },
  { id: 'fallback-6', name: 'Aquarium Live Plant', category: 'Aquarium Plants', subCategory: 'Plants', price: 299, rating: 4.5, reviews: 26, image: '/images/product-plant.png', badge: 'New', inStock: true },
];

function useFeaturedProducts() {
  const [featured, setFeatured] = useState(fallbackFeatured);

  const normalizeProduct = (product) => {
    const image = product.imageUrls?.[0] || product.images?.[0] || product.image || '';
    return {
      id: product.id,
      name: product.name,
      category: product.categoryName || product.category || 'Uncategorized',
      subCategory: product.subCategory || '',
      price: Number(product.price || 0),
      rating: Number(product.rating || 4.5),
      reviews: Number(product.reviews || 0),
      image: image.startsWith('/') ? `${API_ORIGIN}${image}` : (image || '/images/product-royal-canin.png'),
      badge: product.badge || '',
      description: product.description || '',
      inStock: product.stockQuantity !== undefined ? product.stockQuantity > 0 : (product.inStock !== false),
    };
  };

  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      try {
        const res = await fetch(`${API_URL}/products`);
        if (!mounted) return;
        if (res.ok) {
          const all = await res.json();
          const norm = all.map(normalizeProduct);
          const apiFeatured = norm.filter(p => p.badge === 'Best Seller' || p.badge === 'Top Rated');
          setFeatured(apiFeatured.length ? apiFeatured.slice(0, 6) : norm.slice(0, 6));
        }
      } catch {
        // ignore
      }
    }

    fetchProducts();

    function onProductsUpdated(e) {
      if (e && e.detail) {
        const norm = e.detail.map(normalizeProduct);
        const apiFeatured = norm.filter(p => p.badge === 'Best Seller' || p.badge === 'Top Rated');
        setFeatured(apiFeatured.length ? apiFeatured.slice(0, 6) : norm.slice(0, 6));
      }
    }

    window.addEventListener('products:updated', onProductsUpdated);
    return () => { mounted = false; window.removeEventListener('products:updated', onProductsUpdated); };
  }, []);

  return featured;
}

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

const categoryImages = {
  Dogs: '/images/category-dogs.png',
  Cats: '/images/category-cats.png',
  Birds: '/images/category-birds.png',
  Fish: '/images/category-fish.png',
  'Small Pets': '/images/category-small-pets.png',
  'Aquarium Wood': '/images/category-aquarium-wood.png',
  'Aquarium Plants': '/images/category-aquarium-plants.png',
  Food: '/images/category-food.png',
};

export default function Home() {
  const { addToCart } = useCart();
  const featured = useFeaturedProducts();
  const [pageBanner, setPageBanner] = useState(null);

  useEffect(() => {
    let mounted = true;

    fetch(`${API_URL}/banners?page=HOME`)
      .then(response => response.ok ? response.json() : [])
      .then(data => {
        if (!mounted) return;
        const banner = Array.isArray(data) && data.length > 0 ? data[0] : null;
        setPageBanner(banner);
      })
      .catch(() => {
        if (mounted) setPageBanner(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="home">
      {pageBanner && (
        <section aria-label="Home banner" style={{ width: 'min(1200px, calc(100% - 32px))', margin: '0 auto 1.25rem', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(21, 33, 59, 0.08)' }}>
          <img src={resolveBannerUrl(pageBanner.imageUrl)} alt="Home banner" style={{ display: 'block', width: '100%', height: '220px', objectFit: 'cover' }} />
        </section>
      )}
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
            src="/images/hero-pets.png"
            alt="Happy pets"
          />
          <div className="hero-badge">🚚 Free delivery over ₹999</div>
        </div>
      </section>

      <section className="home-benefits" aria-label="PawMart benefits">
        <div><span>🚚</span><strong>Fast Delivery</strong><small>Across India</small></div>
        <div><span>🛡️</span><strong>100% Genuine</strong><small>Products</small></div>
        <div><span>⟳</span><strong>Easy Returns</strong><small>7 Days</small></div>
        <div><span>🎧</span><strong>24/7 Support</strong><small>We&apos;re here to help</small></div>
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
              <span className="cat-icon">
                <img src={categoryImages[cat.name]} alt="" loading="lazy" />
              </span>
              <span className="cat-name" style={{ color: cat.color }}>{cat.name}</span>
              <span className="cat-arrow" style={{ color: cat.color }}>→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="promo-grid" aria-label="Featured offers">
        <Link to="/shop?category=Food" className="promo-card promo-food">
          <span className="promo-eyebrow">Premium pet nutrition</span>
          <strong>Up to <b>30% OFF</b></strong>
          <span>Stock up on their favourite food.</span>
          <span className="promo-link">Shop Food <b>→</b></span>
        </Link>
        <Link to="/shop?category=Small%20Pets" className="promo-card promo-toys">
          <span className="promo-eyebrow">Playtime essentials</span>
          <strong>Toys &amp; Accessories</strong>
          <span>For happy, active pets</span>
          <span className="promo-link">Shop Now <b>→</b></span>
        </Link>
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
