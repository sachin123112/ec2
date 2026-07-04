import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function CategoriesAdmin() {
  const { token } = useAuth();
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
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
      const res = await fetch(`${API_URL}/categories`, { headers: authHeaders });
      if (res.ok) setCategories(await res.json());
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
      body: JSON.stringify({ name: categoryForm.name }),
    });
    if (response.ok) {
      setCategoryForm({ name: '' });
      await loadData();
      setStatus('Category created successfully.');
    } else {
      setStatus('Unable to create category.');
    }
  }

  async function handleDeleteCategory(id) {
    setStatus('Deleting category...');
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Category deleted successfully.');
    } else {
      setStatus('Unable to delete category.');
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Categories</h1>
          <p>Manage product categories</p>
          <div className="header-links" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <Link to="/admin/products" className="btn-outline">Products</Link>
            <Link to="/admin/users" className="btn-outline">Users</Link>
            <Link to="/admin/orders" className="btn-outline">Orders</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Add Category</h2>
          <form onSubmit={handleCreateCategory} className="panel-form">
            <label>
              Name
              <input value={categoryForm.name} onChange={e => setCategoryForm({...categoryForm, name: e.target.value})} required />
            </label>
            <button type="submit" className="btn-primary">Save Category</button>
          </form>
        </div>

        <div className="dashboard-card wide-card">
          <h2>Category List</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id}>
                    <td>{cat.id}</td>
                    <td>{cat.name}</td>
                    <td>
                      <button className="btn-danger btn-sm" onClick={() => handleDeleteCategory(cat.id)}>Delete</button>
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
