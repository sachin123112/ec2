import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    setLoading(true);
    try {
      const res = await requestPasswordReset(email);
      if (res.ok) {
        setStatus('Reset email sent if account exists.');
      } else {
        setStatus('Unable to process request.');
      }
    } catch {
      setStatus('Server error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page reset-page">
      <div className="login-card reset-card">
        <div className="reset-grid">
          <aside className="reset-aside">
            <div className="reset-aside-illustration">
              <div className="reset-aside-icon">🔒</div>
            </div>
            <div>
              <h2>Secure your account</h2>
              <p>Enter your registered email and we'll send you a link to reset your password.</p>
            </div>
          </aside>

          <section className="reset-panel">
            <div className="panel-inner">
              <div className="panel-avatar">✉️</div>
              <h1>Reset Password</h1>
              <p className="panel-sub">Enter your account email — we’ll send a reset link.</p>

              <form onSubmit={handleSubmit} className="login-form reset-form">
                <label className="input-with-icon">
                  <span className="icon">📧</span>
                  <span className="input-label">Email Address</span>
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </label>

                {status && <div className="login-error">{status}</div>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  <span className="button-icon">✈️</span>
                  {loading ? 'Sending…' : 'Send Reset Link'}
                </button>

                <div className="divider"><span>or</span></div>

                <div className="reset-bottom-row">
                  <div className="reset-help-card">
                    <strong>Need help?</strong>
                    <p>Didn't receive the email? Check your spam folder or try again.</p>
                  </div>
                  <button type="button" className="btn-secondary" onClick={() => navigate('/login')}>
                    Back to Login
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
