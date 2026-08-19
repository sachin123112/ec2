import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setStatus('Please fill in your current password, new password, and confirmation.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        oldPassword,
        newPassword,
      };

      const res = await fetch(`${API_URL}/users/me/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('Password updated successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => onClose?.(), 900);
      } else {
        const j = await res.json().catch(() => ({}));
        setStatus(j.message || 'Unable to update password.');
      }
    } catch (err) {
      console.error(err);
      setStatus('Network error while updating password.');
    } finally {
      setSaving(false);
    }
  }

  return createPortal(
    (
    <div className="modal-overlay password-modal-overlay" role="dialog" aria-modal="true">
      <div className="password-modal-card">
        <div className="password-modal-inner">
          <h1 className="password-modal-title">Change your password.</h1>
          <p className="password-modal-subtitle">Keep your personal info safe</p>

          <form className="password-form" onSubmit={handleSubmit}>
            <div className="password-field-group">
              <label className="password-label" htmlFor="current-password">Current password</label>
              <input
                id="current-password"
                type={showPassword ? 'text' : 'password'}
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
                placeholder="Current password"
                autoComplete="current-password"
              />
            </div>

            <div className="password-field-group">
              <label className="password-label" htmlFor="new-password">New password</label>
              <input
                id="new-password"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
              />
            </div>

            <div className="password-field-group">
              <label className="password-label" htmlFor="confirm-password">Confirm New password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm New password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="password-visibility-toggle"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>

            {status && <div className={`modal-status ${status.includes('successfully') ? 'success' : ''}`}>{status}</div>}

            <button type="submit" className="password-submit" disabled={saving}>
              {saving ? 'Saving…' : 'Change password'}
            </button>
          </form>

          <p className="password-support-text">
            Do you have an login issue call <a href="tel:080-23571795">080-23571795</a>.
          </p>
        </div>
      </div>
    </div>
    ),
    document.body,
  );
}
