const API_BASE = '/api';
const REQUEST_TIMEOUT_MS = 15000;

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const isFormData = options.body instanceof FormData;
  const headers = {
    ...options.headers,
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: options.signal ?? controller.signal,
    });
    if (!res.ok) {
      const err = new Error(res.statusText);
      err.status = res.status;
      err.body = await res.json().catch(() => ({}));
      throw err;
    }
    if (res.status === 204) return null;
    return res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      const timeoutErr = new Error('Сервер не отвечает. Запущен ли бэкенд на порту 8000?');
      timeoutErr.name = 'TimeoutError';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = {
  get: (path) => request(path),
  post: (path, body) =>
    request(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (path, body) =>
    request(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (path) => request(path, { method: 'DELETE' }),
};
