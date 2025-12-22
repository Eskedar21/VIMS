const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'https://vims-api.placeholder';

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

const buildUrl = (path) => {
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

async function request(path, options = {}) {
  const { headers = {}, body, method = 'GET', signal } = options;
  const response = await fetch(buildUrl(path), {
    method,
    headers: { ...DEFAULT_HEADERS, ...headers },
    body: body ? JSON.stringify(body) : undefined,
    signal,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const error = new Error(payload?.message || 'API request failed');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

const httpClient = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
};

export { httpClient };
export default httpClient;
