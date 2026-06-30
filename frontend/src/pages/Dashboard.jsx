import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Dashboard() {
  const { isAuthenticated, logout, token, hardRefresh } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: '' });
  const [roles, setRoles] = useState([]);
  const [roleForm, setRoleForm] = useState({ name: '', description: '' });
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [links, setLinks] = useState([]);
  const [status, setStatus] = useState('');

  const [userForm, setUserForm] = useState({ username: '', email: '', password: '', firstName: '', lastName: '', roleId: '' });
  const [productForm, setProductForm] = useState({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', categoryId: '' });
  const [orderForm, setOrderForm] = useState({ userId: '', totalAmount: '0.00', status: 'PENDING' });
  const [linkForm, setLinkForm] = useState({ label: '', url: '', description: '', isActive: true });
  const [refreshing, setRefreshing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const authHeaders = useMemo(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  const loadData = useCallback(async () => {
    try {
      const [usersRes, productsRes, ordersRes, categoriesRes, rolesRes, linksRes] = await Promise.all([
        fetch(`${API_URL}/users`, { headers: authHeaders }),
        fetch(`${API_URL}/products`, { headers: authHeaders }),
        fetch(`${API_URL}/orders`, { headers: authHeaders }),
        fetch(`${API_URL}/categories`, { headers: authHeaders }),
        fetch(`${API_URL}/roles`, { headers: authHeaders }),
        fetch(`${API_URL}/links`, { headers: authHeaders }),
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (productsRes.ok) setProducts(await productsRes.json());
      if (ordersRes.ok) setOrders(await ordersRes.json());
      if (categoriesRes.ok) setCategories(await categoriesRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (linksRes.ok) setLinks(await linksRes.json());
      setStatus('Data loaded successfully.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to load dashboard data.');
    }
  }, [authHeaders]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated, navigate, loadData]);

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

  async function handleCreateProduct(event) {
    event.preventDefault();
    setStatus('Creating product...');

    const response = await fetch(`${API_URL}/products`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        name: productForm.name,
        description: productForm.description,
        sku: productForm.sku,
        price: parseFloat(productForm.price) || 0,
        stockQuantity: parseInt(productForm.stockQuantity, 10) || 0,
        categoryId: productForm.categoryId ? parseInt(productForm.categoryId, 10) : null,
      }),
    });

    if (response.ok) {
      setProductForm({ name: '', description: '', sku: '', price: '0.00', stockQuantity: '0', categoryId: '' });
      await loadData();
      setStatus('Product added successfully.');
    } else {
      setStatus('Unable to create product.');
    }
  }

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

  async function handleCreateOrder(event) {
    event.preventDefault();
    setStatus('Creating order...');

    const response = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        userId: parseInt(orderForm.userId, 10),
        totalAmount: parseFloat(orderForm.totalAmount) || 0,
        status: orderForm.status,
      }),
    });

    if (response.ok) {
      setOrderForm({ userId: '', totalAmount: '0.00', status: 'PENDING' });
      await loadData();
      setStatus('Order created successfully.');
    } else {
      setStatus('Unable to create order.');
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

  async function handleDeleteProduct(id) {
    setStatus('Deleting product...');
    const response = await fetch(`${API_URL}/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Product deleted successfully.');
    } else {
      setStatus('Unable to delete product.');
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

  async function handleDeleteOrder(id) {
    setStatus('Deleting order...');
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: 'DELETE',
      headers: authHeaders,
    });
    if (response.ok) {
      await loadData();
      setStatus('Order deleted successfully.');
    } else {
      setStatus('Unable to delete order.');
    }
  }

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
      setStatus('Link created successfully.');
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
      setStatus('Link deleted successfully.');
    } else {
      setStatus('Unable to delete link.');
    }
  }

  function openDeleteModal(entity, id, label) {
    setDeleteTarget({ entity, id, label });
    setShowDeleteModal(true);
  }

  function closeDeleteModal() {
    setShowDeleteModal(false);
    setDeleteTarget(null);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { entity, id } = deleteTarget;
    setShowDeleteModal(false);

    switch (entity) {
      case 'user':
        await handleDeleteUser(id);
        break;
      case 'role':
        await handleDeleteRole(id);
        break;
      case 'product':
        await handleDeleteProduct(id);
        break;
      case 'category':
        await handleDeleteCategory(id);
        break;
      case 'order':
        await handleDeleteOrder(id);
        break;
      case 'link':
        await handleDeleteLink(id);
        break;
      default:
        break;
    }
    setDeleteTarget(null);
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Admin Control Center</h1>
          <p>Manage users, products, categories, orders, and reports from one place.</p>
        </div>
        <div className="dashboard-actions-right">
          <button
            type="button"
            className="btn-icon"
            onClick={async () => {
              setRefreshing(true);
              try {
                await hardRefresh();
                setStatus('Session refreshed successfully.');
              } catch (error) {
                console.error(error);
                setStatus('Unable to refresh session. Please log in again.');
                logout();
                navigate('/login');
              } finally {
                setRefreshing(false);
              }
            }}
            disabled={refreshing}
            aria-label="Hard refresh"
            title="Hard refresh"
          >
            {refreshing ? (
              <svg className="refresh-icon spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 10-2.62 6.06" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v6h-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="refresh-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12a9 9 0 10-2.62 6.06" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 3v6h-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <button type="button" className="btn-outline" onClick={() => { logout(); navigate('/login'); }}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-summary">
        <div className="summary-card">
          <span>Total Users</span>
          <strong>{users.length}</strong>
        </div>
        <div className="summary-card">
          <span>Products</span>
          <strong>{products.length}</strong>
        </div>
        <div className="summary-card">
          <span>Orders</span>
          <strong>{orders.length}</strong>
        </div>
        <div className="summary-card">
          <span>Categories</span>
          <strong>{categories.length}</strong>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className={tab === 'users' ? 'active' : ''} onClick={() => setTab('users')}>Users</button>
        <button className={tab === 'roles' ? 'active' : ''} onClick={() => setTab('roles')}>Roles</button>
        <button className={tab === 'links' ? 'active' : ''} onClick={() => setTab('links')}>Links</button>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>Products</button>
        <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>Categories</button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>Orders</button>
      </div>

      <div className="dashboard-status">{status}</div>

      {showDeleteModal && deleteTarget && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3>Confirm Delete</h3>
            <p>Delete {deleteTarget.entity} <strong>{deleteTarget.label}</strong>?</p>
            <div className="modal-actions">
              <button className="btn-outline" type="button" onClick={closeDeleteModal}>Cancel</button>
              <button className="btn-danger" type="button" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <section className="dashboard-panel">
        {tab === 'users' && (
          <>
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
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td>{user.roles?.join(', ')}</td>
                          <td>{user.status}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('user', user.id, user.email)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'roles' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Add Role</h2>
                <form onSubmit={async event => {
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
                }} className="panel-form">
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
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('role', role.id, role.name)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
        {tab === 'links' && (
          <>
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
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('link', link.id, link.label)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'products' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Add Product</h2>
                <form onSubmit={handleCreateProduct} className="panel-form">
                  <label>
                    Name
                    <input value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} required />
                  </label>
                  <label>
                    SKU
                    <input value={productForm.sku} onChange={e => setProductForm({...productForm, sku: e.target.value})} required />
                  </label>
                  <label>
                    Category
                    <select value={productForm.categoryId} onChange={e => setProductForm({...productForm, categoryId: e.target.value})}>
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Price
                    <input type="number" step="0.01" value={productForm.price} onChange={e => setProductForm({...productForm, price: e.target.value})} required />
                  </label>
                  <label>
                    Stock
                    <input type="number" value={productForm.stockQuantity} onChange={e => setProductForm({...productForm, stockQuantity: e.target.value})} required />
                  </label>
                  <label>
                    Description
                    <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} rows={4} />
                  </label>
                  <button type="submit" className="btn-primary">Save Product</button>
                </form>
              </div>

              <div className="dashboard-card wide-card">
                <h2>Product Catalog</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(product => (
                        <tr key={product.id}>
                          <td>{product.id}</td>
                          <td>{product.name}</td>
                          <td>{product.sku}</td>
                          <td>{product.price}</td>
                          <td>{product.stockQuantity}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('product', product.id, product.name)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'categories' && (
          <>
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
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('category', cat.id, cat.name)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'orders' && (
          <>
            <div className="dashboard-grid">
              <div className="dashboard-card">
                <h2>Track / Add Order</h2>
                <form onSubmit={handleCreateOrder} className="panel-form">
                  <label>
                    User ID
                    <input type="number" value={orderForm.userId} onChange={e => setOrderForm({...orderForm, userId: e.target.value})} required />
                  </label>
                  <label>
                    Total Amount
                    <input type="number" step="0.01" value={orderForm.totalAmount} onChange={e => setOrderForm({...orderForm, totalAmount: e.target.value})} required />
                  </label>
                  <label>
                    Status
                    <select value={orderForm.status} onChange={e => setOrderForm({...orderForm, status: e.target.value})}>
                      <option value="PENDING">PENDING</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="COMPLETED">COMPLETED</option>
                      <option value="CANCELED">CANCELED</option>
                    </select>
                  </label>
                  <button type="submit" className="btn-primary">Add Order</button>
                </form>
              </div>

              <div className="dashboard-card wide-card">
                <h2>Order History</h2>
                <div className="table-scroll">
                  <table>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Order #</th>
                        <th>User ID</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id}>
                          <td>{order.id}</td>
                          <td>{order.orderNumber}</td>
                          <td>{order.userId}</td>
                          <td>{order.totalAmount}</td>
                          <td>{order.status}</td>
                          <td>
                            <button className="btn-danger btn-sm" onClick={() => openDeleteModal('order', order.id, order.orderNumber)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
