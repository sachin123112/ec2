import { useEffect, useRef, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

function formatUserName(email) {
  if (!email) return 'Valued Customer';
  const name = email.split('@')[0].replace(/[._-]/g, ' ');
  return name
    .split(' ')
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function formatPhoneDisplay(countryCode, phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return '';
  return `${countryCode || ''} ${digits}`.trim();
}

const emptyAddressForm = {
  id: null,
  label: 'Home',
  name: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
  isDefault: false,
};

export default function UserDashboard() {
  const { isAuthenticated, token, userEmail, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('Loading your dashboard...');
  const [activeSection, setActiveSection] = useState('Profile Information');
  const [notifications, setNotifications] = useState({ email: true, sms: true, marketing: false });
  const [wishlist] = useState([
    { id: 1, name: 'Premium Dog Food', price: '$29.99' },
    { id: 2, name: 'Cat Scratching Post', price: '$18.50' },
  ]);
  const [savedCards] = useState([
    { id: 1, brand: 'Visa', last4: '1234', expires: '09/26' },
    { id: 2, brand: 'Mastercard', last4: '9876', expires: '01/27' },
  ]);
  const [pets] = useState([
    { id: 1, name: 'Buddy', type: 'Dog', age: '3 yrs' },
    { id: 2, name: 'Milo', type: 'Cat', age: '1 yr' },
  ]);
  const [userProfile, setUserProfile] = useState({
    firstName: '',
    lastName: '',
    email: userEmail || '',
    phone: '',
    countryCode: '+91',
    profileImageUrl: '',
    gender: '',
    dateOfBirth: '',
  });
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    countryCode: '+91',
    profileImageUrl: '',
    gender: '',
    dateOfBirth: '',
  });
  const [profileErrors, setProfileErrors] = useState({});
  const fileInputRef = useRef(null);
  const [addresses, setAddresses] = useState([]);
  const [addressForm, setAddressForm] = useState(emptyAddressForm);
  const [addressFormVisible, setAddressFormVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const navigate = useNavigate();

  const sectionDescription = {
    Overview: 'Quick summary and account shortcuts.',
    Orders: 'View your order history and status updates.',
    Wishlist: 'Your saved items, ready to buy.',
    Addresses: 'Manage and edit your delivery addresses.',
    'Profile Information': 'Manage your personal details and account information.',
    'Payment Methods': 'Saved payment cards and billing options.',
    'Saved Cards': 'Your stored cards for faster checkout.',
    'My Pets': 'Your pet profiles and care information.',
    Notifications: 'Notification preferences for your account.',
    'Help & Support': 'Need help? Reach our support team anytime.',
  };

  const userName = formatUserName(userEmail);
  const authHeaders = useMemo(() => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;
    return headers;
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadDashboard();
  }, [isAuthenticated, navigate, authHeaders]);

  async function loadDashboard() {
    try {
      const [ordersResponse, userResponse, addressesResponse] = await Promise.all([
        fetch(`${API_URL}/orders`, { headers: authHeaders }),
        fetch(`${API_URL}/users/me`, { headers: authHeaders }),
        fetch(`${API_URL}/users/me/addresses`, { headers: authHeaders }),
      ]);

      if (!ordersResponse.ok) {
        setStatus('Unable to fetch orders at the moment.');
      } else {
        const ordersData = await ordersResponse.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
      }

      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUserProfile({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          email: userData.email || userEmail || '',
          phone: userData.phone || '',
          countryCode: userData.countryCode || '+91',
          profileImageUrl: userData.profileImageUrl || '',
          gender: userData.gender || '',
          dateOfBirth: userData.dateOfBirth || '',
        });
        setProfileForm({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          countryCode: userData.countryCode || '+91',
          profileImageUrl: userData.profileImageUrl || '',
          gender: userData.gender || '',
          dateOfBirth: userData.dateOfBirth || '',
        });
      }

      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json();
        setAddresses(Array.isArray(addressesData) ? addressesData : []);
      }

      setStatus('Your dashboard is up to date.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to load your dashboard data.');
    }
  }

  function validatePhone(phone) {
    const digits = phone.replace(/\D/g, '');
    return /^\d{7,15}$/.test(digits);
  }

  function validateProfileForm() {
    const errors = {};
    if (!profileForm.firstName.trim()) {
      errors.firstName = 'First name is required.';
    }
    if (!profileForm.lastName.trim()) {
      errors.lastName = 'Last name is required.';
    }
    if (!profileForm.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!validatePhone(profileForm.phone)) {
      errors.phone = 'Enter a valid phone number without spaces or symbols.';
    }
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function saveProfile() {
    if (!validateProfileForm()) {
      setStatus('Please fix profile errors before saving.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/users/me`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(profileForm),
      });

      if (!response.ok) {
        setStatus('Unable to save profile updates.');
        return;
      }

      const updatedUser = await response.json();
      setUserProfile({
        firstName: updatedUser.firstName || '',
        lastName: updatedUser.lastName || '',
        email: updatedUser.email || userEmail || '',
        phone: updatedUser.phone || '',
        countryCode: updatedUser.countryCode || '+91',
        profileImageUrl: updatedUser.profileImageUrl || '',
        gender: updatedUser.gender || '',
        dateOfBirth: updatedUser.dateOfBirth || '',
      });
      setStatus('Profile updated successfully.');
      setActiveSection('Overview');
    } catch (error) {
      console.error(error);
      setStatus('Unable to save profile updates.');
    }
  }

  function handleProfileImageUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      setProfileForm(prev => ({ ...prev, profileImageUrl: loadEvent.target?.result || prev.profileImageUrl }));
    };
    reader.readAsDataURL(file);
  }

  async function saveAddress() {
    try {
      const method = editingAddress ? 'PUT' : 'POST';
      const url = editingAddress ? `${API_URL}/addresses/${addressForm.id}` : `${API_URL}/users/me/addresses`;
      const response = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(addressForm),
      });

      if (!response.ok) {
        setStatus('Unable to save address.');
        return;
      }

      const savedAddress = await response.json();
      if (editingAddress) {
        setAddresses(prev => prev.map(addr => (addr.id === savedAddress.id ? savedAddress : addr)));
      } else {
        setAddresses(prev => [...prev, savedAddress]);
      }

      setAddressForm(emptyAddressForm);
      setAddressFormVisible(false);
      setEditingAddress(false);
      setStatus('Address saved successfully.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to save address.');
    }
  }

  async function editAddress(address) {
    setAddressForm({
      id: address.id,
      label: address.label || 'Home',
      name: address.name || '',
      addressLine1: address.addressLine1 || '',
      addressLine2: address.addressLine2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      phone: address.phone || '',
      isDefault: Boolean(address.isDefault),
    });
    setAddressFormVisible(true);
    setEditingAddress(true);
  }

  async function removeAddress(id) {
    try {
      const response = await fetch(`${API_URL}/addresses/${id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
      if (!response.ok) {
        setStatus('Unable to remove address.');
        return;
      }
      setAddresses(prev => prev.filter(addr => addr.id !== id));
      setStatus('Address removed.');
    } catch (error) {
      console.error(error);
      setStatus('Unable to remove address.');
    }
  }

  const navItems = [
    'Overview',
    'Orders',
    'Wishlist',
    'Addresses',
    'Profile Information',
    'Payment Methods',
    'Saved Cards',
    'My Pets',
    'Notifications',
    'Help & Support',
    'Logout',
  ];

  return (
    <div className="dashboard-page profile-page">
      <div className="dashboard-header profile-header">
        <div>
          <h1>{activeSection}</h1>
          <p>{sectionDescription[activeSection]}</p>
        </div>
        <button type="button" className="btn-primary">Edit Profile</button>
      </div>

      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="sidebar-title">My Account</div>
          <div className="profile-nav">
            {navItems.map(item => (
              <button
                key={item}
                type="button"
                className={item === activeSection ? 'active' : ''}
                onClick={() => {
                  if (item === 'Logout') {
                    logout();
                    navigate('/login');
                    return;
                  }
                  setActiveSection(item);
                }}
              >
                {item}
              </button>
            ))}
          </div>
        </aside>

        <main className="profile-main">
          <div className="profile-overview-card">
            {userProfile.profileImageUrl ? (
            <img src={userProfile.profileImageUrl} alt={userName} className="profile-avatar profile-avatar-image" />
          ) : (
            <div className="profile-avatar">{userName.charAt(0).toUpperCase()}</div>
          )}
          <div>
            <p className="eyebrow">Verified Member</p>
            <h2>{userName}</h2>
            <p>{userEmail}</p>
            <p>{formatPhoneDisplay(userProfile.countryCode, userProfile.phone)}</p>
          </div>
            <div className="profile-badge">Verified</div>
          </div>

          <div className="profile-actions-row">
            <button type="button" className="btn-outline" onClick={() => setActiveSection('Overview')}>Overview</button>
            <button type="button" className="btn-outline" onClick={() => setActiveSection('Orders')}>View Orders</button>
            <button type="button" className="btn-outline" onClick={() => navigate('/shop')}>Browse Products</button>
          </div>

          {activeSection === 'Overview' && (
            <>
              <div className="profile-grid">
                <section className="profile-card">
                  <div className="card-header">
                    <h2>Personal Information</h2>
                    <button type="button" className="btn-link" onClick={() => setActiveSection('Profile Information')}>Edit</button>
                  </div>
                  <div className="profile-detail-row">
                    <span>Full Name</span>
                    <strong>{userName}</strong>
                  </div>
                  <div className="profile-detail-row">
                    <span>Email Address</span>
                    <strong>{userEmail}</strong>
                  </div>
                  <div className="profile-detail-row">
                    <span>Phone Number</span>
                    <strong>{formatPhoneDisplay(userProfile.countryCode, userProfile.phone)}</strong>
                  </div>
                </section>

                <section className="profile-card">
                  <div className="card-header">
                    <h2>Default Address</h2>
                    <button type="button" className="btn-link" onClick={() => setActiveSection('Addresses')}>Manage Addresses</button>
                  </div>
                  <div className="profile-address-card">
                    <p className="profile-address-label">Home</p>
                    <p>{addresses[0]?.name || 'No address saved yet'}</p>
                    <p>{addresses[0]?.addressLine1 || ''}</p>
                    <p>{addresses[0]?.addressLine2 || ''}</p>
                    <p>{addresses[0]?.city ? `${addresses[0].city}, ${addresses[0].state} ${addresses[0].postalCode || ''}` : ''}</p>
                    <p>{addresses[0]?.country || ''}</p>
                    <p>{addresses[0]?.phone || ''}</p>
                  </div>
                </section>

                <section className="profile-card">
                  <div className="card-header">
                    <h2>Account Preferences</h2>
                    <button type="button" className="btn-link" onClick={() => setActiveSection('Notifications')}>Manage</button>
                  </div>
                  <div className="preference-row">
                    <span>Email Notifications</span>
                    <strong>{notifications.email ? 'On' : 'Off'}</strong>
                  </div>
                  <div className="preference-row">
                    <span>SMS Notifications</span>
                    <strong>{notifications.sms ? 'On' : 'Off'}</strong>
                  </div>
                </section>
              </div>

              <div className="profile-summary-row">
                <div className="profile-small-card">
                  <span>Secure Account</span>
                  <strong>Your data is protected with 256-bit encryption</strong>
                </div>
                <div className="profile-small-card">
                  <span>Privacy Protected</span>
                  <strong>We never share your personal information</strong>
                </div>
                <div className="profile-small-card">
                  <span>24/7 Support</span>
                  <strong>Our support team is always here to help</strong>
                </div>
              </div>
            </>
          )}

          {activeSection === 'Profile Information' && (
            <div className="profile-info-layout">
              <section className="profile-card profile-photo-card">
                <div className="photo-media">
                  {profileForm.profileImageUrl ? (
                    <img src={profileForm.profileImageUrl} alt="Profile" className="photo-preview" />
                  ) : (
                    <div className="photo-placeholder">
                      <span>+</span>
                    </div>
                  )}
                </div>

                <div className="photo-info">
                  <p className="photo-label">Add a profile photo</p>
                  <p className="photo-caption">JPG, PNG or GIF. Max size 2MB.</p>
                </div>

                <div className="photo-actions">
                  <button type="button" className="btn-primary" onClick={() => fileInputRef.current?.click()}>
                    Upload Photo
                  </button>
                  <button
                    type="button"
                    className="btn-outline delete-button"
                    onClick={() => setProfileForm(prev => ({ ...prev, profileImageUrl: '' }))}
                  >
                    Delete
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  style={{ display: 'none' }}
                  onChange={handleProfileImageUpload}
                />
              </section>

              <section className="profile-card profile-details-panel">
                <div className="card-header">
                  <div>
                    <h2>Profile Information</h2>
                    <p className="section-note">Update your personal details and manage your profile.</p>
                  </div>
                </div>

                <form className="panel-form" onSubmit={e => { e.preventDefault(); saveProfile(); }}>
                  <div className="profile-field-grid">
                    <label className="profile-field">
                      First Name *
                      <input
                        type="text"
                        value={profileForm.firstName}
                        onChange={e => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="First name"
                      />
                    </label>
                    <label className="profile-field">
                      Last Name *
                      <input
                        type="text"
                        value={profileForm.lastName}
                        onChange={e => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="Last name"
                      />
                    </label>
                    <label className="profile-field">
                      Email Address
                      <input type="email" value={userProfile.email} disabled />
                    </label>
                    <label className="profile-field">
                      Phone Number *
                      <div className="phone-input-row">
                        <select
                          value={profileForm.countryCode}
                          onChange={e => setProfileForm(prev => ({ ...prev, countryCode: e.target.value }))}
                        >
                          <option value="+91">+91</option>
                          <option value="+1">+1</option>
                          <option value="+44">+44</option>
                          <option value="+61">+61</option>
                          <option value="+81">+81</option>
                        </select>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={e => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                          placeholder="Enter phone number"
                        />
                      </div>
                      {profileErrors.phone && <span className="field-error">{profileErrors.phone}</span>}
                    </label>
                    <label className="profile-field">
                      Gender
                      <select
                        value={profileForm.gender}
                        onChange={e => setProfileForm(prev => ({ ...prev, gender: e.target.value }))}
                      >
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </label>
                    <label className="profile-field">
                      Date of Birth
                      <input
                        type="date"
                        value={profileForm.dateOfBirth}
                        onChange={e => setProfileForm(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                      />
                    </label>
                    <label className="profile-field full-width">
                      Profile Image URL
                      <input
                        type="url"
                        value={profileForm.profileImageUrl}
                        onChange={e => setProfileForm(prev => ({ ...prev, profileImageUrl: e.target.value }))}
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </label>
                  </div>

                  <div className="save-actions">
                    <button type="button" className="btn-outline" onClick={() => setProfileForm({
                      firstName: userProfile.firstName,
                      lastName: userProfile.lastName,
                      phone: userProfile.phone,
                      countryCode: userProfile.countryCode,
                      profileImageUrl: userProfile.profileImageUrl,
                      gender: userProfile.gender,
                      dateOfBirth: userProfile.dateOfBirth,
                    })}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">Save Profile</button>
                  </div>
                </form>
              </section>
            </div>
          )}

          {activeSection === 'Orders' && (
            <div className="dashboard-card wide-card">
              <h2>Your Orders</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Status</th>
                      <th>Total</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.length === 0 ? (
                      <tr>
                        <td colSpan="4">No orders found yet. Continue shopping to place your first order.</td>
                      </tr>
                    ) : (
                      orders.map(order => (
                        <tr key={order.id || order.orderNumber}>
                          <td>{order.orderNumber || `#${order.id}`}</td>
                          <td>{order.status}</td>
                          <td>{order.totalAmount ? `$${Number(order.totalAmount).toFixed(2)}` : '—'}</td>
                          <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Today'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'Wishlist' && (
            <div className="dashboard-card wide-card">
              <h2>Your Wishlist</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Price</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wishlist.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td>{item.price}</td>
                        <td>
                          <button type="button" className="btn-primary" onClick={() => navigate('/shop')}>Buy Now</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'Addresses' && (
            <div className="profile-grid">
              <section className="profile-card">
                <div className="card-header">
                  <h2>Saved Addresses</h2>
                  <button type="button" className="btn-link" onClick={() => {
                    setAddressForm(emptyAddressForm);
                    setAddressFormVisible(true);
                    setEditingAddress(false);
                  }}>
                    Add New Address
                  </button>
                </div>

                <div className="address-list">
                  {addresses.length === 0 ? (
                    <div className="address-card">
                      <p>No saved addresses yet. Add one to make checkout faster.</p>
                    </div>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className="address-card">
                        <strong>{addr.label || 'Home'}</strong>
                        <p>{addr.name}</p>
                        <p>{addr.addressLine1}</p>
                        <p>{addr.addressLine2}</p>
                        <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                        <p>{addr.country}</p>
                        <p>{addr.phone}</p>
                        <div className="address-actions">
                          <button type="button" className="btn-link" onClick={() => editAddress(addr)}>Edit</button>
                          <button type="button" className="btn-danger" onClick={() => removeAddress(addr.id)}>Remove</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {addressFormVisible && (
                  <div className="profile-card">
                    <div className="card-header">
                      <h2>{editingAddress ? 'Edit Address' : 'Add Address'}</h2>
                      <button type="button" className="btn-link" onClick={() => {
                        setAddressFormVisible(false);
                        setEditingAddress(false);
                        setAddressForm(emptyAddressForm);
                      }}>
                        Cancel
                      </button>
                    </div>
                    <form className="panel-form" onSubmit={e => { e.preventDefault(); saveAddress(); }}>
                      <div className="form-field-grid">
                        <label>
                          Label
                          <input
                            type="text"
                            value={addressForm.label}
                            onChange={e => setAddressForm(prev => ({ ...prev, label: e.target.value }))}
                            placeholder="Home / Work"
                          />
                        </label>
                        <label>
                          Contact Name
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={e => setAddressForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Recipient name"
                          />
                        </label>
                        <label>
                          Address Line 1
                          <input
                            type="text"
                            value={addressForm.addressLine1}
                            onChange={e => setAddressForm(prev => ({ ...prev, addressLine1: e.target.value }))}
                            placeholder="Street address"
                          />
                        </label>
                        <label>
                          Address Line 2
                          <input
                            type="text"
                            value={addressForm.addressLine2}
                            onChange={e => setAddressForm(prev => ({ ...prev, addressLine2: e.target.value }))}
                            placeholder="Apartment, suite, unit"
                          />
                        </label>
                        <label>
                          City
                          <input
                            type="text"
                            value={addressForm.city}
                            onChange={e => setAddressForm(prev => ({ ...prev, city: e.target.value }))}
                            placeholder="City"
                          />
                        </label>
                        <label>
                          State
                          <input
                            type="text"
                            value={addressForm.state}
                            onChange={e => setAddressForm(prev => ({ ...prev, state: e.target.value }))}
                            placeholder="State"
                          />
                        </label>
                        <label>
                          Postal Code
                          <input
                            type="text"
                            value={addressForm.postalCode}
                            onChange={e => setAddressForm(prev => ({ ...prev, postalCode: e.target.value }))}
                            placeholder="Postal code"
                          />
                        </label>
                        <label>
                          Country
                          <input
                            type="text"
                            value={addressForm.country}
                            onChange={e => setAddressForm(prev => ({ ...prev, country: e.target.value }))}
                            placeholder="Country"
                          />
                        </label>
                        <label>
                          Phone
                          <input
                            type="tel"
                            value={addressForm.phone}
                            onChange={e => setAddressForm(prev => ({ ...prev, phone: e.target.value }))}
                            placeholder="Phone number"
                          />
                        </label>
                        <label>
                          Default Address
                          <select
                            value={addressForm.isDefault ? 'true' : 'false'}
                            onChange={e => setAddressForm(prev => ({ ...prev, isDefault: e.target.value === 'true' }))}
                          >
                            <option value="false">No</option>
                            <option value="true">Yes</option>
                          </select>
                        </label>
                      </div>
                      <button type="submit" className="btn-primary">Save Address</button>
                    </form>
                  </div>
                )}
              </section>
            </div>
          )}

          {activeSection === 'Payment Methods' && (
            <div className="dashboard-card wide-card">
              <h2>Payment Methods</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Card</th>
                      <th>Expires</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedCards.map(card => (
                      <tr key={card.id}>
                        <td>{card.brand} •••• {card.last4}</td>
                        <td>{card.expires}</td>
                        <td>
                          <button type="button" className="btn-link">Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'Saved Cards' && (
            <div className="dashboard-card wide-card">
              <h2>Saved Cards</h2>
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Card</th>
                      <th>Expires</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {savedCards.map(card => (
                      <tr key={card.id}>
                        <td>{card.brand} •••• {card.last4}</td>
                        <td>{card.expires}</td>
                        <td>
                          <button type="button" className="btn-link">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'My Pets' && (
            <div className="dashboard-card wide-card">
              <div className="section-header">
                <div>
                  <h2>My Pets</h2>
                  <p className="section-subtitle">Manage your pet profiles and update care details.</p>
                </div>
                <button type="button" className="btn-primary">+ Add Pet</button>
              </div>
              <div className="pet-list pet-list-grid">
                {pets.map(pet => (
                  <div key={pet.id} className="pet-card pet-card-large">
                    <div className="pet-card-media">
                      <div className="pet-avatar">{pet.name.charAt(0)}</div>
                      <div>
                        <strong>{pet.name}</strong>
                        <p className="pet-meta">{pet.type} • {pet.age}</p>
                      </div>
                    </div>
                    <div className="pet-card-details">
                      <div>
                        <span className="pet-label">Breed</span>
                        <strong>{pet.breed || 'Mixed Breed'}</strong>
                      </div>
                      <div>
                        <span className="pet-label">Gender</span>
                        <strong>{pet.gender || 'Unknown'}</strong>
                      </div>
                      <div>
                        <span className="pet-label">Status</span>
                        <strong>{pet.status || 'Healthy'}</strong>
                      </div>
                    </div>
                    <div className="pet-card-actions">
                      <button type="button" className="btn-link">Edit</button>
                      <button type="button" className="btn-outline">Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Notifications' && (
            <div className="dashboard-card wide-card">
              <h2>Notifications</h2>
              <div className="notification-list">
                {Object.entries(notifications).map(([key, value]) => (
                  <div key={key} className="notification-item">
                    <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                    <button
                      type="button"
                      className={value ? 'btn-primary' : 'btn-outline'}
                      onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                    >
                      {value ? 'On' : 'Off'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'Help & Support' && (
            <div className="dashboard-card wide-card">
              <h2>Help & Support</h2>
              <p>If you need help, you can reach us at support@pawmart.com or call +91 98888 12345.</p>
              <button type="button" className="btn-primary">Contact Support</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
