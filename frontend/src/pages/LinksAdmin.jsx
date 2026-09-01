import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function LinksAdmin() {
  const { token } = useAuth();
  const [links, setLinks] = useState([]);
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
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load links data.');
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

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Links</h1>
          <p>Manage site links</p>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      <div className="dashboard-grid">
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
