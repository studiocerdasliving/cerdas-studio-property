import { get } from 'svelte/store';
import { token, logout } from './stores/auth.js';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export async function apiFetch(endpoint, options = {}) {
  const currentToken = get(token);
  // Generate / Get Fingerprint Hash
  let fpHash = localStorage.getItem('fp_hash');
  if (!fpHash) {
    // Fallback if FingerprintJS hasn't run yet, but ideally it should be there.
    fpHash = "pending_fp"; 
  }
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Fingerprint': fpHash,
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Tangkap token baru jika server memberikan Sliding Session (Alternatif 4)
    const newToken = response.headers.get('X-New-Token');
    if (newToken) {
      // Import secara dinamis agar tidak circular dependency jika perlu,
      // tapi kita sudah import { token } di atas, kita import updateToken.
      import('./stores/auth.js').then(module => {
        module.updateToken(newToken);
      });
    }

    if (response.status === 401) {
      // Token expired or invalid
      logout();
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}
