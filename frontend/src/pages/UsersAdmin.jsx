import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function UsersAdmin() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', roleId: '' });
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
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: authHeaders }),
        fetch(`${API_URL}/roles`, { headers: authHeaders }),
      ]);
      if (usersRes.ok) setUsers(await usersRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      setStatus('Data loaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Unable to load users data.');
    }
  }, [authHeaders]);

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
      roleIds: userForm.roleId ? [parseInt(userForm.roleId, 10)] : [],
    };
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      setUserForm({ username: '', email: '', password: '', firstName: '', lastName: '', roleId: '' });
      await loadData();
      setStatus('User created successfully.');
    } else {
      setStatus('Unable to create user.');
    }
  }

  async function handleDeleteUser(id) {
    setStatus('Deleting user...');
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('User deleted successfully.');
    } else {
      setStatus('Unable to delete user.');
    }
  }

  const filteredUsers = users;

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div className="dashboard-header-left">
          <h1>Users</h1>
          <p>Manage application users</p>
          <div className="header-links" style={{ marginTop: 12, display: 'flex', gap: 12 }}>
            <Link to="/admin/products" className="btn-outline">Products</Link>
            <Link to="/admin/orders" className="btn-outline">Orders</Link>
            <Link to="/admin/categories" className="btn-outline">Categories</Link>
          </div>
        </div>
      </div>

      <div className="dashboard-status">{status}</div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Create User</h2>
          <form onSubmit={handleCreateUser} className="panel-form">
            <label>
              Username
              <input value={userForm.username} onChange={e => setUserForm({...userForm, username: e.target.value})} required />
            </label>
            <label>
              Email
              <input type="email" value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} required />
            </label>
            <label>
              Password
              <input type="password" value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} required />
            </label>
            <label>
              Role
              <select value={userForm.roleId} onChange={e => setUserForm({...userForm, roleId: e.target.value})} required>
                <option value="">Select role</option>
                {roles.map(role => (
                  <option key={role.id} value={role.id}>{role.name}</option>
                ))}
              </select>
            </label>
            <label>
              First Name
              <input value={userForm.firstName} onChange={e => setUserForm({...userForm, firstName: e.target.value})} />
            </label>
            <label>
              Last Name
              <input value={userForm.lastName} onChange={e => setUserForm({...userForm, lastName: e.target.value})} />
            </label>
            <button type="submit" className="btn-primary">Add User</button>
          </form>
        </div>

        <div className="dashboard-card wide-card">
          <h2>User List</h2>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>{user.email}</td>
                    <td>{user.username}</td>
                    <td>{user.roles?.join(', ')}</td>
                    <td>{user.status}</td>
                    <td>
                      <button className="btn-danger btn-sm" onClick={() => handleDeleteUser(user.id)}>Delete</button>
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
