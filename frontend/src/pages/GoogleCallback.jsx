import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api/v1';

export default function GoogleCallback() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    async function handleCallback() {
      if (errorParam) {
        setError(`Google login failed: ${errorParam}`);
        setLoading(false);
        return;
      }

      const token = searchParams.get('token');
      const refreshToken = searchParams.get('refreshToken');
      const rolesParam = searchParams.get('roles');
      const email = searchParams.get('email');

      if (token && refreshToken) {
        const roles = rolesParam ? rolesParam.split(',') : [];
        login(token, email || '', roles, refreshToken);
        if (roles.includes('ADMIN')) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        return;
      }

      setError('Google login did not return a valid session token. Please try again.');
      setLoading(false);
      return;
    }

    handleCallback();
  }, [login, navigate, searchParams]);

  return (
    <div className="google-callback-page">
      <div className="google-callback-card">
        <h1>{loading ? 'Signing in with Google…' : 'Google Login'}</h1>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
