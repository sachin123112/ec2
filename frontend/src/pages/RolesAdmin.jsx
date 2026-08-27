import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const rolePermissions = {
  ADMIN: ['Manage users', 'Manage products', 'Manage orders', 'Manage settings'],
  USER: ['Browse products', 'Place orders', 'Manage profile'],
  MOBILE_ADMIN: ['View mobile dashboard', 'Manage users', 'Manage orders', 'Manage settings'],
  MOBILE_USER: ['Browse mobile catalog', 'Place mobile orders', 'Manage mobile profile'],
};

export default function RolesAdmin() {
  const { token } = useAuth();
  const [roles, setRoles] = useState([]);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
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
      const rolesRes = await fetch(`${API_URL}/roles`, { headers: authHeaders });
      if (rolesRes.ok) setRoles(await rolesRes.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load roles data.');
    }
  }, [authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreateRole(event) {
    event.preventDefault();
    setStatus('Creating role...');
    const response = await fetch(`${API_URL}/roles`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ name: roleForm.name, description: roleForm.description }),
    });
    if (response.ok) {
      setRoleForm({ name: '', description: '' });
      await loadData();
      setStatus('Role created successfully.');
    } else {
      setStatus('Unable to create role.');
    }
  }

  async function handleDeleteRole(id) {
    setStatus('Deleting role...');
    const response = await fetch(`${API_URL}/roles/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Role deleted successfully.');
    } else {
      setStatus('Unable to delete role.');
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Roles</h1>
          <p>Manage roles</p>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Add Role</h2>
          <form onSubmit={handleCreateRole} className="panel-form">
            <label>
              Name
              <input value={roleForm.name} onChange={e => setRoleForm({...roleForm, name: e.target.value})} required />
            </label>
            <label>
              Description
              <textarea value={roleForm.description} onChange={e => setRoleForm({...roleForm, description: e.target.value})} rows={4} />
            </label>
            <button type="submit" className="btn-primary">Save Role</button>
          </form>
        </div>

        <div className="dashboard-card wide-card">
          <h2>Role List</h2>
          <div className="role-card-grid">
            {roles.map(role => (
              <article className="role-card" key={`card-${role.id}`}>
                <div className="role-card-header">
                  <div>
                    <h3>{role.name}</h3>
                    <p>{role.description}</p>
                  </div>
                  <span className="role-card-badge">Role</span>
                </div>
                <div className="permission-list">
                  {(rolePermissions[role.name] || ['Custom role access']).map(permission => (
                    <span className="permission-badge" key={permission}>{permission}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {roles.map(role => (
                  <tr key={role.id}>
                    <td>{role.id}</td>
                    <td>{role.name}</td>
                    <td>{role.description}</td>
                    <td>
                      <button className="btn-danger btn-sm" onClick={() => handleDeleteRole(role.id)}>Delete</button>
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
