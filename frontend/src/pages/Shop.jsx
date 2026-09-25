import { Fragment, useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories as defaultCategories } from '../data/products';
import { useCart } from '../context/CartContext';
import './Shop.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const shopCategoryRail = [
  { label: 'All', active: true, icon: '🛍️', image: null },
  { label: 'Dogs', icon: '🐶', image: '/images/category-dogs.png' },
  { label: 'Cats', icon: '🐱', image: '/images/category-cats.png' },
  { label: 'Birds', icon: '🐦', image: '/images/category-birds.png' },
  { label: 'Fish', icon: '🐠', image: '/images/category-fish.png' },
  { label: 'Food', icon: '🥗', image: '/images/category-food.png' },
  { label: 'Aquarium Plants', icon: '🌿', image: '/images/category-aquarium-plants.png' },
  { label: 'Small Pets', icon: '🐹', image: '/images/category-small-pets.png' },
  { label: 'Aquarium Wood', icon: 'wood' },
  { label: 'Accessories', icon: '🎀' },
  { label: 'Toys', icon: '🧸' },
];

const promoBanners = [
  {
    tag: 'Fresh picks',
    title: 'Healthy meals',
    subtitle: 'Complete nutrition for active pets',
    image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=1200&q=80',
    cta: 'Shop Food →',
    theme: 'peach',
  },
  {
    tag: 'Play & explore',
    title: 'Toys, treats & more fun',
    subtitle: 'Keep your pets active, engaged and happy.',
    image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80',
    cta: 'Shop Toys →',
    theme: 'mint',
  },
  {
    tag: 'Aquarium life',
    title: 'Beautiful tanks, happier fish',
    subtitle: 'Everything for a clean and vibrant aquarium.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70b5?auto=format&fit=crop&w=1200&q=80',
    cta: 'Shop Aquarium →',
    theme: 'blue',
  },
];

const heroPets = [
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80',
];

function resolveProductImageUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== 'string') return '';
  if (/^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;

  const apiOrigin = API_URL.replace(/\/api\/v1\/?$/, '');
  return `${apiOrigin}/${imageUrl.replace(/^\/+/, '')}`;
}

function categoryMatches(productCategory, selectedCategory) {
  const productName = productCategory?.trim().toLowerCase();
  const selectedName = selectedCategory?.trim().toLowerCase();
  if (selectedName === 'food') {
    return productName === 'food' || productName?.endsWith(' food');
  }
  return productName === selectedName || productName === selectedName?.replace(/s$/, '') || productName?.replace(/s$/, '') === selectedName;
}

function getProductCategoryOptions(categories, products) {
  const seen = new Set();
  const hiddenCategories = new Set(['dog food']);

  return categories.filter(category => {
    const name = String(category.name || '').trim();
    const key = name.toLowerCase();
    if (!name || hiddenCategories.has(key) || seen.has(key) || !products.some(product => categoryMatches(product.category, name))) return false;
    seen.add(key);
    return true;
  });
}

function getCategoryIcon(categoryName) {
  const defaultCategory = defaultCategories.find(category => categoryMatches(category.name, categoryName));
  return defaultCategory?.icon || '🐾';
}

