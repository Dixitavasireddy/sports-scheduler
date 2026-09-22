let cachedCsrfToken = null;

/**
 * Fetch a fresh CSRF token from the backend.
 */
export async function fetchCsrfToken() {
  try {
    const res = await fetch('/api/csrf-token', {
      credentials: 'include',
    });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken;
      return cachedCsrfToken;
    }
  } catch (err) {
    console.error('Failed to fetch CSRF token:', err);
  }
  return null;
}

/**
 * Core HTTP request handler with credentials and CSRF injection.
 */
async function request(url, options = {}, isRetry = false) {
  const method = (options.method || 'GET').toUpperCase();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Attach CSRF token on mutating requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    if (!cachedCsrfToken) {
      await fetchCsrfToken();
    }
    if (cachedCsrfToken) {
      headers['X-CSRF-Token'] = cachedCsrfToken;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // If CSRF token rejected (403) and not already retried, refresh token and retry
  if (response.status === 403 && !isRetry && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const errorData = await response.clone().json().catch(() => ({}));
    if (errorData.code === 'EBADCSRFTOKEN' || errorData.error?.includes('CSRF')) {
      await fetchCsrfToken();
      return request(url, options, true);
    }
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    let message = data && (data.message || data.error);
    if (!message) {
      if (typeof data === 'string' && (data.includes('ECONNREFUSED') || data.includes('proxy error'))) {
        message = 'Backend server is unreachable. Please verify that the backend is running on port 5000.';
      } else {
        message = `HTTP Error ${response.status}`;
      }
    }
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (url) => request(url, { method: 'GET' }),
  post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
  put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (url) => request(url, { method: 'DELETE' }),
  refreshCsrfToken: fetchCsrfToken,
};

export default api;
