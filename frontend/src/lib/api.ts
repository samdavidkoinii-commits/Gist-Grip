const API = import.meta.env.VITE_API_URL || 'https://lumiere-salon-api.onrender.com/api/v1';

export async function api<T>(path: string, options: RequestInit = {}) {
  const token = localStorage.getItem('lumiere_token');
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({ success: false, message: 'Invalid server response' }));
  if (!response.ok) throw new Error(data.message || 'Request failed');
  return data as { success: boolean; data: T; message?: string };
}

export const money = (n: number) => new Intl.NumberFormat('en-GH', {
  style: 'currency',
  currency: 'GHS',
  maximumFractionDigits: 0
}).format(n);
