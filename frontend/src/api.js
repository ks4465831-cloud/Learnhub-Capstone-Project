// Small Fetch API wrapper: adds the access token and silently refreshes it once on 401.
const BASE = import.meta.env.VITE_API_URL || '';

export const getAccess = () => localStorage.getItem('accessToken');
export const setTokens = (access, refresh) => {
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
};
export const clearTokens = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
};

async function refreshTokens() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) { clearTokens(); return false; }
  const data = await res.json();
  setTokens(data.accessToken, data.refreshToken);
  return true;
}

export async function api(path, { method = 'GET', body } = {}, retry = true) {
  const token = getAccess();
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 401 && retry && token && (await refreshTokens())) {
    return api(path, { method, body }, false);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
}
