import config from './config';

export async function login(email, password) {
  const response = await fetch(`${config.API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return response;
}

export async function signup(payload) {
  const response = await fetch(`${config.API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return response;
}

export async function refreshToken(refreshToken) {
  const response = await fetch(`${config.API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  return response;
}
