const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Get Authorization header if token exists
 */
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

/**
 * Make API request with error handling
 */
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    // Handle 401 - token expired
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

/**
 * API client with typed methods
 */
export const api = {
  // Auth endpoints
  auth: {
    check: (email: string) => 
      apiRequest<{ success: boolean; exists: boolean }>('/auth/check', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    
    register: (data: { email: string; password: string; dbConfig: any }) =>
      apiRequest<{ success: boolean; token: string; user: any; syncStatus: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    login: (email: string, password: string) =>
      apiRequest<{ success: boolean; token: string; user: any; syncStatus: string; hasDbConfig: boolean }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },

  // User endpoints
  user: {
    me: () => 
      apiRequest<{ success: boolean; user: any }>('/user/me'),
    
    settings: () =>
      apiRequest<{ success: boolean; user: any; dbConfig: any }>('/user/settings'),
    
    sync: () =>
      apiRequest<{ success: boolean; message: string; syncStatus: string }>('/user/sync', {
        method: 'POST',
      }),
    
    syncStatus: () =>
      apiRequest<{ success: boolean; status: string; hasConfig: boolean; lastSyncedAt?: string; tableCount?: number; error?: string }>('/user/sync-status'),
  },

  // Query endpoints (existing)
  query: {
    generate: (sessionId: string, query: string, history: Array<{query: string, sql: string}> = []) =>
      apiRequest<any>('/query/generate', {
        method: 'POST',
        body: JSON.stringify({ sessionId, query, history }),
      }),
    
    execute: (sessionId: string, sql: string, requestId?: string) =>
      apiRequest<any>('/query/execute', {
        method: 'POST',
        body: JSON.stringify({ sessionId, sql, requestId }),
      }),
    
    visualize: (data: any) =>
      apiRequest<any>('/query/visualize', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },

  // Schema endpoints (existing)
  schema: {
    connect: (config: any) =>
      apiRequest<any>('/schema/connect', {
        method: 'POST',
        body: JSON.stringify(config),
      }),
    
    extract: (sessionId: string) =>
      apiRequest<any>('/schema/extract', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      }),
    
    progress: (sessionId: string) =>
      apiRequest<any>(`/schema/progress/${sessionId}`),
  },

  // Health check endpoints
  health: {
    status: (sessionId?: string) =>
      apiRequest<any>(`/health/status${sessionId ? `?sessionId=${sessionId}` : ''}`),
  },

  // Log endpoints
  logs: {
    getAll: (limit: number = 50) =>
      apiRequest<any>(`/logs?limit=${limit}`),
    
    get: (requestId: string) =>
      apiRequest<any>(`/logs/${requestId}`),
  },
};

export default api;
