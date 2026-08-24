import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function ProductsAdmin() {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', categoryId: '' });
  const [productImages, setProductImages] = useState([]);
  const [productImagePreviews, setProductImagePreviews] = useState([]);
  const [status, setStatus] = useState('');

  const authHeaderBase = useMemo(() => {
    const headers = {};
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  const authHeaders = useMemo(() => ({
    ...authHeaderBase,
    'Content-Type': 'application/json',
  }), [authHeaderBase]);

  const loadData = useCallback(async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/products`, { headers: authHeaders }),
        fetch(`${API_URL}/categories`, { headers: authHeaders }),
      ]);
      if (productsRes.ok) setProducts(await productsRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load products data.');
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
      setProductForm({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', categoryId: '' });
      setProductImages([]);
      setProductImagePreviews(prev => { prev.forEach(URL.revokeObjectURL); return []; });
      await loadData();
      setStatus('Product added successfully.');
    } else {
      const errorText = await response.text();
      setStatus(errorText || `Unable to create product (${response.status}).`);
    }
  }

  async function handleDeleteProduct(id) {
    setStatus('Deleting product...');
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Product deleted successfully.');
    } else {
      setStatus('Unable to delete product.');
    }
  }

  const filteredProducts = products;

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
          <form onSubmit={handleCreateProduct} className="panel-form">
            <label>
              Name
              <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
            </label>
            <label>
              SKU
              <input value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} required />
            </label>
            <label>
              Category
              <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})}>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Product Catalog</h2>
            <div className="card-actions" style={{ display: 'flex', gap: 8 }}>
              <Link to="/admin/users" className="icon-btn" title="Users">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11c1.657 0 3-1.567 3-3.5S17.657 4 16 4s-3 1.567-3 3.5S14.343 11 16 11zM8 11c1.657 0 3-1.567 3-3.5S9.657 4 8 4 5 5.567 5 7.5 6.343 11 8 11z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link to="/admin/orders" className="icon-btn" title="Orders">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M16 3v4M8 3v4" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
              <Link to="/admin/categories" className="icon-btn" title="Categories">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 7h16M4 12h16M4 17h16" stroke="#374151" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </Link>
            </div>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Price</th>
                  <th>Stock</th>
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
                    <td>
                      <button className="btn-danger btn-sm" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
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
