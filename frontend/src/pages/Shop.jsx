import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories as defaultCategories } from '../data/products';
import { useCart } from '../context/CartContext';
import './Shop.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

function categoryMatches(productCategory, selectedCategory) {
  const productName = productCategory?.trim().toLowerCase();
  const selectedName = selectedCategory?.trim().toLowerCase();
  return productName === selectedName || productName === selectedName?.replace(/s$/, '') || productName?.replace(/s$/, '') === selectedName;
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
    Reptiles: ['#27AE60', '#EAFAF1'],
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
  return {
    id: product.id,
    name: product.name,
    category: product.categoryName || category || 'Uncategorized',
    subCategory: product.subCategory || '',
    price: product.price || 0,
    rating: product.rating || 0,
    reviews: product.reviews || 0,
    image: product.imageUrls?.[0] || product.images?.[0] || product.image || fallbackImage,
    badge: product.badge || '',
    description: product.description || '',
    inStock: product.stockQuantity ? product.stockQuantity > 0 : (product.inStock !== undefined ? product.inStock : true),
  };
}

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(defaultCategories);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    setActiveCategory(cat || 'All');
    setSearch(q || '');
  }, [searchParams]);

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

    fetchProducts();

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
    filtered = filtered.filter(p => categoryMatches(p.category, activeCategory));
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

  return (
    <div className="shop">
      {/* Shop Header */}
      <div className="shop-header">
        <div className="shop-header-inner">
          <h1>🛍️ Pet Shop</h1>
          <p>Showing <strong>{filtered.length}</strong> products</p>
        </div>
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
              value={selectedCategory}
              onChange={e => setActiveCategory(e.target.value)}
              aria-label="Filter products by category"
            >
              <option value="All">🐾 All ({products.length})</option>
              {categoryOptions.map(category => (
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
              {filtered.map(product => (
                <div key={product.id} className="product-card">
                  {product.badge && <span className="product-badge">{product.badge}</span>}
                  <div className="product-img-wrap" onClick={() => setSelected(product)}>
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
              src={selected.image}
              alt={selected.name}
              onError={(e) => {
                const fallback = getFallbackImage(selected.category, selected.name, '🐾');
                if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
              }}
            />
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
