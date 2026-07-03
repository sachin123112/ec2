import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (!dateOfBirth) {
      setError('Please enter your date of birth.');
      return;
    }
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear() - (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
        ? 1
        : 0
    );
    if (isNaN(birthDate.getTime()) || age < 16) {
      setError('You must be at least 16 years old to register.');
      return;
    }
    if (!password) {
      setError('Password is required.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      setError('You must agree to the Terms of Use and Privacy Policy.');
      return;
    }

    const names = fullName.trim().split(' ');
    const firstName = names[0] || '';
    const lastName = names.slice(1).join(' ') || '';
    const username = email.split('@')[0];

    setLoading(true);

    try {
      const response = await signup({
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        countryCode,
        dateOfBirth,
        gender,
      });

      if (!response.ok) {
        setError(await response.text() || 'Unable to create account');
        return;
      }

      const data = await response.json();
      login(data.accessToken, email, data.roles || [], data.refreshToken || '');
      if (data.roles?.includes('ADMIN')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      setError('Server error. Please try again later.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-grid">
          <aside className="login-aside">
            <div className="aside-brand">
              <div className="logo">🐾</div>
              <div className="brand-text">
                <h2>PawMart</h2>
                <div className="sub">Create your account</div>
              </div>
            </div>

            <h1>Welcome to PawMart</h1>
            <p className="lead">Join PawMart and start shopping for your pets with a safe, secure account.</p>

            <div className="benefits">
              <div className="benefit">Faster checkout</div>
              <div className="benefit">Track orders in real time</div>
              <div className="benefit">Save favorite products</div>
              <div className="benefit">Manage multiple delivery addresses</div>
            </div>

            <div className="mascot">{/* illustration placeholder */}</div>
          </aside>

          <div className="login-panel">
            <div className="panel-inner">
              <div className="panel-avatar">🐶</div>
              <h2>Create Your PawMart Account</h2>
              <p className="panel-sub">Sign up to shop for your pets and keep your orders secure.</p>

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-row">
                  <label className="input-with-icon">
                    <span className="input-label">Full Name</span>
                    <div className="input-row">
                      <span className="icon">👤</span>
                      <input
                        type="text"
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                  </label>

                  <label className="input-with-icon">
                    <span className="input-label">Email Address</span>
                    <div className="input-row">
                      <span className="icon">✉️</span>
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        required
                      />
                    </div>
                  </label>
                </div>

                <label className="input-with-icon">
                  <span className="input-label">Phone Number</span>
                  <div className="phone-input-row">
                    <select value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                      <option value="+91">+91</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                      <option value="+81">+81</option>
                    </select>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="Enter your mobile number"
                      required
                    />
                  </div>
                </label>

                <div className="form-row">
                  <label className="input-with-icon">
                    <span className="input-label">Password</span>
                    <div className="input-row">
                      <span className="icon">🔒</span>
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Create a password"
                        required
                      />
                    </div>
                  </label>

                  <label className="input-with-icon">
                    <span className="input-label">Confirm Password</span>
                    <div className="input-row">
                      <span className="icon">🔒</span>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        placeholder="Confirm your password"
                        required
                      />
                    </div>
                  </label>
                </div>

                <div className="form-row">
                  <label className="input-with-icon">
                    <span className="input-label">Date of Birth</span>
                    <div className="input-row">
                      <span className="icon">📅</span>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={e => setDateOfBirth(e.target.value)}
                        required
                      />
                    </div>
                  </label>

                  <label className="input-with-icon">
                    <span className="input-label">Gender</span>
                    <div className="input-row">
                      <span className="icon">🚻</span>
                      <select value={gender} onChange={e => setGender(e.target.value)} required>
                        <option value="">Select gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </label>
                </div>

                <label className="terms-row">
                  <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} />
                  I agree to the <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
                </label>

                {error && <div className="login-error">{error}</div>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Creating account…' : 'Create Account'}
                </button>

                <div className="divider"><span>or sign up with</span></div>

                <div className="social-grid">
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={async () => {
                      setError('');
                      setLoading(true);
                      try {
                        const response = await fetch(`${API_URL}/auth/google/url`);
                        if (!response.ok) {
                          const errorText = await response.text();
                          setError(errorText || 'Unable to start Google signup.');
                          return;
                        }
                        const data = await response.json();
                        window.location.href = data.url;
                      } catch (err) {
                        console.error(err);
                        setError('Unable to start Google signup.');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  >
                    <span className="social-icon">G</span>
                    Continue with Google
                  </button>
                  <button type="button" className="social-btn facebook-btn" disabled>
                    <span className="social-icon">f</span>
                    Continue with Facebook
                  </button>
                </div>
                <div className="social-note">Facebook signup coming soon</div>

                <div className="panel-footer">
                  Already have an account? <Link to="/login">Login</Link>.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
