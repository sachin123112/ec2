import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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
    } catch {
      setStatus('Server error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page reset-page">
      <div className="login-card reset-card">
        <div className="reset-grid">
          <aside className="reset-aside">
            <div className="reset-aside-header">
              <div className="reset-aside-icon">🔒</div>
              <div>
                <h1>Reset Password</h1>
                <p>Secure your account with a new password. Use the token from your email to continue.</p>
              </div>
            </div>

            <div className="reset-feature">
              <h2>What to expect</h2>
              <ul>
                <li>Enter your reset token or use the link from your email</li>
                <li>Choose a strong password</li>
                <li>Return to login immediately after reset</li>
              </ul>
            </div>

            <div className="reset-tip-card">
              <strong>Tip:</strong> If you don’t see the email, check your spam folder or request a new link.
            </div>
          </aside>

          <section className="login-panel reset-panel">
            <div className="panel-inner">
              <div className="panel-avatar">🔑</div>
              <h2>Reset your password</h2>
              <p className="panel-sub">Enter the information below and we’ll update your password instantly.</p>

              <form onSubmit={handleSubmit} className="login-form">
                {!fromToken && (
                  <label>
                    Reset Token
                    <input
                      placeholder="Enter token from email"
                      value={token}
                      onChange={e => setToken(e.target.value)}
                      required
                    />
                  </label>
                )}

                <label>
                  New Password
                  <input
                    type="password"
                    placeholder="Create a new password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                  />
                </label>

                {status && <div className="login-error">{status}</div>}

                <div className="form-actions">
                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Resetting…' : 'Reset Password'}
                  </button>
                  <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
                    Back to login
                  </button>
                </div>
              </form>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
