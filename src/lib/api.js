const TOKEN_KEY = "sp_token";

// On the web the frontend and API share an origin, so calls are relative
// ("/api/…") and the Vite dev proxy / Express static server handle them.
// In the native iOS/Android shells the app is served from capacitor://localhost,
// so it must call an absolute backend URL. Set VITE_API_URL at build time
// (e.g. VITE_API_URL=https://api.awakening.app) for the mobile builds.
const API_BASE = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}
