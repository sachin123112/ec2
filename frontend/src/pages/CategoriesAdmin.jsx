import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function CategoriesAdmin() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '', brandId: '' });
  const [status, setStatus] = useState('');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryPage, setCategoryPage] = useState(1);

  const seededCategories = [
    { id: 1, name: 'Dogs', products: 125, createdAt: '12 Jul 2026', active: true },
    { id: 2, name: 'Cats', products: 98, createdAt: '12 Jul 2026', active: true },
    { id: 3, name: 'Fish', products: 76, createdAt: '11 Jul 2026', active: true },
    { id: 4, name: 'Plants', products: 54, createdAt: '10 Jul 2026', active: true },
    { id: 5, name: 'Birds', products: 63, createdAt: '10 Jul 2026', active: true },
    { id: 6, name: 'Pet Food', products: 142, createdAt: '09 Jul 2026', active: true },
    { id: 7, name: 'Fish Food', products: 41, createdAt: '09 Jul 2026', active: true },
    { id: 8, name: 'Aquarium Plants', products: 38, createdAt: '08 Jul 2026', active: true },
    { id: 9, name: 'Aquarium Tanks', products: 26, createdAt: '08 Jul 2026', active: true },
    { id: 10, name: 'Aquarium Stone and Wood', products: 31, createdAt: '07 Jul 2026', active: true },
  ];

  const allCategories = categories.length > 0 ? categories : seededCategories;
  const normalizedCategorySearch = categorySearch.trim().toLowerCase();
  const filteredCategories = allCategories.filter(category => (
    !normalizedCategorySearch
    || category.name?.toLowerCase().includes(normalizedCategorySearch)
    || String(category.id || '').toLowerCase().includes(normalizedCategorySearch)
    || category.brandName?.toLowerCase().includes(normalizedCategorySearch)
  ));
  const categoriesPerPage = 10;
  const categoryPageCount = Math.max(1, Math.ceil(filteredCategories.length / categoriesPerPage));
  const displayCategories = filteredCategories.slice((categoryPage - 1) * categoriesPerPage, categoryPage * categoriesPerPage);
  const categoryIcons = ['🐶', '🐱', '🐟', '🌿', '🦜', '🥩', '🌾', '🌱', '🐠', '🪨'];
  const availableBrands = brands.length > 0 ? brands : [
    { id: 'royal-canin', name: 'Royal Canin' },
    { id: 'pedigree', name: 'Pedigree' },
    { id: 'whiskas', name: 'Whiskas' },
    { id: 'drools', name: 'Drools' },
  ];

  function formatCategoryDate(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

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
      const [categoriesRes, brandsRes] = await Promise.all([
        fetch(`${API_URL}/categories`, { headers: authHeaders }),
        fetch(`${API_URL}/admin/brands`, { headers: authHeaderBase }),
      ]);
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (brandsRes.ok) setBrands(await brandsRes.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load categories data.');
    }
  }, [authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreateCategory(event) {
    event.preventDefault();
    setStatus('Creating category...');
    const response = await fetch(`${API_URL}/categories`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: categoryForm.name, brandId: categoryForm.brandId ? Number(categoryForm.brandId) : null }),
    });
    if (response.ok) {
      setCategoryForm({ name: '', brandId: '' });
      setIsCategoryModalOpen(false);
      await loadData();
      setStatus('Category added successfully.');
    } else {
      setStatus('Unable to create category.');
    }
  }

  function openCategoryModal() {
    setCategoryForm({ name: '', brandId: '' });
    setIsCategoryModalOpen(true);
  }

  async function handleDeleteCategory(id) {
    setStatus('Deleting category...');
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Category removed successfully.');
    } else {
      setStatus('Unable to delete category.');
    }
  }

  return (
    <div className="dashboard-page categories-admin-page">
      <div className="dashboard-header categories-admin-header">
        <div className="dashboard-header-left">
          <div className="products-admin-breadcrumb">
            <Link to="/admin/dashboard">Dashboard</Link>
            <span>›</span>
            <Link to="/admin/categories">Categories</Link>
            <span>›</span>
            <span className="products-admin-breadcrumb-current">Manage Categories</span>
          </div>
          <h1>Manage Categories</h1>
          <p>Add, edit or manage your pet product categories for your store.</p>
          <div className="header-links">
            <Link to="/admin/products" className="btn-outline">Products</Link>
            <Link to="/admin/users" className="btn-outline">Users</Link>
            <Link to="/admin/orders" className="btn-outline">Orders</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-status category-status-row">
        <span>{status}</span>
        <button type="button" className="add-category-cta" onClick={openCategoryModal}>+ Add Category</button>
      </div>

      <div className="categories-layout">
        {isCategoryModalOpen && (
          <div className="category-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="add-category-title">
            <div className="category-modal-card">
        <div className="dashboard-card categories-form-card">
          <div className="category-section-header">
            <div className="category-modal-heading">
              <h2 id="add-category-title">Add Category</h2>
              <button type="button" className="category-modal-close" onClick={() => setIsCategoryModalOpen(false)} aria-label="Close add category dialog">×</button>
            </div>
            <span>Create a new product category</span>
          </div>

          <form onSubmit={handleCreateCategory} className="panel-form categories-form">
            <label className="field-block">
              <span>Category Name <span className="required-mark">*</span></span>
              <input
                value={categoryForm.name}
                onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                required
                placeholder="Enter category name"
              />
            </label>

            <label className="field-block">
              <span>Parent Category (Optional)</span>
              <select defaultValue="">
                <option value="">Select parent category</option>
                {allCategories.map(category => (
                  <option key={category.id || category.name} value={category.id}>{category.name}</option>
                ))}
              </select>
            </label>

            <label className="field-block">
              <span>Brand (Optional)</span>
              <select
                value={categoryForm.brandId}
                onChange={event => setCategoryForm({ ...categoryForm, brandId: event.target.value })}
              >
                <option value="">Select brand</option>
                {availableBrands.map(brand => (
                  <option key={brand.id || brand.name} value={brand.id}>{brand.name}</option>
                ))}
              </select>
            </label>

            <label className="field-block">
              <span>Category Image</span>
              <div className="upload-dropzone">
                <div className="upload-icon">☁</div>
                <div>Drag &amp; drop an image here<br />or click to browse</div>
              </div>
            </label>

            <label className="field-block">
              <span>Description (Optional)</span>
              <textarea rows="4" placeholder="Enter category description..." />
            </label>

            <div className="toggle-row">
              <span>Active Status</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider" />
              </label>
              <small>Category will be visible in the store</small>
            </div>

            <button type="submit" className="btn-primary categories-save-button">Save Category</button>
          </form>
        </div>
            </div>
          </div>
        )}

        <div className="dashboard-card wide-card categories-list-card">
          <div className="category-list-header">
            <div>
              <h2>Category List</h2>
              <p>Manage, edit or delete categories</p>
            </div>
            <div className="category-search-box">
              <span>⌕</span>
              <input
                type="search"
                value={categorySearch}
                onChange={event => { setCategorySearch(event.target.value); setCategoryPage(1); }}
                placeholder="Search categories..."
                aria-label="Search categories"
              />
            </div>
          </div>

          <div className="table-scroll">
            <table className="category-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Category Name</th>
                  <th>Products</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayCategories.map((cat, index) => (
                  <tr key={cat.id ?? index}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="category-thumb">{categoryIcons[index % categoryIcons.length]}</div>
                    </td>
                    <td className="category-name-cell">{cat.name}</td>
                    <td>{cat.products ?? 0}</td>
                    <td>
                      <span className={`status-badge ${cat.active === false ? 'inactive' : 'active'}`}>
                        {cat.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td>{formatCategoryDate(cat.createdAt || '12 Jul 2026')}</td>
                    <td>
                      <div className="table-actions">
                        <button type="button" className="table-icon-btn edit" aria-label="Edit category">✎</button>
                        <button type="button" className="table-icon-btn delete" aria-label="Delete category" onClick={() => handleDeleteCategory(cat.id)}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="category-footer-row">
            <span>Showing {filteredCategories.length === 0 ? 0 : (categoryPage - 1) * categoriesPerPage + 1} to {Math.min(categoryPage * categoriesPerPage, filteredCategories.length)} of {filteredCategories.length} categories</span>
            <div className="pagination-controls">
              <button type="button" aria-label="Previous page" disabled={categoryPage === 1} onClick={() => setCategoryPage(page => Math.max(1, page - 1))}>«</button>
              {Array.from({ length: categoryPageCount }, (_, index) => index + 1).map(page => (
                <button type="button" key={page} className={`page-btn ${categoryPage === page ? 'active' : ''}`} onClick={() => setCategoryPage(page)}>{page}</button>
              ))}
              <button type="button" aria-label="Next page" disabled={categoryPage === categoryPageCount} onClick={() => setCategoryPage(page => Math.min(categoryPageCount, page + 1))}>»</button>
            </div>
          </div>
        </div>
      </div>

      <footer className="site-footer">
        <div className="footer-brand">
          <div className="footer-logo">🐾 PawMart</div>
          <p>Your one-stop shop for all pet needs. Quality products for happy, healthy pets.</p>
          <div className="social-row">
            <span>f</span>
            <span>◎</span>
            <span>◌</span>
            <span>x</span>
          </div>
        </div>

        <div className="footer-column">
          <h4>Quick Links</h4>
          <ul>
            <li>Home</li>
            <li>All Products</li>
            <li>Cart</li>
            <li>My Orders</li>
          </ul>
        </div>

        <div className="footer-column">
          <h4>Categories</h4>
          <ul>
            <li>Dog Products</li>
            <li>Cat Products</li>
            <li>Fish Products</li>
            <li>Bird Products</li>
          </ul>
        </div>

        <div className="footer-column footer-contact">
          <h4>Contact</h4>
          <ul>
            <li>+91 87488 11267</li>
            <li>shop@pawmart.com</li>
            <li>123 Pet Lane, Bengaluru, Karnataka 560001</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
