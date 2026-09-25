const API_BASE_URL = 'http://localhost:8000/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('lexanalyze_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ detail: 'Network request failed' }));
      throw new Error(errorData.detail || `HTTP Error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.warn(`API request to ${endpoint} failed, checking demo fallback...`, err.message);
    throw err;
  }
}
