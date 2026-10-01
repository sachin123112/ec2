import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

const roleToneMap = {
  ADMIN: 'admin',
  USER: 'user',
  MOBILE_ADMIN: 'mobile-admin',
  MOBILE_USER: 'mobile-user',
};

export default function UsersAdmin() {
  const { token, refreshSession } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', roleIds: [] });
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

  const fetchWithAuthRetry = useCallback(async (url, options = {}) => {
    let response = await fetch(url, { ...options, headers: { ...authHeaders, ...(options.headers || {}) } });
    if (response.status !== 401) return response;

    try {
      const refreshed = await refreshSession();
      const refreshedHeaders = {
        ...authHeaders,
        ...(options.headers || {}),
        Authorization: `Bearer ${refreshed.accessToken}`,
      };
      response = await fetch(url, { ...options, headers: refreshedHeaders });
    } catch {
      // Preserve the original 401 so the page can show the authentication failure.
    }

    return response;
  }, [authHeaders, refreshSession]);

  const loadData = useCallback(async () => {
    try {
      const [usersRes, rolesRes] = await Promise.all([
        fetchWithAuthRetry(`${API_URL}/users`),
        fetchWithAuthRetry(`${API_URL}/roles`),
      ]);
      if (!usersRes.ok) {
        const errorText = await usersRes.text();
        throw new Error(errorText || `Unable to load users (${usersRes.status}).`);
      }
      setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus(err.message || 'Unable to load users data.');
    }
  }, [fetchWithAuthRetry]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleCreateUser(event) {
    event.preventDefault();
    setStatus('Creating user...');
    const payload = {
      username: userForm.username,
      email: userForm.email,
      password: userForm.password,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      roleIds: userForm.roleIds.map(roleId => parseInt(roleId, 10)),
    };
    const response = await fetchWithAuthRetry(`${API_URL}/users`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      setUserForm({ username: '', email: '', password: '', firstName: '', lastName: '', roleIds: [] });
      await loadData();
      setStatus('User added successfully.');
    } else {
      setStatus('Unable to create user.');
    }
  }

  async function handleDeleteUser(id) {
    setStatus('Deleting user...');
    const response = await fetchWithAuthRetry(`${API_URL}/users/${id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      await loadData();
      setStatus('User removed successfully.');
    } else {
      setStatus('Unable to delete user.');
    }
  }

  const getUserRoles = (user) => {
    if (Array.isArray(user.roles) && user.roles.length) return user.roles;
    if (Array.isArray(user.roleNames) && user.roleNames.length) return user.roleNames;
    if (user.role) return [user.role];
    return ['USER'];
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="user-admin-page dashboard-page">
      <div className="breadcrumb">
        <Link to="/admin/dashboard">Dashboard</Link>
        <span>›</span>
        <Link to="/admin/users">Users</Link>
        <span>›</span>
        <span className="breadcrumb-current">Manage Users</span>
      </div>

      <div className="user-admin-page-header">
        <div className="user-admin-title-wrap">
          <div className="user-admin-icon">👥</div>
          <div>
            <h1>Manage Users</h1>
            <p>Add new users and manage store access</p>
          </div>
        </div>

        <div className="user-admin-banner">
          <div className="user-admin-banner-inner">
            <span className="user-admin-banner-paw">🐾</span>
            <span className="user-admin-banner-paw">🐾</span>
            <span className="user-admin-banner-paw">🐾</span>
          </div>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      <div className="user-admin-layout">
        <div className="user-admin-card user-admin-form-card">
          <div className="user-admin-section-header">
            <div className="user-admin-section-icon">👤</div>
            <h2>Create User</h2>
          </div>
          <p className="user-admin-helper">Add a new user to access the store</p>

          <form onSubmit={handleCreateUser} className="panel-form user-panel-form">
            <label className="field-group">
              <span>Username</span>
              <input value={userForm.username} onChange={e => setUserForm({ ...userForm, username: e.target.value })} required placeholder="Enter username" />
            </label>

            <label className="field-group">
              <span>Email</span>
              <input type="email" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} required placeholder="Enter email address" />
            </label>

            <label className="field-group">
              <span>Password</span>
              <input type="password" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} required placeholder="Enter password" />
            </label>

            <label className="field-group">
              <span>Role (multi-select)</span>
              <select
                className="user-role-select"
                multiple
                value={userForm.roleIds}
                onChange={e => setUserForm({
                  ...userForm,
                  roleIds: Array.from(e.target.selectedOptions, option => option.value),
                })}
                required
              >
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </label>

            <label className="field-group">
              <span>First Name</span>
              <input value={userForm.firstName} onChange={e => setUserForm({ ...userForm, firstName: e.target.value })} placeholder="Enter first name" />
            </label>

            <label className="field-group">
              <span>Last Name</span>
              <input value={userForm.lastName} onChange={e => setUserForm({ ...userForm, lastName: e.target.value })} placeholder="Enter last name" />
            </label>

            <button type="submit" className="btn-primary user-submit-btn">Add User</button>
          </form>
        </div>

        <div className="user-admin-card user-admin-list-card">
          <div className="user-admin-section-header user-admin-list-header">
            <div className="user-admin-section-icon user-admin-section-icon-alt">👥</div>
            <h2>User List</h2>
          </div>
          <p className="user-admin-helper">Manage, edit or delete users from the system</p>

          <div className="user-admin-controls">
            <div className="user-admin-search-box">
              <span>⌕</span>
              <input type="text" placeholder="Search users..." />
            </div>
            <select className="user-admin-filter" defaultValue="all">
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="table-scroll user-admin-table-wrap">
            <table className="user-admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role(s)</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td className="user-email-cell">
                      <div className="user-avatar-td">{(user.firstName || user.username || 'U').charAt(0).toUpperCase()}</div>
                      <span>{user.email}</span>
                    </td>
                    <td>{user.username}</td>
                    <td>
                      <div className="user-role-badges">
                        {getUserRoles(user).map((role) => (
                          <span key={role} className={`role-badge ${roleToneMap[role.toUpperCase()] || 'user'}`}>
                            {role.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="status-pill active">Active</span>
                    </td>
                    <td>{formatDate(user.createdAt || user.created_at)}</td>
                    <td>
                      <div className="user-action-buttons">
                        <button type="button" className="icon-button" aria-label="Edit user">✎</button>
                        <button type="button" className="icon-button danger" aria-label="Delete user" onClick={() => handleDeleteUser(user.id)}>🗑</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="user-admin-pagination">
            <span>Showing 1 to 4 of 4 users</span>
            <div className="pagination-controls">
              <button type="button" className="pager-button">‹</button>
              <button type="button" className="pager-button active">1</button>
              <button type="button" className="pager-button">›</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
