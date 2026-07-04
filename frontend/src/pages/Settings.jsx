import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const currencies = ['USD - US Dollar', 'EUR - Euro', 'INR - Indian Rupee'];
const timezones = ['(GMT+05:30) Asia/Kolkata', '(GMT+00:00) UTC', '(GMT-05:00) America/New_York'];
const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'];
const itemsPerPageOptions = ['10', '20', '30', '50'];
const languages = ['English (US)', 'English (UK)', 'Hindi', 'Spanish'];
const sessionTimeoutOptions = ['15 Minutes', '30 Minutes', '1 Hour', '2 Hours'];
const rememberDurationOptions = ['1 Day', '7 Days', '14 Days', '30 Days'];
const tabs = ['General', 'Security', 'Email', 'Notifications', 'Payment', 'Storage', 'Backup', 'Logs'];

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
  const [status, setStatus] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    setStatus('System settings saved successfully.');
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
            <span>System Settings</span>
          </div>
          <h1>System Settings</h1>
          <p className="page-description">Manage all system configurations and preferences.</p>
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
