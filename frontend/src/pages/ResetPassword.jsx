import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

export default function ResetPassword() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const fromToken = new URLSearchParams(location.search).get('token') || '';

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token || fromToken, newPassword }),
      });

      if (!response.ok) {
        const text = await response.text();
        setStatus(text || 'Unable to reset password.');
        return;
      }

      setStatus('Password reset successfully. You may now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setStatus('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Reset Password</h1>
        <p>Enter the reset token from your email and a new password.</p>
        <form onSubmit={handleSubmit} className="login-form">
          {!fromToken && (
            <label>
              Reset Token
              <input value={token} onChange={e => setToken(e.target.value)} required />
            </label>
          )}
          <label>
            New Password
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
          </label>
          {status && <div className="login-error">{status}</div>}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
            <button type="button" className="btn-outline" onClick={() => navigate('/login')}>
              Back
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
