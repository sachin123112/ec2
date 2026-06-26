import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function Login() {
  const [email, setEmail] = useState('admin@pawmart.com');
  const [password, setPassword] = useState('admin123');
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
      login(data.accessToken, email, data.roles || []);
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
        <h1>Dashboard Login</h1>
        <p>Use the administrator account below to access the dashboard.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@pawmart.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="admin123"
              required
            />
          </label>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: '12px'}}>
          <div>
            <a href="/">Home</a>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
            <a href="/forgot-password">Forgot password?</a>
            <a href="/signup">Sign up</a>
          </div>
        </div>

        <div className="login-hint">
          <strong>Hint:</strong> admin@pawmart.com / admin123
        </div>
      </div>
    </div>
  );
}
