import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { categories as defaultCategories } from '../data/products';
import { useCart } from '../context/CartContext';
import './Shop.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState(defaultCategories);
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
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
  const visibleCategoryOptions = getProductCategoryOptions(categoryOptions, products);

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
              {filtered.map(product => (
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
