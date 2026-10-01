import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import './LinksAdmin.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
const ALLOWED_BANNER_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ADMIN_BANNER_PAGES = [
  { value: 'HOME', label: 'Home page' },
  { value: 'SHOP', label: 'Shop page' },
  { value: 'BRANDS', label: 'Brand page' },
  { value: 'OFFERS', label: 'Offer page' },
  { value: 'CART', label: 'Cart page' },
];
const MOBILE_BANNER_PAGES = [
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
  const [mobileBannerPage, setMobileBannerPage] = useState('WALLET');
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

  async function handleBannerUpload(pageOverride = bannerPage) {
    if (!bannerFile) {
      setStatus('Please select a banner image first.');
      return;
    }

    setStatus('Uploading banner...');
    const formData = new FormData();
    formData.append('image', bannerFile);
    formData.append('page', pageOverride);

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
    <div className="dashboard-page links-page">
      <div className="breadcrumb">
        <span>Dashboard</span>
        <span>›</span>
        <span>Links</span>
        <span>›</span>
        <span className="breadcrumb-current">Banners</span>
      </div>

      <div className="links-page-header">
        <div className="links-page-title">
          <div className="links-page-icon">🔗</div>
          <div>
            <h1>Manage Link / Banner</h1>
            <p>Add and manage slider banners, category links, or custom links for your store.</p>
          </div>
        </div>

        <button type="button" className="btn-outline links-page-back-btn">← Back to List</button>
      </div>

      <div className="dashboard-status">{status}</div>

      <div className="links-editor-grid">
        <section className="links-panel links-upload-panel">
          <div className="panel-title-row">
            <div className="panel-icon panel-icon-amber">🖼</div>
            <h2>Banner Image</h2>
          </div>

          <div className="upload-dropzone">
            <label htmlFor="links-banner-upload" className="upload-trigger">
              <span className="upload-visual">☁</span>
              <span className="upload-line">Drag &amp; drop an image here</span>
              <span className="upload-line secondary">or click to browse</span>
            </label>
            <input id="links-banner-upload" type="file" accept="image/jpeg,image/png,image/webp" onChange={handleBannerFileSelect} />
          </div>

          <div className="banner-upload-controls">
            <label>
              <span>Admin page</span>
              <select value={bannerPage} onChange={event => setBannerPage(event.target.value)}>
                {ADMIN_BANNER_PAGES.map(page => <option key={page.value} value={page.value}>{page.label}</option>)}
              </select>
            </label>
            <button type="button" className="btn-primary" onClick={handleBannerUpload} disabled={!bannerFile}>Upload Banner</button>
          </div>

          {bannerPreview && (
            <div className="banner-preview">
              <img src={bannerPreview} alt="Selected banner preview" />
            </div>
          )}

          {bannerFile && (
            <button type="button" className="btn-outline banner-cancel-btn" onClick={cancelBannerUpload}>Cancel</button>
          )}
        </section>

        <section className="links-panel links-form-panel">
          <div className="panel-title-row">
            <div className="panel-icon panel-icon-blue">🔗</div>
            <h2>Link Details</h2>
          </div>

          <form onSubmit={handleCreateLink} className="panel-form">
            <label className="field field-full">
              <span>Label</span>
              <input value={linkForm.label} onChange={e => setLinkForm({ ...linkForm, label: e.target.value })} required />
            </label>

            <label className="field field-full">
              <span>URL</span>
              <input type="url" value={linkForm.url} onChange={e => setLinkForm({ ...linkForm, url: e.target.value })} required />
            </label>

            <label className="field field-full">
              <span>Description</span>
              <textarea value={linkForm.description} onChange={e => setLinkForm({ ...linkForm, description: e.target.value })} rows={4} />
            </label>

            <div className="field-row">
              <label className="field">
                <span>Open In</span>
                <select value={linkForm.openIn || 'same-tab'} onChange={e => setLinkForm({ ...linkForm, openIn: e.target.value })}>
                  <option value="same-tab">Same Tab</option>
                  <option value="new-tab">New Tab</option>
                </select>
              </label>

              <label className="field">
                <span>Display Order</span>
                <input type="number" min="1" value={linkForm.displayOrder || 1} onChange={e => setLinkForm({ ...linkForm, displayOrder: Number(e.target.value || 1) })} />
              </label>
            </div>

            <label className="field field-full">
              <span>Active Status</span>
              <select value={linkForm.isActive ? 'true' : 'false'} onChange={e => setLinkForm({ ...linkForm, isActive: e.target.value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </label>

            <div className="form-actions">
              <button type="button" className="btn-outline" onClick={() => setLinkForm({ label: '', url: '', description: '', isActive: true, openIn: 'same-tab', displayOrder: 1 })}>Reset</button>
              <button type="submit" className="btn-primary">Save Link</button>
            </div>
          </form>
        </section>
      </div>

      <section className="links-panel link-list-panel">
        <div className="link-list-header">
          <div className="panel-title-row compact-title">
            <div className="panel-icon panel-icon-purple">☰</div>
            <h2>Link List</h2>
          </div>
          <div className="link-list-tools">
            <div className="table-search">
              <span>⌕</span>
              <input type="text" placeholder="Search links..." />
            </div>
            <select className="table-filter" defaultValue="all">
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="table-scroll">
          <table className="link-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Preview</th>
                <th>Label</th>
                <th>URL</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link, index) => (
                <tr key={link.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="link-preview">
                      <span className="link-preview-thumb">P</span>
                    </div>
                  </td>
                  <td>{link.label}</td>
                  <td className="table-url">{link.url}</td>
                  <td>
                    <span className={`status-badge ${link.isActive ? 'active' : 'inactive'}`}>
                      {link.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button type="button" className="icon-button" aria-label="Edit link">✎</button>
                      <button type="button" className="icon-button danger" aria-label="Delete link" onClick={() => handleDeleteLink(link.id)}>🗑</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
