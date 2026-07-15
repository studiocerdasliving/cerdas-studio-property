import { writable } from 'svelte/store';

const storedUser = localStorage.getItem('user');

let initialUser = null;
try {
  initialUser = storedUser && storedUser !== 'undefined' ? JSON.parse(storedUser) : null;
} catch(e) {
  console.error("Failed to parse user from localStorage", e);
  localStorage.removeItem('user');
}

export const token = writable(null); // Deprecated, kept for backward compatibility
export const user = writable(initialUser);
export const isAuthenticated = writable(!!initialUser);

const AUTH_STORAGE_KEYS = [
  'user',
  'token',
  'auth_token',
  'auth_session',
  'jwt_token',
  'studio_token',
  'studio_project_id',
  'studio_project_name'
];

export function clearAuthState() {
  for (const key of AUTH_STORAGE_KEYS) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  }

  token.set(null);
  user.set(null);
  isAuthenticated.set(false);
}

// Fungsi untuk login dan menyimpan user
export function login(newToken, userData) {
  localStorage.setItem('user', JSON.stringify(userData));
  // token storage is removed to comply with HttpOnly cookie
  token.set(null);
  user.set(userData);
  isAuthenticated.set(true);
}

// Fungsi untuk update token saja (Sliding Session) - no longer needed with HttpOnly
export function updateToken(newToken) {
  // handled by browser Set-Cookie automatically
}

// Fungsi untuk logout
export async function logout() {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  if (!API_BASE_URL) {
      console.error("VITE_API_BASE_URL is not set in .env");
  }

  try {
    // Panggil backend untuk menghapus cookie dan blacklist token
    await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (e) {
    console.error("Gagal logout di server:", e);
  }

  clearAuthState();
}