function getFallbackImage(category, productName, icon = '🐾') {
  const safeTitle = String(productName || 'Pet Product').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const safeCategory = String(category || 'Pet Shop').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const colors = {
    Dogs: ['#FF6B35', '#FFF0EA'],
    Cats: ['#9B59B6', '#F5EEF8'],
    Birds: ['#2980B9', '#EBF5FB'],
    Fish: ['#16A085', '#E8F8F5'],
    'Small Pets': ['#F39C12', '#FEF5E7'],
    'Aquarium Wood': ['#8B5E3C', '#F7EEE7'],
    'Aquarium Plants': ['#2ECC71', '#EAFBF1'],
    Food: ['#F39C12', '#FFF4E6'],
  };

  const [color, bg] = colors[category] || ['#FF6B35', '#FFF0EA'];
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${bg}"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#bg)"/>
      <circle cx="660" cy="130" r="110" fill="rgba(255,255,255,0.28)"/>
      <text x="52" y="250" font-size="150">${icon}</text>
      <text x="52" y="390" font-family="Arial, Helvetica, sans-serif" font-size="52" font-weight="700" fill="${color}">${safeTitle}</text>
      <text x="52" y="460" font-family="Arial, Helvetica, sans-serif" font-size="24" fill="#4b5563">${safeCategory}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function normalizeProduct(product) {
  const category = typeof product.category === 'string' ? product.category : product.category?.name;
  const fallbackImage = getFallbackImage(product.categoryName || category || 'Uncategorized', product.name, '🐾');
  const rawImageUrls = Array.isArray(product.imageUrls)
    ? product.imageUrls
    : Array.isArray(product.images)
      ? product.images
      : product.image ? [product.image] : [];
  const imageUrls = rawImageUrls.map(resolveProductImageUrl).filter(Boolean);
  return {
    id: product.id,
    name: product.name,
    category: product.categoryName || category || 'Uncategorized',
    subCategory: product.subCategory || '',
    price: product.price || 0,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    image: imageUrls[0] || fallbackImage,
    imageUrls,
    badge: product.badge || '',
    description: product.description || '',
    inStock: product.stockQuantity ? product.stockQuantity > 0 : (product.inStock !== undefined ? product.inStock : true),
  };
}

function resolveBannerUrl(imageUrl) {
  if (!imageUrl || /^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  return `${API_URL.replace(/\/api\/v1\/?$/, '')}/${imageUrl.replace(/^\/+/, '')}`;
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(defaultCategories);
  const [pageBanner, setPageBanner] = useState(null);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showTopDeck, setShowTopDeck] = useState(true);
  const [showHero, setShowHero] = useState(true);
  const lastScrollYRef = useRef(0);
  const hideTimerRef = useRef(null);
  const { addToCart } = useCart();

  const selectedImages = useMemo(() => {
    if (!selected) return [];
    const imageUrls = Array.isArray(selected.imageUrls) ? selected.imageUrls : [];
    const images = imageUrls.length > 0 ? imageUrls : [selected.image];
    return images.filter(Boolean);
  }, [selected]);

  useEffect(() => {
    if (!selected || selectedImages.length < 2) return undefined;
    const timer = setInterval(() => {
      setSelectedImageIndex(current => (current + 1) % selectedImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [selected, selectedImages.length]);

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    setActiveCategory(cat || 'All');
    setSearch(q || '');
  }, [searchParams]);

  const activeCategoryLabel = activeCategory === 'All' ? 'All' : (categoryOptions.find(category => categoryMatches(category.name, activeCategory))?.name || activeCategory);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const previousY = lastScrollYRef.current;
      const delta = currentY - previousY;

      if (currentY < 60) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setShowHero(true);
        setShowTopDeck(true);
        lastScrollYRef.current = currentY;
        return;
      }

      if (delta > 16 && currentY > 120) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setShowHero(false), 90);
      } else if (delta < -16) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setShowHero(true);
      }

      if (currentY > 200) {
        setShowTopDeck(true);
      }

      lastScrollYRef.current = currentY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    async function fetchProducts() {
      try {
        const [res, categoriesRes] = await Promise.all([
          fetch(`${API_URL}/products`),
          fetch(`${API_URL}/categories`),
        ]);
        if (!mounted) return;
        if (res.ok) {
          const all = await res.json();
          setProducts(all.map(normalizeProduct));
        }
        if (categoriesRes.ok) {
          const backendCategories = await categoriesRes.json();
          if (backendCategories.length > 0) setCategoryOptions(backendCategories);
        }
      } catch {
        // ignore
      }
    }

    async function fetchBanner() {
      try {
        const response = await fetch(`${API_URL}/banners?page=SHOP`);
        if (!mounted) return;
        if (response.ok) {
          const data = await response.json();
          setPageBanner(Array.isArray(data) && data.length > 0 ? data[0] : null);
        }
      } catch {
        // ignore
      }
    }

    fetchProducts();
    fetchBanner();

    function onProductsUpdated(e) {
      if (e && e.detail) {
        setProducts(e.detail.map(normalizeProduct));
      }
    }

    window.addEventListener('products:updated', onProductsUpdated);
    return () => { mounted = false; window.removeEventListener('products:updated', onProductsUpdated); };
  }, []);

  let filtered = products;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(p => categoryMatches(p.category, activeCategoryLabel));
  }

  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subCategory.toLowerCase().includes(q)
    );
  }

  if (sortBy === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  const selectedCategory = categoryOptions.find(category => categoryMatches(category.name, activeCategory))?.name || activeCategory;
  const visibleCategoryOptions = getProductCategoryOptions(categoryOptions, products);

  return (
    <div className="shop">
      {pageBanner && (
        <section aria-label="Shop banner" style={{ width: 'min(1200px, calc(100% - 32px))', margin: '1rem auto 0', borderRadius: '18px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(21, 33, 59, 0.08)' }}>
          <img src={resolveBannerUrl(pageBanner.imageUrl)} alt="Shop banner" style={{ display: 'block', width: '100%', height: '220px', objectFit: 'cover' }} />
        </section>
      )}
      <section className={`shop-main-hero ${showHero ? '' : 'is-hidden'}`}>
        <div className="shop-main-hero-copy">
          <span className="shop-hero-kicker">🐾 Premium pet essentials</span>
          <h1>Up to <strong>30%</strong> OFF</h1>
          <h2>on Premium Pet Essentials</h2>
          <div className="shop-hero-perks"><span>● High Quality</span><span>● Trusted Brands</span><span>● Fast Delivery</span></div>
          <button type="button" className="shop-primary-btn" onClick={() => setActiveCategory('All')}>Shop Now <b>→</b></button>
        </div>
        <img className="shop-main-hero-image" src="/images/hero-pets.png" alt="Happy dog and cat with pet essentials" />
        <div className="shop-hero-sticker">Happy Pets<br /><strong>Happier Lives</strong> ♡</div>
      </section>

      <div className={`shop-category-strip ${showTopDeck ? '' : 'is-hidden'}`} aria-label="Category navigation">
        {shopCategoryRail.map(item => {
          const isActive = activeCategoryLabel === item.label || (item.label === 'All' && activeCategory === 'All');
          return (
            <button
              key={item.label}
              type="button"
              className={`shop-category-item ${isActive ? 'active' : ''}`}
              aria-pressed={isActive}
              onClick={() => setActiveCategory(item.label === 'All' ? 'All' : item.label)}
            >
              <span className={`shop-category-icon ${item.icon === 'wood' ? 'wood-logo' : ''}`}>
                {item.image ? <img src={item.image} alt="" /> : item.icon === 'wood' ? <span aria-hidden="true" /> : item.icon}
              </span>
              <span className="shop-category-label">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="shop-body">
        {/* Sidebar */}
        <aside className="shop-sidebar">
          <div className="sidebar-section">
            <h3>Search</h3>
            <input
              type="text"
              className="sidebar-search"
              placeholder="Search products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="sidebar-section">
            <h3>Categories</h3>
            <select
              className="category-select"
              value={activeCategory === 'All' ? 'All' : activeCategoryLabel}
              onChange={e => setActiveCategory(e.target.value)}
              aria-label="Filter products by category"
            >
              <option value="All">🐾 All ({products.length})</option>
              {visibleCategoryOptions.map(category => (
                <option key={category.id || category.name} value={category.name}>
                  {getCategoryIcon(category.name)} {category.name} ({products.filter(product => categoryMatches(product.category, category.name)).length})
                </option>
              ))}
            </select>
          </div>

          <div className="sidebar-section">
            <h3>Sort By</h3>
            <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="default">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </aside>

        {/* Products */}
        <main className="shop-main">
          {filtered.length === 0 ? (
            <div className="no-results">
              <span>🔍</span>
              <h3>No products found</h3>
              <p>Try a different search or category.</p>
              <button className="btn-primary" onClick={() => { setSearch(''); setActiveCategory('All'); }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="shop-products-grid">
              {filtered.map((product, index) => (
                <Fragment key={product.id}>
                <div key={product.id} className="product-card">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <div className="product-img-wrap" onClick={() => { setSelected(product); setSelectedImageIndex(0); }}>
                    <img
                      src={product.image}
                      alt={product.name}
                      onError={(e) => {
                        const fallback = getFallbackImage(product.category, product.name, '🐾');
                        if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                      }}
                    />
                    <div className="product-overlay">
                      <span>Quick View</span>
                    </div>
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
                {index === 3 && (
                  <>
                    <article className="shop-inline-promo shop-inline-promo-food">
                      <div><strong>Healthy Meals<br />for Happier Pets</strong><small>Nutrition made for a longer, healthier life.</small><button type="button" onClick={() => setActiveCategory('Food')}>Shop Food <b>→</b></button></div>
                    </article>
                    <article className="shop-inline-promo shop-inline-promo-toys">
                      <div><strong>Toys &amp; Accessories<br />for Every Adventure</strong><small>Playtime essentials for happy pets.</small><button type="button" onClick={() => setActiveCategory('Toys')}>Shop Now <b>→</b></button></div>
                    </article>
                  </>
                )}
                </Fragment>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Quick View Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            <img
              src={selectedImages[selectedImageIndex] || selected.image}
              alt={selected.name}
              onError={(e) => {
                const fallback = getFallbackImage(selected.category, selected.name, '🐾');
                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
              }}
            />
            {selectedImages.length > 1 && (
              <div className="modal-image-dots">
                {selectedImages.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={index === selectedImageIndex ? 'modal-image-dot active' : 'modal-image-dot'}
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`Show image ${index + 1}`}
                  />
                ))}
              </div>
            )}
            <div className="modal-info">
              <span className="product-category">{selected.category} · {selected.subCategory}</span>
              {selected.badge && <span className="product-badge inline-badge">{selected.badge}</span>}
              <h2>{selected.name}</h2>
              <div className="product-rating">
                {'★'.repeat(Math.round(selected.rating))}{'☆'.repeat(5 - Math.round(selected.rating))}
                <span>({selected.reviews} reviews)</span>
              </div>
              <p className="modal-desc">{selected.description}</p>
              <div className="modal-footer">
                <span className="product-price large">₹{selected.price.toLocaleString()}</span>
                <button className="btn-primary" onClick={() => { addToCart(selected); setSelected(null); }}>
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
