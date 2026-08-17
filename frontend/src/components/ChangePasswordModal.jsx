import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { token } = useAuth();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('');
    if (!oldPassword || !newPassword) {
      setStatus('Please fill in both fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatus('New password and confirmation do not match.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/me/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ oldPassword, newPassword }),
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

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-card">
        <header className="modal-header">
          <h3>Change Password</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </header>
        <form className="modal-body" onSubmit={handleSubmit}>
          <label>
            Current password
            <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
          </label>
          <label>
            New password
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </label>
          <label>
            Confirm new password
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
          </label>
          {status && <div className="modal-status">{status}</div>}
          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose} disabled={saving}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Update Password'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
