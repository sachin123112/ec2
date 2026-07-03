import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Login() {
  const [email, setEmail] = useState('admin@pawmart.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, roles } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      const destination = roles.includes('ADMIN') ? '/admin/dashboard' : '/dashboard';
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, navigate, roles]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const text = await response.text();
        setError(text || 'Unable to login.');
        return;
      }

      const data = await response.json();
      login(data.accessToken, email, data.roles || [], data.refreshToken || '');
      if (data.roles?.includes('ADMIN')) {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch {
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
                <div className="sub">Admin Panel</div>
              </div>
            </div>
            <h1>Welcome Back!</h1>
            <p className="lead">Sign in to your admin account and manage your store with ease.</p>

            <div className="benefits">
              <div className="benefit">Secure Access</div>
              <div className="benefit">Real-time Analytics</div>
              <div className="benefit">Easy Management</div>
              <div className="benefit">Instant Notifications</div>
            </div>

            <div className="mascot">{/* illustration placeholder */}</div>
          </aside>

          <div className="login-panel">
            <div className="panel-inner">
              <div className="panel-avatar">🐶</div>
              <h2>Admin Login</h2>
              <p className="panel-sub">Enter your credentials to access the dashboard</p>

              <form onSubmit={handleSubmit} className="login-form">
                <label className="input-with-icon">
                  <span className="input-label">Email Address</span>
                  <div className="input-row">
                    <span className="icon">✉️</span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="admin@pawmart.com"
                      required
                    />
                  </div>
                </label>

                <label className="input-with-icon">
                  <span className="input-label">Password</span>
                  <div className="input-row">
                    <span className="icon">🔒</span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="admin123"
                      required
                    />
                    <button
                      type="button"
                      className="eye"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(prev => !prev)}
                    >
                      {showPassword ? '🙈' : '👁️'}
                    </button>
                  </div>
                </label>

                <div className="form-row small">
                  <label className="terms-row">
                    <input type="checkbox" /> Remember me
                  </label>
                  <Link to="/forgot-password" className="forgot">Forgot password?</Link>
                </div>

                {error && <div className="login-error">{error}</div>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Signing in…' : 'Sign In'}
                </button>

                <div className="divider"><span>or</span></div>

                <button
                  type="button"
                  className="social-btn google-btn"
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const response = await fetch(`${API_URL}/auth/google/url`);
                      if (!response.ok) {
                        const errorText = await response.text();
                        setError(errorText || 'Unable to start Google login.');
                        return;
                      }
                      const data = await response.json();
                      window.location.href = data.url;
                    } catch (err) {
                      console.error(err);
                      setError('Unable to start Google login.');
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  <span className="social-icon" aria-hidden="true">
                    <svg viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#4285F4" d="M533.5 278.4c0-17.8-1.6-35-4.8-51.6H272v97.8h146.9c-6.3 34-25 62.9-53 82.2v68.3h85.7c50.2-46.2 81-114.4 81-196.7z"/>
                      <path fill="#34A853" d="M272 544.3c72.6 0 133.7-24.1 178.3-65.5l-85.7-68.3c-23.8 16-54.2 25.4-92.6 25.4-71 0-131.2-47.8-152.7-112.1H31.5v70.4C76.3 483.9 168.6 544.3 272 544.3z"/>
                      <path fill="#FBBC05" d="M119.3 323.9c-10.8-32.4-10.8-67.2 0-99.6V154H31.5c-43.5 87-43.5 190.9 0 277.9l87.8-70.4z"/>
                      <path fill="#EA4335" d="M272 107.7c39.6 0 75.2 13.6 103.3 40.3l77.4-77.4C402.1 24.9 343.1 0 272 0 168.6 0 76.3 60.4 31.5 154l87.8 70.4C140.8 155.5 201 107.7 272 107.7z"/>
                    </svg>
                  </span>
                  <span className="social-text">Sign in with Google</span>
                </button>

                <button type="button" className="btn-secondary home-btn" onClick={() => navigate('/')}>Home</button>

                <div className="login-hint">
                  <strong>Hint:</strong> admin@pawmart.com / admin123
                </div>

                <div className="panel-footer">
                  Don't have an account? <Link to="/signup">Create one now</Link>.
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
