import { writable } from 'svelte/store';

// Ambil token dari localStorage jika ada
const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('user');

export const token = writable(storedToken || null);
export const user = writable(storedUser ? JSON.parse(storedUser) : null);
export const isAuthenticated = writable(!!storedToken);

// Fungsi untuk login dan menyimpan token
export function login(newToken, userData) {
  localStorage.setItem('token', newToken);
  localStorage.setItem('user', JSON.stringify(userData));
  token.set(newToken);
  user.set(userData);
  isAuthenticated.set(true);
}

// Fungsi untuk logout
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  token.set(null);
  user.set(null);
  isAuthenticated.set(false);
}
