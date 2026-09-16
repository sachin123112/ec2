import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const ALLOWED_BANNER_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const BANNER_PAGES = [
  { value: 'HOME', label: 'Mobile Home page' },
  { value: 'WALLET', label: 'Mobile Wallet page' },
  { value: 'PRODUCTS', label: 'Mobile Products page' },
  { value: 'WISHLIST', label: 'Mobile Wishlist page' },
];

function resolveBannerUrl(imageUrl) {
  if (!imageUrl || /^(https?:|data:|blob:)/i.test(imageUrl)) return imageUrl;
  return `${API_URL.replace(/\/api\/v1\/?$/, '')}/${imageUrl.replace(/^\/+/, '')}`;
}

export default function LinksAdmin() {
  const { token } = useAuth();
  const [links, setLinks] = useState([]);
  const [banners, setBanners] = useState([]);
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState('');
  const [bannerPage, setBannerPage] = useState('HOME');
  const [linkForm, setLinkForm] = useState({ label: '', url: '', description: '', isActive: true });
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
      const linksRes = await fetch(`${API_URL}/links`, { headers: authHeaders });
      if (linksRes.ok) setLinks(await linksRes.json());
      
      const bannersRes = await fetch(`${API_URL}/banners`, { headers: authHeaders });
      if (bannersRes.ok) {
        const bannersData = await bannersRes.json();
        setBanners(Array.isArray(bannersData) ? bannersData : []);
      }
      
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load data.');
    }
  }, [authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreateLink(event) {
    event.preventDefault();
    setStatus('Creating link...');
    const response = await fetch(`${API_URL}/links`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(linkForm),
    });
    if (response.ok) {
      setLinkForm({ label: '', url: '', description: '', isActive: true });
      await loadData();
      setStatus('Link added successfully.');
    } else {
      setStatus('Unable to create link.');
    }
  }

  async function handleDeleteLink(id) {
    setStatus('Deleting link...');
    const response = await fetch(`${API_URL}/links/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Link removed successfully.');
    } else {
      setStatus('Unable to delete link.');
    }
  }

  function handleBannerFileSelect(event) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!ALLOWED_BANNER_IMAGE_TYPES.has(file.type)) {
      setStatus('Please upload a valid image file (JPEG, PNG, or WebP).');
      event.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setStatus('Image size must be less than 5MB.');
      event.target.value = '';
      return;
    }

    event.target.value = '';
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setStatus('Banner image selected. Click "Upload Banner" to save.');
  }

  async function handleBannerUpload() {
    if (!bannerFile) {
      setStatus('Please select a banner image first.');
      return;
    }

    setStatus('Uploading banner...');
    const formData = new FormData();
    formData.append('image', bannerFile);
    formData.append('page', bannerPage);

    try {
      const response = await fetch(`${API_URL}/banners`, {
        method: 'POST',
        headers: authHeaderBase,
        body: formData,
      });

      if (response.ok) {
        setBannerFile(null);
        setBannerPreview('');
        await loadData();
        setStatus('Banner uploaded successfully.');
      } else {
        const errorText = await response.text();
        setStatus(errorText || `Unable to upload banner (${response.status}).`);
      }
    } catch (err) {
      console.error('Banner upload error:', err);
      setStatus('Error uploading banner. Please try again.');
    }
  }

  async function handleBannerDelete(bannerId) {
    if (!bannerId) {
      setStatus('Invalid banner ID.');
      return;
    }

    setStatus('Deleting banner...');
    try {
      const response = await fetch(`${API_URL}/banners/${bannerId}`, {
        method: 'DELETE',
        headers: authHeaders,
      });

      if (response.ok) {
        await loadData();
        setStatus('Banner deleted successfully.');
      } else {
        setStatus('Unable to delete banner.');
      }
    } catch (err) {
      console.error('Banner delete error:', err);
      setStatus('Error deleting banner. Please try again.');
    }
  }

  function cancelBannerUpload() {
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(null);
    setBannerPreview('');
    setStatus('');
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Links</h1>
          <p>Manage site links and banner</p>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Banner Management</h2>
          
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Upload New Banner</h3>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Mobile page
            </label>
            <select
              value={bannerPage}
              onChange={event => setBannerPage(event.target.value)}
              style={{ display: 'block', marginBottom: '12px', padding: '8px', minWidth: '220px' }}
            >
              {BANNER_PAGES.map(page => <option key={page.value} value={page.value}>{page.label}</option>)}
            </select>
            <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
              Upload Banner Image
            </label>
            <input 
              type="file" 
              accept="image/jpeg,image/png,image/webp" 
              onChange={handleBannerFileSelect}
              style={{ marginBottom: '10px', display: 'block' }}
            />
            <small style={{ color: '#666', display: 'block', marginBottom: '10px' }}>
              Supported formats: JPEG, PNG, WebP (Max 5MB)
            </small>
            
            {bannerPreview && (
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <img src={bannerPreview} alt="Banner Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
                <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>Preview</p>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="btn-primary" onClick={handleBannerUpload} disabled={!bannerFile}>
                Upload Banner
              </button>
              {bannerFile && (
                <button type="button" className="btn-secondary" onClick={cancelBannerUpload}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {banners && banners.length > 0 && (
            <div>
              <h3 style={{ marginBottom: '15px' }}>Uploaded Banners ({banners.length})</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                {banners.map((banner) => (
                  <div key={banner.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                    <img 
                      src={resolveBannerUrl(banner.imageUrl)} 
                      alt={`Banner ${banner.id}`} 
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '6px', marginBottom: '10px' }} 
                    />
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
                      {BANNER_PAGES.find(page => page.value === banner.pageKey)?.label || banner.pageKey} · ID: {banner.id}
                    </p>
                    <button 
                      type="button" 
                      className="btn-danger" 
                      onClick={() => handleBannerDelete(banner.id)}
                      style={{ width: '100%' }}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-card">
          <h2>Add Link</h2>
          <form onSubmit={handleCreateLink} className="panel-form">
            <label>
              Label
              <input value={linkForm.label} onChange={e => setLinkForm({...linkForm, label: e.target.value})} required />
            </label>
            <label>
              URL
              <input type="url" value={linkForm.url} onChange={e => setLinkForm({...linkForm, url: e.target.value})} required />
            </label>
            <label>
              Description
              <textarea value={linkForm.description} onChange={e => setLinkForm({...linkForm, description: e.target.value})} rows={4} />
            </label>
            <label>
              Active
              <select value={linkForm.isActive ? 'true' : 'false'} onChange={e => setLinkForm({...linkForm, isActive: e.target.value === 'true'})}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>
            <button type="submit" className="btn-primary">Save Link</button>
          </form>
        </div>

        <div className="dashboard-card wide-card">
          <h2>Link List</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Label</th>
                  <th>URL</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {links.map(link => (
                  <tr key={link.id}>
                    <td>{link.id}</td>
                    <td>{link.label}</td>
                    <td><a href={link.url} target="_blank" rel="noreferrer">Open</a></td>
                    <td>{link.isActive ? 'Active' : 'Inactive'}</td>
                    <td>
                      <button className="btn-danger btn-sm" onClick={() => handleDeleteLink(link.id)}>Delete</button>
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
