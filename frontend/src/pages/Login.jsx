import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

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
    } catch (err) {
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
                  <span className="social-icon">G</span>
                  Sign in with Google
                </button>

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
