import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPanel from '../components/SettingsPanel';
import './Dashboard.css';

const currencies = ['USD - US Dollar', 'EUR - Euro', 'INR - Indian Rupee'];
const timezones = ['(GMT+05:30) Asia/Kolkata', '(GMT+00:00) UTC', '(GMT-05:00) America/New_York'];
const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const itemsPerPageOptions = ['10', '20', '30', '50'];
const languages = ['English (US)', 'English (UK)', 'Hindi', 'Spanish'];
const sessionTimeoutOptions = ['15 Minutes', '30 Minutes', '1 Hour', '2 Hours'];
const rememberDurationOptions = ['1 Day', '7 Days', '14 Days', '30 Days'];
const backupFrequencyOptions = ['Daily', 'Weekly', 'Monthly'];
const backupTimeOptions = ['12:00 AM', '02:00 AM', '04:00 AM', '06:00 AM'];
const backupRetentionOptions = ['7 Days', '14 Days', '30 Days', '90 Days'];
const tabs = ['General', 'Security', 'Email', 'Notifications', 'Payment', 'Storage', 'Backup', 'Logs'];

const tabHeaders = {
  General: {
    title: 'General Settings',
    subtitle: 'Configure basic system information and preferences.',
  },
  Security: {
    title: 'Security Settings',
    subtitle: 'Manage security preferences and access control.',
  },
  Email: {
    title: 'Email Settings',
    subtitle: 'Configure email server and outgoing settings.',
  },
  Notifications: {
    title: 'Notification Settings',
    subtitle: 'Choose when and how you want to be notified.',
  },
  Payment: {
    title: 'Payment Settings',
    subtitle: 'Manage payment gateways and configurations.',
  },
  Storage: {
    title: 'Storage Settings',
    subtitle: 'Manage where your files and media are stored.',
  },
  Backup: {
    title: 'Backup Settings',
    subtitle: 'Configure system backup preferences.',
  },
  Logs: {
    title: 'Logs Settings',
    subtitle: 'View and manage system logs.',
  },
};

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('General');
  const [siteName, setSiteName] = useState('PawMart');
  const [siteTagline, setSiteTagline] = useState('Your pet, our priority');
  const [adminEmail, setAdminEmail] = useState('admin@pawmart.com');
  const [currency, setCurrency] = useState(currencies[2]);
  const [timezone, setTimezone] = useState(timezones[0]);
  const [dateFormat, setDateFormat] = useState(dateFormats[0]);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('We are under maintenance. Please check back later.');
  const [itemsPerPage, setItemsPerPage] = useState(itemsPerPageOptions[1]);
  const [language, setLanguage] = useState(languages[0]);
  const [sessionTimeout, setSessionTimeout] = useState(sessionTimeoutOptions[1]);
  const [rememberDuration, setRememberDuration] = useState(rememberDurationOptions[1]);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [passwordPolicy, setPasswordPolicy] = useState(true);
  const [minimumPasswordLength, setMinimumPasswordLength] = useState('8 Characters');
  const [sessionTimeoutSecurity, setSessionTimeoutSecurity] = useState('30 Minutes');
  const [loginAttempts, setLoginAttempts] = useState('5 Attempts');
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [storageDriver, setStorageDriver] = useState('Local Storage');
  const [uploadDirectory, setUploadDirectory] = useState('/uploads');
  const [maxFileSize, setMaxFileSize] = useState('10');
  const [allowedFileTypes, setAllowedFileTypes] = useState('jpg, jpeg, png, gif, pdf, docx');
  const [imageOptimization, setImageOptimization] = useState(true);
  const [publicAccess, setPublicAccess] = useState(false);
  const [automaticBackup, setAutomaticBackup] = useState(true);
  const [backupFrequency, setBackupFrequency] = useState('Daily');
  const [backupTime, setBackupTime] = useState('02:00 AM');
  const [backupRetention, setBackupRetention] = useState('30 Days');
  const [includeDatabase, setIncludeDatabase] = useState(true);
  const [includeFiles, setIncludeFiles] = useState(true);
  const [includeSettings, setIncludeSettings] = useState(true);
  const [recentBackups, setRecentBackups] = useState([
    { date: '03 Jun 2026, 02:00 AM', size: '256 MB' },
    { date: '02 Jun 2026, 02:00 AM', size: '248 MB' },
    { date: '01 Jun 2026, 02:00 AM', size: '250 MB' },
  ]);
  const [selectedLogType, setSelectedLogType] = useState('All Logs');
  const [logDateRange, setLogDateRange] = useState('Last 7 Days');
  const [logSearch, setLogSearch] = useState('');
  const [systemLogs, setSystemLogs] = useState([
    { date: '03 Jun 2026, 11:45 AM', type: 'Info', message: 'Admin login successful', source: 'system' },
    { date: '03 Jun 2026, 11:30 AM', type: 'Order', message: 'Order #ORD-1001 placed', source: 'system' },
    { date: '03 Jun 2026, 09:22 AM', type: 'Warning', message: 'Low stock alert for product', source: 'system' },
    { date: '02 Jun 2026, 06:00 PM', type: 'Backup', message: 'Backup completed successfully', source: 'system' },
  ]);
  const [razorpayKeyId, setRazorpayKeyId] = useState('rzp_live_example');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState('***************');
  const [stripeActive, setStripeActive] = useState(false);
  const [paypalActive, setPaypalActive] = useState(false);
  const [cashOnDeliveryActive, setCashOnDeliveryActive] = useState(true);
  const [mailDriver, setMailDriver] = useState('SMTP');
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [encryption, setEncryption] = useState('TLS');
  const [smtpUsername, setSmtpUsername] = useState('gitsachin720@gmail.com');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [fromEmail, setFromEmail] = useState('gitsachin720@gmail.com');
  const [fromName, setFromName] = useState('PawMart');
  const [newOrderNotifications, setNewOrderNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [customerReviews, setCustomerReviews] = useState(true);
  const [orderStatusUpdates, setOrderStatusUpdates] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  const [marketingUpdates, setMarketingUpdates] = useState(false);
  const [status, setStatus] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setStatus('System settings saved successfully.');
    window.setTimeout(() => setStatus(''), 3000);
  }

  function handleSendTestEmail(event) {
    event.preventDefault();
    setStatus('Test email sent successfully.');
    window.setTimeout(() => setStatus(''), 3000);
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      setStatus(`Logo selected: ${file.name}`);
    }
  }

  function handleFaviconChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      setStatus(`Favicon selected: ${file.name}`);
    }
  }

  return (
    <div className="dashboard-page settings-page">
      <div className="dashboard-header">
        <div>
          <div className="breadcrumb">
            <button type="button" className="breadcrumb-link" onClick={() => navigate('/admin')}>Dashboard</button>
            <span>›</span>
            <button type="button" className="breadcrumb-link" onClick={() => navigate('/settings')}>Settings</button>
            <span>›</span>
            <span>{tabHeaders[activeTab].title}</span>
          </div>
          <h1>{tabHeaders[activeTab].title}</h1>
          <p className="page-description">{tabHeaders[activeTab].subtitle}</p>
        </div>
        <button type="button" className="btn-primary" onClick={handleSubmit}>Save Changes</button>
      </div>

      <div className="dashboard-actions settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab}
            type="button"
            className={activeTab === tab ? 'active' : ''}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="dashboard-layout settings-grid">
        <div className="dashboard-left-column">
          <div className="dashboard-card">
            <h2>General Settings</h2>
            <p className="card-note">Configure basic system information and preferences.</p>
            <form className="panel-form" onSubmit={handleSubmit}>
              {activeTab === 'General' && (
                <>
                  <div className="form-grid">
                    <label>
                      Site Name
                      <input value={siteName} onChange={e => setSiteName(e.target.value)} />
                    </label>
                    <label>
                      Site Tagline
                      <input value={siteTagline} onChange={e => setSiteTagline(e.target.value)} />
                    </label>
                    <label>
                      Admin Email
                      <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} />
                    </label>
                    <label>
                      Default Currency
                      <select value={currency} onChange={e => setCurrency(e.target.value)}>
                        {currencies.map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                    <label>
                      Timezone
                      <select value={timezone} onChange={e => setTimezone(e.target.value)}>
                        {timezones.map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                    <label>
                      Date Format
                      <select value={dateFormat} onChange={e => setDateFormat(e.target.value)}>
                        {dateFormats.map(item => <option key={item} value={item}>{item}</option>)}
                      </select>
                    </label>
                  </div>

                  <div className="settings-section">
                    <h3>Maintenance Mode</h3>
                    <p className="card-note">Enable maintenance mode to temporarily restrict access while you update the system.</p>
                    <div className="settings-toggle-row">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={maintenanceMode} onChange={e => setMaintenanceMode(e.target.checked)} />
                        Enable Maintenance Mode
                      </label>
                    </div>
                    <label>
                      Maintenance Message
                      <textarea value={maintenanceMessage} onChange={e => setMaintenanceMessage(e.target.value)} rows="4" />
                    </label>
                  </div>

                  <div className="settings-section">
                    <h3>Session Settings</h3>
                    <div className="form-grid">
                      <label>
                        Session Timeout
                        <select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)}>
                          {sessionTimeoutOptions.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </label>
                      <label>
                        Remember Me Duration
                        <select value={rememberDuration} onChange={e => setRememberDuration(e.target.value)}>
                          {rememberDurationOptions.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </label>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Security' && (
                <>
                  <div className="settings-section security-settings">
                    <h3>Security Settings</h3>
                    <p className="card-note">Manage security preferences and access control.</p>

                    <div className="security-list">
                      <div className="security-item">
                        <div className="security-icon">🔒</div>
                        <div className="security-content">
                          <strong>Two-Factor Authentication (2FA)</strong>
                          <span>Add an extra layer of security for admin accounts.</span>
                        </div>
                        <label className="checkbox-label security-toggle">
                          <input type="checkbox" checked={twoFactorAuth} onChange={e => setTwoFactorAuth(e.target.checked)} />
                        </label>
                      </div>

                      <div className="security-item">
                        <div className="security-icon">🛡️</div>
                        <div className="security-content">
                          <strong>Password Policy</strong>
                          <span>Enforce strong password rules for all users.</span>
                        </div>
                        <label className="checkbox-label security-toggle">
                          <input type="checkbox" checked={passwordPolicy} onChange={e => setPasswordPolicy(e.target.checked)} />
                        </label>
                      </div>

                      <div className="security-item">
                        <div className="security-icon">🔑</div>
                        <div className="security-content">
                          <strong>Minimum Password Length</strong>
                          <span>Set the minimum number of characters.</span>
                        </div>
                        <select value={minimumPasswordLength} onChange={e => setMinimumPasswordLength(e.target.value)}>
                          <option>8 Characters</option>
                          <option>10 Characters</option>
                          <option>12 Characters</option>
                          <option>14 Characters</option>
                        </select>
                      </div>

                      <div className="security-item">
                        <div className="security-icon">⏱️</div>
                        <div className="security-content">
                          <strong>Session Timeout</strong>
                          <span>Automatically logout user after inactivity.</span>
                        </div>
                        <select value={sessionTimeoutSecurity} onChange={e => setSessionTimeoutSecurity(e.target.value)}>
                          <option>15 Minutes</option>
                          <option>30 Minutes</option>
                          <option>1 Hour</option>
                          <option>2 Hours</option>
                        </select>
                      </div>

                      <div className="security-item">
                        <div className="security-icon">👤</div>
                        <div className="security-content">
                          <strong>Login Attempts</strong>
                          <span>Maximum allowed login attempts before lockout.</span>
                        </div>
                        <select value={loginAttempts} onChange={e => setLoginAttempts(e.target.value)}>
                          <option>3 Attempts</option>
                          <option>5 Attempts</option>
                          <option>7 Attempts</option>
                          <option>10 Attempts</option>
                        </select>
                      </div>

                      <div className="security-item">
                        <div className="security-icon">🌐</div>
                        <div className="security-content">
                          <strong>IP Whitelist</strong>
                          <span>Restrict access to specific IP addresses.</span>
                        </div>
                        <label className="checkbox-label security-toggle">
                          <input type="checkbox" checked={ipWhitelist} onChange={e => setIpWhitelist(e.target.checked)} />
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Email' && (
                <>
                  <div className="settings-section email-settings">
                    <h3>Email Settings</h3>
                    <p className="card-note">Configure email server and outgoing settings.</p>

                    <div className="form-grid">
                      <label>
                        Mail Driver
                        <select value={mailDriver} onChange={e => setMailDriver(e.target.value)}>
                          <option value="SMTP">SMTP</option>
                          <option value="Sendmail">Sendmail</option>
                        </select>
                      </label>
                      <label>
                        SMTP Host
                        <input value={smtpHost} onChange={e => setSmtpHost(e.target.value)} />
                      </label>
                      <label>
                        SMTP Port
                        <input value={smtpPort} onChange={e => setSmtpPort(e.target.value)} />
                      </label>
                      <label>
                        Encryption
                        <select value={encryption} onChange={e => setEncryption(e.target.value)}>
                          <option value="TLS">TLS</option>
                          <option value="SSL">SSL</option>
                          <option value="None">None</option>
                        </select>
                      </label>
                      <label>
                        SMTP Username
                        <input value={smtpUsername} onChange={e => setSmtpUsername(e.target.value)} />
                      </label>
                      <label>
                        SMTP Password
                        <div className="password-input-row">
                          <input
                            type={showSmtpPassword ? 'text' : 'password'}
                            value={smtpPassword}
                            onChange={e => setSmtpPassword(e.target.value)}
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowSmtpPassword(prev => !prev)}
                          >
                            {showSmtpPassword ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </label>
                      <label>
                        From Email
                        <input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} />
                      </label>
                      <label>
                        From Name
                        <input value={fromName} onChange={e => setFromName(e.target.value)} />
                      </label>
                    </div>

                    <div className="settings-section email-actions">
                      <button type="button" className="btn-secondary" onClick={handleSendTestEmail}>
                        Send Test Email
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Notifications' && (
                <>
                  <div className="settings-section notification-settings">
                    <h3>Notification Settings</h3>
                    <p className="card-note">Choose when and how you want to be notified.</p>

                    <div className="notification-list">
                    <div className="notification-item">
                      <div className="notification-icon">🛒</div>
                      <div className="notification-content">
                        <strong>New Order Notifications</strong>
                        <span>Get notified for new orders.</span>
                      </div>
                      <label className="checkbox-label notification-toggle">
                        <input type="checkbox" checked={newOrderNotifications} onChange={e => setNewOrderNotifications(e.target.checked)} />
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-icon">⚠️</div>
                      <div className="notification-content">
                        <strong>Low Stock Alerts</strong>
                        <span>Get notified when stock is low.</span>
                      </div>
                      <label className="checkbox-label notification-toggle">
                        <input type="checkbox" checked={lowStockAlerts} onChange={e => setLowStockAlerts(e.target.checked)} />
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-icon">⭐</div>
                      <div className="notification-content">
                        <strong>Customer Reviews</strong>
                        <span>Get notified for new reviews.</span>
                      </div>
                      <label className="checkbox-label notification-toggle">
                        <input type="checkbox" checked={customerReviews} onChange={e => setCustomerReviews(e.target.checked)} />
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-icon">📦</div>
                      <div className="notification-content">
                        <strong>Order Status Updates</strong>
                        <span>Get notified for order status changes.</span>
                      </div>
                      <label className="checkbox-label notification-toggle">
                        <input type="checkbox" checked={orderStatusUpdates} onChange={e => setOrderStatusUpdates(e.target.checked)} />
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-icon">📝</div>
                      <div className="notification-content">
                        <strong>Daily Summary</strong>
                        <span>Receive daily summary email.</span>
                      </div>
                      <label className="checkbox-label notification-toggle">
                        <input type="checkbox" checked={dailySummary} onChange={e => setDailySummary(e.target.checked)} />
                      </label>
                    </div>

                    <div className="notification-item">
                      <div className="notification-icon">📣</div>
                      <div className="notification-content">
                        <strong>Marketing Updates</strong>
                        <span>Receive marketing and tips.</span>
                      </div>
                      <label className="checkbox-label notification-toggle">
                        <input type="checkbox" checked={marketingUpdates} onChange={e => setMarketingUpdates(e.target.checked)} />
                      </label>
                    </div>
                  </div>
                  </div>
                </>
              )}

              {activeTab === 'Payment' && (
                <>
                  <div className="settings-section payment-settings">
                    <h3>Payment Settings</h3>
                    <p className="card-note">Manage payment gateways and configurations.</p>

                    <div className="payment-card">
                      <div className="payment-card-header">
                        <div>
                          <strong>Razorpay</strong>
                          <span>Active</span>
                        </div>
                        <button type="button" className="payment-edit">Edit</button>
                      </div>

                      <div className="form-grid">
                        <label>
                          Key ID
                          <input value={razorpayKeyId} onChange={e => setRazorpayKeyId(e.target.value)} />
                        </label>
                        <label>
                          Key Secret
                          <input type="password" value={razorpayKeySecret} onChange={e => setRazorpayKeySecret(e.target.value)} />
                        </label>
                      </div>
                    </div>

                    <div className="payment-methods">
                      <div className="payment-method">
                        <div>
                          <strong>Stripe</strong>
                          <span>Payment gateway integration.</span>
                        </div>
                        <div className="payment-status-row">
                          <span className={`status-badge ${stripeActive ? 'active' : 'inactive'}`}>
                            {stripeActive ? 'Active' : 'Inactive'}
                          </span>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={stripeActive} onChange={e => setStripeActive(e.target.checked)} />
                            <span className="slider" />
                          </label>
                        </div>
                      </div>

                      <div className="payment-method">
                        <div>
                          <strong>PayPal</strong>
                          <span>Payment gateway integration.</span>
                        </div>
                        <div className="payment-status-row">
                          <span className={`status-badge ${paypalActive ? 'active' : 'inactive'}`}>
                            {paypalActive ? 'Active' : 'Inactive'}
                          </span>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={paypalActive} onChange={e => setPaypalActive(e.target.checked)} />
                            <span className="slider" />
                          </label>
                        </div>
                      </div>

                      <div className="payment-method">
                        <div>
                          <strong>Cash on Delivery</strong>
                          <span>Accept payment on delivery.</span>
                        </div>
                        <div className="payment-status-row">
                          <span className={`status-badge ${cashOnDeliveryActive ? 'active' : 'inactive'}`}>
                            {cashOnDeliveryActive ? 'Active' : 'Inactive'}
                          </span>
                          <label className="toggle-switch">
                            <input type="checkbox" checked={cashOnDeliveryActive} onChange={e => setCashOnDeliveryActive(e.target.checked)} />
                            <span className="slider" />
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="payment-actions">
                      <button type="button" className="btn-secondary">+ Add Payment Method</button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Backup' && (
                <>
                  <SettingsPanel
                    title="Backup Settings"
                    description="Configure automatic backups and manage data."
                    actions={<button type="button" className="btn-secondary">Backup Now</button>}
                  >
                    <div className="settings-toggle-row">
                      <label className="checkbox-label">
                        <input type="checkbox" checked={automaticBackup} onChange={e => setAutomaticBackup(e.target.checked)} />
                        Automatic Backup
                      </label>
                    </div>

                    <div className="form-grid">
                      <label>
                        Backup Frequency
                        <select value={backupFrequency} onChange={e => setBackupFrequency(e.target.value)}>
                          {backupFrequencyOptions.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </label>
                      <label>
                        Backup Time
                        <select value={backupTime} onChange={e => setBackupTime(e.target.value)}>
                          {backupTimeOptions.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </label>
                      <label>
                        Backup Retention
                        <select value={backupRetention} onChange={e => setBackupRetention(e.target.value)}>
                          {backupRetentionOptions.map(item => <option key={item} value={item}>{item}</option>)}
                        </select>
                      </label>
                    </div>

                    <div className="backup-include-list">
                      <div className="backup-include-item">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={includeDatabase} onChange={e => setIncludeDatabase(e.target.checked)} />
                          Database
                        </label>
                      </div>
                      <div className="backup-include-item">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={includeFiles} onChange={e => setIncludeFiles(e.target.checked)} />
                          Files & Media
                        </label>
                      </div>
                      <div className="backup-include-item">
                        <label className="checkbox-label">
                          <input type="checkbox" checked={includeSettings} onChange={e => setIncludeSettings(e.target.checked)} />
                          Settings
                        </label>
                      </div>
                    </div>

                    <div className="backup-list">
                      {recentBackups.map((backup, index) => (
                        <div key={index} className="backup-item">
                          <div>
                            <strong>{backup.date}</strong>
                            <span>Size: {backup.size}</span>
                          </div>
                          <button type="button" className="btn-secondary">Download</button>
                        </div>
                      ))}
                    </div>
                  </SettingsPanel>
                </>
              )}

              {activeTab === 'Storage' && (
                <>
                  <div className="settings-section storage-settings">
                    <div className="settings-section-header">
                      <h3>Storage Settings</h3>
                      <span className="section-badge">{storageDriver}</span>
                    </div>
                    <p className="card-note">Manage where your files and media are stored.</p>

                    <div className="form-grid">
                      <label>
                        Storage Driver
                        <select value={storageDriver} onChange={e => setStorageDriver(e.target.value)}>
                          <option>Local Storage</option>
                          <option>Amazon S3</option>
                          <option>Google Cloud Storage</option>
                        </select>
                      </label>
                      <label>
                        Upload Directory
                        <input value={uploadDirectory} onChange={e => setUploadDirectory(e.target.value)} />
                      </label>
                      <label>
                        Maximum File Size
                        <div className="file-size-row">
                          <input type="number" value={maxFileSize} onChange={e => setMaxFileSize(e.target.value)} />
                          <span>MB</span>
                        </div>
                      </label>
                      <label>
                        Allowed File Types
                        <input value={allowedFileTypes} onChange={e => setAllowedFileTypes(e.target.value)} />
                      </label>
                    </div>

                    <div className="settings-section storage-toggle-group">
                      <div className="settings-toggle-row">
                        <span>Image Optimization</span>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={imageOptimization} onChange={e => setImageOptimization(e.target.checked)} />
                          <span className="slider" />
                        </label>
                      </div>
                      <div className="settings-toggle-row">
                        <span>Public Access</span>
                        <label className="toggle-switch">
                          <input type="checkbox" checked={publicAccess} onChange={e => setPublicAccess(e.target.checked)} />
                          <span className="slider" />
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'Logs' && (
                <>
                  <SettingsPanel
                    title="Logs Settings"
                    description="View and manage system activity logs."
                  >
                    <div className="log-panel">
                      <div className="log-filters">
                        <label>
                          Log Type
                          <select value={selectedLogType} onChange={e => setSelectedLogType(e.target.value)}>
                            <option>All Logs</option>
                            <option>Info</option>
                            <option>Order</option>
                            <option>Warning</option>
                            <option>Backup</option>
                          </select>
                        </label>
                        <label>
                          Date Range
                          <select value={logDateRange} onChange={e => setLogDateRange(e.target.value)}>
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last 90 Days</option>
                          </select>
                        </label>
                        <label>
                          Search
                          <input value={logSearch} onChange={e => setLogSearch(e.target.value)} placeholder="Search logs..." />
                        </label>
                      </div>

                      <table className="log-table">
                        <thead>
                          <tr>
                            <th>Date & Time</th>
                            <th>Type</th>
                            <th>Message</th>
                            <th>Source</th>
                          </tr>
                        </thead>
                        <tbody>
                          {systemLogs.map((log, index) => (
                            <tr key={index}>
                              <td>{log.date}</td>
                              <td><span className={`log-tag ${log.type}`}>{log.type}</span></td>
                              <td>{log.message}</td>
                              <td>{log.source}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <button type="button" className="clear-logs">Clear Logs</button>
                    </div>
                  </SettingsPanel>
                </>
              )}

              {status && <p className="status-note">{status}</p>}
            </form>
          </div>
        </div>

        <div className="dashboard-right-side">
          <div className="side-card logo-card">
            <div className="side-card-header">
              <div>
                <h3>Logo & Favicon</h3>
                <p>Upload your logo and favicon.</p>
              </div>
            </div>
            <div className="upload-grid">
              <div className="upload-box">
                <div className="upload-preview">Logo</div>
                <input type="file" accept="image/*" onChange={handleLogoChange} />
                <p className="upload-note">Recommended size: 200 x 60px</p>
              </div>
              <div className="upload-box">
                <div className="upload-preview">Favicon</div>
                <input type="file" accept="image/*" onChange={handleFaviconChange} />
                <p className="upload-note">Recommended size: 32 x 32px</p>
              </div>
            </div>
          </div>

          <div className="side-card">
            <div className="side-card-header">
              <div>
                <h3>Items Per Page</h3>
                <p>Set default number of items to display in tables.</p>
              </div>
            </div>
            <select value={itemsPerPage} onChange={e => setItemsPerPage(e.target.value)}>
              {itemsPerPageOptions.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>

          <div className="side-card">
            <div className="side-card-header">
              <div>
                <h3>Language Settings</h3>
                <p>Select default system language.</p>
              </div>
            </div>
            <select value={language} onChange={e => setLanguage(e.target.value)}>
              {languages.map(item => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
