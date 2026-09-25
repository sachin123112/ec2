import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './BrandsAdmin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const initialBrands = [
  { id: 1, name: 'Royal Canin', tone: 'red', createdAt: '12 Jul 2026', status: 'Active' },
  { id: 2, name: 'Pedigree', tone: 'gold', createdAt: '11 Jul 2026', status: 'Active' },
  { id: 3, name: 'Whiskas', tone: 'purple', createdAt: '10 Jul 2026', status: 'Active' },
  { id: 4, name: 'Me-O', tone: 'coral', createdAt: '09 Jul 2026', status: 'Active' },
  { id: 5, name: 'Drools', tone: 'blue', createdAt: '08 Jul 2026', status: 'Active' },
  { id: 6, name: 'Himalaya', tone: 'teal', createdAt: '07 Jul 2026', status: 'Active' },
  { id: 7, name: 'Purina', tone: 'black', createdAt: '06 Jul 2026', status: 'Active' },
  { id: 8, name: 'Hills', tone: 'red', createdAt: '05 Jul 2026', status: 'Inactive' },
  { id: 9, name: 'Sheba', tone: 'black', createdAt: '04 Jul 2026', status: 'Active' },
  { id: 10, name: 'Tetra', tone: 'gold', createdAt: '03 Jul 2026', status: 'Active' },
];

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getProductCount(products, brandName) {
  const brand = normalize(brandName);
  return products.filter(product => normalize(product.brand || product.brandName || product.name).startsWith(brand)).length;
}

export default function BrandsAdmin() {
  const { token } = useAuth();
  const [brands, setBrands] = useState(initialBrands);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({ name: '', tone: 'blue' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/products`, { headers: token ? { Authorization: `Bearer ${token}` } : {} })
      .then(response => response.ok ? response.json() : [])
      .then(data => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setMessage('Product counts are unavailable right now.'));
  }, [token]);

  const filteredBrands = useMemo(() => brands.filter(brand => {
    const matchesSearch = !searchTerm.trim() || brand.name.toLowerCase().includes(searchTerm.trim().toLowerCase());
    const matchesStatus = statusFilter === 'All' || brand.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [brands, searchTerm, statusFilter]);

  function handleAddBrand(event) {
    event.preventDefault();
    const name = form.name.trim();
    if (!name) return;
    setBrands(previous => [{
      id: Date.now(),
      name,
      tone: form.tone,
      createdAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Active',
    }, ...previous]);
    setForm({ name: '', tone: 'blue' });
    setIsAddOpen(false);
    setMessage(`${name} added to this session.`);
  }

  function toggleBrandStatus(id) {
    setBrands(previous => previous.map(brand => brand.id === id
      ? { ...brand, status: brand.status === 'Active' ? 'Inactive' : 'Active' }
      : brand));
  }

  function removeBrand(id) {
    setBrands(previous => previous.filter(brand => brand.id !== id));
    setMessage('Brand removed from this session.');
  }

  return (
    <div className="brands-admin-page">
      <header className="brands-admin-header">
        <div>
          <h1>Manage Brands</h1>
          <div className="brands-admin-breadcrumb"><Link to="/admin/dashboard">Home</Link><span>›</span><span>Brands</span></div>
        </div>
        <button type="button" className="brands-admin-add" onClick={() => setIsAddOpen(true)}><span>+</span> Add Brand</button>
      </header>

      {message && <div className="brands-admin-message" role="status">{message}</div>}

      {isAddOpen && (
        <div className="brands-admin-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && setIsAddOpen(false)}>
          <form className="brands-admin-modal" onSubmit={handleAddBrand}>
            <div className="brands-admin-modal-heading"><div><span className="brands-admin-kicker">Catalog setup</span><h2>Add brand</h2></div><button type="button" className="brands-admin-close" onClick={() => setIsAddOpen(false)} aria-label="Close">×</button></div>
            <label>Brand name<input autoFocus value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="e.g. Royal Canin" required /></label>
            <label>Logo color<select value={form.tone} onChange={event => setForm({ ...form, tone: event.target.value })}><option value="blue">Blue</option><option value="red">Red</option><option value="gold">Gold</option><option value="purple">Purple</option><option value="teal">Teal</option></select></label>
            <div className="brands-admin-modal-actions"><button type="button" className="brands-admin-secondary" onClick={() => setIsAddOpen(false)}>Cancel</button><button type="submit" className="brands-admin-add">Save Brand</button></div>
          </form>
        </div>
      )}

      <section className="brands-admin-card">
        <div className="brands-admin-toolbar">
          <label className="brands-admin-search"><span>⌕</span><input type="search" value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search brands..." aria-label="Search brands" /></label>
          <label className="brands-admin-filter">Status<select value={statusFilter} onChange={event => setStatusFilter(event.target.value)}><option>All</option><option>Active</option><option>Inactive</option></select></label>
        </div>

        <div className="brands-admin-table-wrap">
          <table className="brands-admin-table">
            <thead><tr><th><input type="checkbox" aria-label="Select all brands" /></th><th>#</th><th>Brand Logo</th><th>Brand Name</th><th>Product Count</th><th>Status</th><th>Created At</th><th>Actions</th></tr></thead>
            <tbody>
              {filteredBrands.map((brand, index) => (
                <tr key={brand.id}>
                  <td><input type="checkbox" aria-label={`Select ${brand.name}`} /></td>
                  <td>{index + 1}</td>
                  <td><div className={`brands-admin-logo brands-admin-logo--${brand.tone}`}>{brand.name}</div></td>
                  <td className="brands-admin-name">{brand.name}</td>
                  <td>{getProductCount(products, brand.name)}</td>
                  <td><button type="button" className={`brands-admin-status brands-admin-status--${brand.status.toLowerCase()}`} onClick={() => toggleBrandStatus(brand.id)}>{brand.status}</button></td>
                  <td>{brand.createdAt}</td>
                  <td><div className="brands-admin-actions"><button type="button" className="brands-admin-edit" onClick={() => setMessage(`Edit form for ${brand.name} is ready for backend integration.`)} aria-label={`Edit ${brand.name}`}>✎</button><button type="button" className="brands-admin-delete" onClick={() => removeBrand(brand.id)} aria-label={`Delete ${brand.name}`}>♧</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredBrands.length === 0 && <div className="brands-admin-empty">No brands match your filters.</div>}
        </div>

        <footer className="brands-admin-footer"><span>Showing {filteredBrands.length} of {brands.length} brands</span><div className="brands-admin-pagination"><button type="button" disabled>‹</button><button type="button" className="active">1</button><button type="button">2</button><button type="button">3</button><button type="button">›</button></div></footer>
      </section>
    </div>
  );
}
