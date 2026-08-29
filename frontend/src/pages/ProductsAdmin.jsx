import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function ProductsAdmin() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', netQuantity: '1 pack', categoryId: '' });
  const [editingProductId, setEditingProductId] = useState(null);
  const [productImages, setProductImages] = useState([]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [status, setStatus] = useState('');
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [nameMenuOpen, setNameMenuOpen] = useState(false);

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
      setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Unable to load products data.');
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
      netQuantity: productForm.netQuantity.trim() || '1 pack',
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
      if (payload.categoryId !== null) formData.append('categoryId', payload.categoryId.toString());
      productImages.forEach(file => formData.append('images', file));

      response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: authHeaderBase,
        body: formData,
      });
    } else {
      response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
    }

    if (response.ok) {
      setProductForm({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', netQuantity: '1 pack', categoryId: '' });
      setEditingProductId(null);
      setProductImages([]);
      setProductImagePreviews(prev => { prev.forEach(URL.revokeObjectURL); return []; });
      await loadData();
      setStatus('Product added successfully.');
    } else {
      const errorText = await response.text();
      setStatus(errorText || `Unable to create product (${response.status}).`);
    }
  }

  function editProduct(product) {
    setEditingProductId(product.id);
    setProductForm({ name: product.name || '', description: product.description || '', sku: product.sku || '', price: String(product.price ?? '0.00'), stockQuantity: String(product.stockQuantity ?? 0), netQuantity: product.netQuantity || '1 pack', categoryId: String(product.categoryId || '') });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmitProduct(event) {
    if (!editingProductId) return handleCreateProduct(event);
    event.preventDefault();
    setStatus('Updating product...');
    try {
      const response = await fetch(`${API_URL}/products/${editingProductId}`, { method: 'PUT', headers: authHeaders, body: JSON.stringify({ name: productForm.name, description: productForm.description, price: parseFloat(productForm.price) || 0, stockQuantity: parseInt(productForm.stockQuantity, 10) || 0, netQuantity: productForm.netQuantity.trim() || '1 pack', categoryId: productForm.categoryId ? parseInt(productForm.categoryId, 10) : null }) });
      if (!response.ok) throw new Error((await response.text()) || `Unable to update product (${response.status}).`);
      await loadData();
      setEditingProductId(null);
      setProductForm({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', netQuantity: '1 pack', categoryId: '' });
      setStatus('Product updated successfully.');
    } catch (err) {
      setStatus(err.message || 'Unable to update product.');
    }
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

  const filteredProducts = products.filter(product => {
    if (nameFilter && !product.name?.toLowerCase().includes(nameFilter.toLowerCase())) return false;
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

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Add Product</h2>
          <form onSubmit={handleSubmitProduct} className="panel-form">
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
              <input value={productForm.netQuantity} placeholder="1 pack (3 x 30 ml)" onChange={e => setProductForm({...productForm, netQuantity: e.target.value})} required />
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
            <button type="submit" className="btn-primary">{editingProductId ? 'Update Product' : 'Save Product'}</button>
          </form>
        </div>

        <div className="dashboard-card wide-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>
                    <div className="table-header-filter">
                      <span>Name</span>
                      <button
                        type="button"
                        className="table-filter-trigger"
                        aria-label="Filter products by name"
                        aria-expanded={nameMenuOpen}
                        onClick={() => setNameMenuOpen(previous => !previous)}
                      >
                        ⋮
                      </button>
                      {nameMenuOpen && (
                        <div className="table-filter-menu">
                          <label htmlFor="product-name-filter">Filter name</label>
                          <input
                            id="product-name-filter"
                            type="search"
                            value={nameFilter}
                            onChange={event => setNameFilter(event.target.value)}
                            placeholder="Search product name"
                          />
                          <button type="button" className="btn-outline btn-sm" onClick={() => { setNameFilter(''); setNameMenuOpen(false); }}>
                            Clear
                          </button>
                        </div>
                      )}
                    </div>
                  </th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Net Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map(product => (
                  <tr key={product.id}>
                    <td>{product.id}</td>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>{product.price}</td>
                    <td>{product.stockQuantity}</td>
                    <td>{product.netQuantity || '1 pack'}</td>
                    <td>
                      <button type="button" className="btn-outline btn-sm" onClick={() => editProduct(product)}>Edit</button>{' '}
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        onClick={() => handleDeleteProduct(product.id)}
                        disabled={deletingProductId === product.id}
                      >
                        {deletingProductId === product.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
