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
    <div className="signup-page">
      <div className="signup-card">
        <div className="signup-grid">
          <div className="signup-panel">
            <div className="signup-header">
              <h1>Create Your PawMart Account</h1>
              <p>Join PawMart and start shopping for your pets with a safe, secure account.</p>
            </div>

            <form onSubmit={handleSubmit} className="signup-form">
              <div className="form-row">
                <label>
                  Full Name <span className="required">*</span>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Enter your full name" required />
                </label>

                <label>
                  Email Address <span className="required">*</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" required />
                </label>
              </div>

              <label>
                Phone Number <span className="required">*</span>
                <div className="phone-input-row">
                  <select value={countryCode} onChange={e => setCountryCode(e.target.value)}>
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                    <option value="+61">+61</option>
                    <option value="+81">+81</option>
                  </select>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your mobile number" required />
                </div>
              </label>

              <div className="form-row">
                <label>
                  Password <span className="required">*</span>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
                </label>

                <label>
                  Confirm Password <span className="required">*</span>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm your password" required />
                </label>
              </div>

              <div className="password-hint-card">
                <span>Password must contain:</span>
                <div className="password-hint-grid">
                  <span>At least 8 characters</span>
                  <span>1 uppercase letter</span>
                  <span>1 number</span>
                  <span>1 special character</span>
                </div>
              </div>

              <div className="form-row">
                <label>
                  Date of Birth <span className="required">*</span>
                  <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                </label>

                <label>
                  Gender <span className="required">*</span>
                  <select value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </label>
              </div>

              <label className="terms-row">
                <input type="checkbox" checked={agreeTerms} onChange={e => setAgreeTerms(e.target.checked)} />
                I agree to the <a href="#">Terms of Use</a> and <a href="#">Privacy Policy</a>.
              </label>

              {error && <div className="login-error">{error}</div>}

              <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Creating account…' : 'Create Account'}</button>

              <div className="social-login-section">
                <span>or sign up with</span>
                <div className="social-grid">
                  <button type="button" className="social-btn google-btn">
                    <span className="social-icon">G</span>
                    Continue with Google
                  </button>
                  <button type="button" className="social-btn facebook-btn">
                    <span className="social-icon">f</span>
                    Continue with Facebook
                  </button>
                </div>
              </div>

              <div className="login-hint">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </form>
          </div>

          <aside className="signup-aside">
            <div className="aside-card">
              <div className="aside-icon">🐶</div>
              <h2>Why create an account?</h2>
              <p>Save time, manage orders, and keep your pet shopping preferences in one secure place.</p>

              <ul className="benefits-list">
                <li>Faster checkout</li>
                <li>Track orders in real time</li>
                <li>Save favorite products</li>
                <li>Manage multiple delivery addresses</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
