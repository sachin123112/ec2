import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { products, categories } from '../data/products';
import { useCart } from '../context/CartContext';
import './Shop.css';

export default function Shop() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    const cat = searchParams.get('category');
    const q = searchParams.get('search');
    if (cat) setActiveCategory(cat);
    if (q) setSearch(q);
  }, [searchParams]);

  let filtered = products;

  if (activeCategory !== 'All') {
    filtered = filtered.filter(p => p.category === activeCategory);
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
            <ul className="category-list">
              {['All', ...categories.map(c => c.name)].map(cat => (
                <li key={cat}>
                  <button
                    className={`cat-btn ${activeCategory === cat ? 'active' : ''}`}
                    onClick={() => setActiveCategory(cat)}
                  >
                    {cat === 'All' ? '🐾 All' : `${categories.find(c => c.name === cat)?.icon} ${cat}`}
                    <span className="cat-count">
                      {cat === 'All' ? products.length : products.filter(p => p.category === cat).length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
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
                    <img src={product.image} alt={product.name} />
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
            <img src={selected.image} alt={selected.name} />
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
