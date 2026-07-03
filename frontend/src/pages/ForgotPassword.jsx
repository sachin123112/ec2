import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

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
    } catch (err) {
      setStatus('Server error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>Reset Password</h1>
        <p>Enter your account email — we'll send a reset link.</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </label>
          {status && <div className="login-error">{status}</div>}
          <div style={{display: 'flex', gap: '8px'}}>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Sending…' : 'Send reset'}</button>
            <button type="button" className="btn-outline" onClick={() => navigate('/login')}>Back</button>
          </div>
        </form>
      </div>
    </div>
  );
}
