import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const permissionOptions = [
  'View dashboard',
  'View mobile dashboard',
  'Browse products',
  'Browse mobile catalog',
  'Manage users',
  'Manage products',
  'Manage orders',
  'Place orders',
  'Place mobile orders',
  'Manage profile',
  'Manage mobile profile',
  'Manage settings',
  'View reports',
];

function PermissionMultiSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);

  function togglePermission(permission) {
    onChange(value.includes(permission)
      ? value.filter(item => item !== permission)
      : [...value, permission]);
  }

  return (
    <div className="permission-multi-select">
      <button type="button" className="permission-multi-trigger" onClick={() => setOpen(previous => !previous)}>
        {value.length ? `${value.length} permission${value.length === 1 ? '' : 's'} selected` : 'Select permissions'}
        <span>{open ? '⌃' : '⌄'}</span>
      </button>
      {open && (
        <div className="permission-multi-menu">
          {permissionOptions.map(permission => (
            <label className="permission-option" key={permission}>
              <input type="checkbox" checked={value.includes(permission)} onChange={() => togglePermission(permission)} />
              <span>{permission}</span>
            </label>
          ))}
          <button type="button" className="permission-menu-done" onClick={() => setOpen(false)}>Done</button>
        </div>
      )}
      <div className="selected-permissions">
        {value.map(permission => <span className="permission-badge" key={permission}>{permission}</span>)}
      </div>
    </div>
  );
}

export default function RolesAdmin() {
  const { token, roles: userRoles } = useAuth();
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [roleForm, setRoleForm] = useState({ name: '', description: '', permissions: [] });
  const [editingRoleId, setEditingRoleId] = useState(null);
  const [editingPermissions, setEditingPermissions] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (token && !userRoles.includes('ADMIN')) navigate('/login', { replace: true });
  }, [navigate, token, userRoles]);

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
      body: JSON.stringify({
        name: roleForm.name,
        description: roleForm.description,
        permissions: roleForm.permissions,
      }),
    });
    if (response.ok) {
      setRoleForm({ name: '', description: '', permissions: [] });
      await loadData();
      setStatus('Role added successfully.');
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
      setStatus('Role removed successfully.');
    } else {
      setStatus('Unable to delete role.');
    }
  }

  function startEditingRole(role) {
    setEditingRoleId(role.id);
    setEditingPermissions(role.permissions || []);
  }

  async function saveRolePermissions(role) {
    setStatus('Saving role permissions...');
    const response = await fetch(`${API_URL}/roles/${role.id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ name: role.name, description: role.description, permissions: editingPermissions }),
    });
    if (response.ok) {
      setEditingRoleId(null);
      await loadData();
      setStatus('Role permissions updated successfully.');
    } else {
      if (response.status === 401 || response.status === 403) {
        setStatus('Admin login required to save permissions. Redirecting to login...');
        window.setTimeout(() => navigate('/login'), 800);
        return;
      }
      const errorText = await response.text();
      setStatus(errorText || `Unable to update role permissions (${response.status}).`);
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
            <label>
              Permissions
              <PermissionMultiSelect
                value={roleForm.permissions}
                onChange={permissions => setRoleForm({ ...roleForm, permissions })}
              />
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
                {editingRoleId !== role.id && <div className="permission-list">
                  {(role.permissions?.length ? role.permissions : ['No permissions configured']).map(permission => (
                    <span className="permission-badge" key={permission}>{permission}</span>
                  ))}
                </div>}
                {editingRoleId === role.id && (
                  <PermissionMultiSelect value={editingPermissions} onChange={setEditingPermissions} />
                )}
                <div className="role-card-actions">
                  {editingRoleId === role.id ? (
                    <>
                      <button type="button" className="btn-primary btn-sm" onClick={() => saveRolePermissions(role)}>Save Permissions</button>
                      <button type="button" className="btn-secondary btn-sm" onClick={() => setEditingRoleId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button type="button" className="btn-secondary btn-sm" onClick={() => startEditingRole(role)}>Edit Permissions</button>
                  )}
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
