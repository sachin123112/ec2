import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { products as dummyProducts, categories as defaultCategories } from '../data/products';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function ProductsAdmin() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', netQuantity: '0', categoryId: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [productImages, setProductImages] = useState([]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [status, setStatus] = useState('');
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  const authHeaderBase = useMemo(() => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  const authHeaders = useMemo(() => ({
    ...authHeaderBase,
    'Content-Type': 'application/json',
  }), [authHeaderBase]);

  function getNextSku(categoryId) {
    const category = categories.find(item => String(item.id) === String(categoryId));
    if (!category) return '';

    const prefix = category.name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
    const nextNumber = products.reduce((highest, product) => {
      const match = product.sku?.match(new RegExp(`^${prefix}-(\\d+)$`, 'i'));
      return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0) + 1;
    return `${prefix}-${String(nextNumber).padStart(4, '0')}`;
  }

  const loadData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers: authHeaders }),
        fetch(`${API_URL}/categories`, { headers: authHeaders }),
      ]);
      if (!productsRes.ok) {
        const errorText = await productsRes.text();
        throw new Error(errorText || `Unable to load products (${productsRes.status}).`);
      }
      const loadedProducts = await productsRes.json();
      setProducts(Array.isArray(loadedProducts) && loadedProducts.length > 0 ? loadedProducts : dummyProducts);
      if (categoriesRes.ok) {
        const loadedCategories = await categoriesRes.json();
        setCategories(Array.isArray(loadedCategories) && loadedCategories.length > 0 ? loadedCategories : defaultCategories);
      } else {
        setCategories(defaultCategories);
      }
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setProducts(dummyProducts);
      setCategories(defaultCategories);
      setStatus(err.message || 'Unable to load products data. Using local demo products.');
    }
  }, [authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    return () => {
      productImagePreviews.forEach(URL.revokeObjectURL);
    };
  }, [productImagePreviews]);

  function handleProductImageSelection(event) {
    const files = Array.from(event.target.files || []);
    setProductImages(files);
    setProductImagePreviews(prev => {
      prev.forEach(URL.revokeObjectURL);
      return files.map(file => URL.createObjectURL(file));
    });
  }

  function removeProductImage(index) {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setProductImagePreviews(prev => {
      if (prev[index]) URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  }

  async function handleCreateProduct(event) {
    event.preventDefault();
    setStatus('Creating product...');
    const payload = {
      name: productForm.name,
      description: productForm.description,
      sku: productForm.sku,
      price: parseFloat(productForm.price) || 0,
      stockQuantity: parseInt(productForm.stockQuantity, 10) || 0,
      netQuantity: parseInt(productForm.netQuantity, 10) || 0,
      categoryId: productForm.categoryId ? parseInt(productForm.categoryId, 10) : null,
    };

    let response;
    if (productImages.length > 0) {
      const formData = new FormData();
      formData.append('name', payload.name);
      if (payload.description) formData.append('description', payload.description);
      if (payload.sku) formData.append('sku', payload.sku);
      formData.append('price', payload.price.toString());
      formData.append('stockQuantity', payload.stockQuantity.toString());
      formData.append('netQuantity', payload.netQuantity.toString());
      if (payload.categoryId !== null) formData.append('categoryId', payload.categoryId.toString());
      productImages.forEach(file => formData.append('images', file));

      response = await fetch(`${API_URL}/products`, {
        method: editingProductId ? 'PUT' : 'POST',
        headers: authHeaderBase,
        body: formData,
      });
    } else {
      response = await fetch(`${editingProductId ? `${API_URL}/products/${editingProductId}` : `${API_URL}/products`}`, {
        method: editingProductId ? 'PUT' : 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
    }

    if (response.ok) {
      const nextForm = { name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', netQuantity: '0', categoryId: '' };
      setProductForm(nextForm);
      setEditingProductId(null);
      setIsEditModalOpen(false);
      setProductImages([]);
      setProductImagePreviews(prev => { prev.forEach(URL.revokeObjectURL); return []; });
      await loadData();
      setStatus(editingProductId ? 'Product updated successfully.' : 'Product added successfully.');
    } else {
      const errorText = await response.text();
      setStatus(errorText || `Unable to ${editingProductId ? 'update' : 'create'} product (${response.status}).`);
    }
  }

  function startEditProduct(product) {
    setEditingProductId(product.id);
    setIsEditModalOpen(true);
    setProductForm({
      name: product.name || '',
      description: product.description || '',
      sku: product.sku || '',
      price: String(product.price ?? '0.00'),
      stockQuantity: String(product.stockQuantity ?? 0),
      netQuantity: String(product.netQuantity ?? 0),
      categoryId: product.categoryId ? String(product.categoryId) : '',
    });
    setStatus(`Editing product #${product.id}. Update the fields and save.`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEditProduct() {
    setEditingProductId(null);
    setIsEditModalOpen(false);
    setProductForm({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', netQuantity: '0', categoryId: '' });
    setProductImages([]);
    setProductImagePreviews(prev => { prev.forEach(URL.revokeObjectURL); return []; });
    setStatus('');
  }

  async function handleDeleteProduct(id) {
    setStatus('Deleting product...');
    setDeletingProductId(id);
    try {
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Delete failed (${response.status}).`);
      }

      setProducts(prev => prev.filter(product => product.id !== id));
      setStatus('Product deleted successfully.');
    } catch (err) {
      console.error('Unable to delete product', err);
      setStatus(err.message || 'Unable to delete product.');
    } finally {
      setDeletingProductId(null);
    }
  }

  const catalogCategories = useMemo(() => {
    return categories.length > 0 ? categories : defaultCategories;
  }, [categories]);

  const filteredProducts = products.filter(product => {
    const categoryName = product.categoryName || product.category?.name || product.category || 'Uncategorized';
    if (activeCategory !== 'All' && categoryName !== activeCategory) return false;

    const query = searchTerm.trim().toLowerCase();
    if (query && !(
      product.name?.toLowerCase().includes(query) ||
      categoryName.toLowerCase().includes(query) ||
      String(product.sku || '').toLowerCase().includes(query)
    )) {
      return false;
    }

    if (!product.createdAt) return !dateFrom && !dateTo;
    const createdAt = new Date(product.createdAt);
    if (dateFrom && createdAt < new Date(`${dateFrom}T00:00:00`)) return false;
    if (dateTo && createdAt >= new Date(`${dateTo}T23:59:59.999`)) return false;
    return true;
  });

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Product Management</h1>
          <p>Manage products and catalog</p>
          <div className="header-links" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <Link to="/admin/users" className="btn-outline">Users</Link>
            <Link to="/admin/orders" className="btn-outline">Orders</Link>
            <Link to="/admin/categories" className="btn-outline">Categories</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      {isEditModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, zIndex: 1000, overflowY: 'auto' }}>
          <div style={{ width: 'min(620px, 100%)', maxHeight: '90vh', overflowY: 'auto', background: '#fff', borderRadius: 18, padding: '18px 22px 22px', boxShadow: '0 20px 60px rgba(15, 23, 42, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: '#1f2937' }}>Edit Product</h2>
              <button type="button" className="btn-outline btn-sm" onClick={cancelEditProduct}>Close</button>
            </div>

            <form onSubmit={handleCreateProduct} className="panel-form" style={{ display: 'grid', gap: 18 }}>
              <label style={{ display: 'grid', gap: 8, color: '#1f2937', fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
                <span>Category</span>
                <select
                  value={productForm.categoryId}
                  onChange={e => setProductForm({
                    ...productForm,
                    categoryId: e.target.value,
                    sku: e.target.value ? getNextSku(e.target.value) : productForm.sku,
                  })}
                  required
                  style={{ minHeight: 56, padding: '14px 46px 14px 16px', border: '1px solid #d1d5db', borderRadius: 12, background: '#f8fafc url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 20 20\' fill=\'none\'%3E%3Cpath d=\'M5 7.5L10 12.5L15 7.5\' stroke=\'%2364748b\' stroke-width=\'1.8\' stroke-linecap=\'round\' stroke-linejoin=\'round\'/%3E%3C/svg%3E") no-repeat right 16px center/12px 12px', fontSize: '1.1rem', appearance: 'none' }}
                >
                  <option value="">Select category</option>
                  {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </label>

              <label style={{ display: 'grid', gap: 8, color: '#1f2937', fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
                <span>Name</span>
                <input
                  value={productForm.name}
                  onChange={e => setProductForm({...productForm, name: e.target.value})}
                  required
                  style={{ minHeight: 56, padding: '14px 16px', border: '1px solid #d1d5db', borderRadius: 12, background: '#f8fafc', fontSize: '1.1rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 8, color: '#1f2937', fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
                <span>SKU</span>
                <input
                  value={productForm.sku}
                  onChange={e => setProductForm({...productForm, sku: e.target.value})}
                  required
                  style={{ minHeight: 56, padding: '14px 16px', border: '1px solid #d1d5db', borderRadius: 12, background: '#f8fafc', fontSize: '1.1rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 8, color: '#1f2937', fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
                <span>Price</span>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={e => setProductForm({...productForm, price: e.target.value})}
                  required
                  style={{ minHeight: 56, padding: '14px 16px', border: '1px solid #d1d5db', borderRadius: 12, background: '#f8fafc', fontSize: '1.1rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 8, color: '#1f2937', fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
                <span>Stock</span>
                <input
                  type="number"
                  value={productForm.stockQuantity}
                  onChange={e => setProductForm({...productForm, stockQuantity: e.target.value})}
                  required
                  style={{ minHeight: 56, padding: '14px 16px', border: '1px solid #d1d5db', borderRadius: 12, background: '#f8fafc', fontSize: '1.1rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 8, color: '#1f2937', fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
                <span>Net Quantity</span>
                <input
                  type="number"
                  value={productForm.netQuantity}
                  onChange={e => setProductForm({...productForm, netQuantity: e.target.value})}
                  required
                  style={{ minHeight: 56, padding: '14px 16px', border: '1px solid #d1d5db', borderRadius: 12, background: '#f8fafc', fontSize: '1.1rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: 8, color: '#1f2937', fontSize: '1.1rem', fontWeight: 600, textAlign: 'left' }}>
                <span>Description</span>
                <textarea
                  value={productForm.description}
                  onChange={e => setProductForm({...productForm, description: e.target.value})}
                  rows={4}
                  style={{ minHeight: 96, padding: '14px 16px', border: '1px solid #d1d5db', borderRadius: 12, background: '#f8fafc', fontSize: '1.05rem', resize: 'vertical' }}
                />
              </label>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 4, alignItems: 'center', height: 48 }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={cancelEditProduct}
                  style={{
                    width: 100,
                    height: 48,
                    padding: '8px 14px',
                    borderRadius: 12,
                    border: '1px solid #1f6feb',
                    background: '#fff',
                    color: '#1f6feb',
                    fontSize: '1rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    boxShadow: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: 330,
                    height: 48,
                    padding: '8px 18px',
                    borderRadius: 12,
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    lineHeight: 1.2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#ff6b35',
                    border: 'none',
                    boxShadow: '0 10px 20px rgba(255, 107, 53, 0.18)',
                    flexShrink: 0
                  }}
                >
                  Update Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
          <form onSubmit={handleCreateProduct} className="panel-form">
            <label>
              Name
              <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
            </label>
            <label>
              SKU
              <input value={productForm.sku} placeholder="Select a category" readOnly required />
            </label>
            <label>
              Category
              <select
                value={productForm.categoryId}
                onChange={e => setProductForm({
                  ...productForm,
                  categoryId: e.target.value,
                  sku: getNextSku(e.target.value),
                })}
                required
              >
                <option value="">Select category</option>
                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </label>
            <label>
              Price
              <input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
            </label>
            <label>
              Stock
              <input type="number" value={productForm.stockQuantity} onChange={e => setProductForm({...productForm, stockQuantity: e.target.value})} required />
            </label>
            <label>
              Net Quantity
              <input type="number" value={productForm.netQuantity} onChange={e => setProductForm({...productForm, netQuantity: e.target.value})} required />
            </label>
            <label>
              Description
              <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={4} />
            </label>
            <label>
              Product Images
              <input type="file" accept="image/*" multiple onChange={handleProductImageSelection} />
            </label>
            {productImagePreviews.length > 0 && (
              <div className="image-preview-grid">
                {productImagePreviews.map((src, index) => (
                  <div key={index} className="image-preview-card">
                    <img src={src} alt={`Preview ${index + 1}`} />
                    <button type="button" className="btn-outline btn-sm" onClick={() => removeProductImage(index)}>Remove</button>
                  </div>
                ))}
              </div>
            )}
            <button type="submit" className="btn-primary">Save Product</button>
          </form>
        </div>

        <div className="dashboard-card wide-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <h2>Product Catalog</h2>
            <div className="date-range-filter">
              <label>
                From
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
              </label>
              <label>
                To
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
              </label>
              {(dateFrom || dateTo) && (
                <button type="button" className="btn-outline btn-sm" onClick={() => { setDateFrom(''); setDateTo(''); }}>
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="catalog-toolbar storefront-toolbar">
            <div className="catalog-search-wrap">
              <span className="catalog-search-icon">🔎</span>
              <input
                type="search"
                value={searchTerm}
                onChange={event => setSearchTerm(event.target.value)}
                placeholder="Search products, categories or SKU..."
                aria-label="Search products"
              />
            </div>

            <div className="catalog-dropdown-wrap">
              <label htmlFor="admin-product-category-filter" className="sr-only">Category filter</label>
              <select
                id="admin-product-category-filter"
                className="catalog-category-select"
                value={activeCategory}
                onChange={event => setActiveCategory(event.target.value)}
              >
                <option value="All">All ({products.length})</option>
                {catalogCategories.map(category => (
                  <option key={category.id || category.name} value={category.name}>
                    {category.icon || '🐾'} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {(searchTerm || activeCategory !== 'All' || dateFrom || dateTo) && (
              <button
                type="button"
                className="btn-outline btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setActiveCategory('All');
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="product-card-grid">
            {filteredProducts.map(product => {
              const productImage = product.imageUrls?.[0] || product.images?.[0] || product.image || 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400&q=80';
              const categoryName = product.categoryName || product.category?.name || product.category || 'Uncategorized';

              return (
                <article key={product.id} className="admin-product-card">
                  <div className="admin-product-image-wrap">
                    <img src={productImage} alt={product.name} className="admin-product-image" />
                    {product.badge && <span className="admin-product-badge">{product.badge}</span>}
                  </div>

                  <div className="admin-product-body">
                    <div className="admin-product-topline">
                      <span className="admin-product-category">{categoryName}</span>
                      <span className="admin-product-id">#{product.id}</span>
                    </div>

                    <h3 className="admin-product-name">{product.name}</h3>
                    <p className="admin-product-sku">{product.sku || 'SKU unavailable'}</p>

                    <div className="admin-product-meta">
                      <span><strong>₹{Number(product.price ?? 0).toLocaleString()}</strong></span>
                      <span>{product.stockQuantity ?? 0} in stock</span>
                    </div>

                    <div className="admin-product-actions">
                      <button type="button" className="btn-outline btn-sm" onClick={() => startEditProduct(product)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
