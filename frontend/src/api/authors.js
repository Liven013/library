import { api } from './client';

export function listAuthors(params = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', params.page);
  if (params.per_page != null) sp.set('per_page', params.per_page);
  const qs = sp.toString();
  return api.get(`/authors/${qs ? `?${qs}` : ''}`);
}

export function getAuthor(id) {
  return api.get(`/authors/${id}`);
}

export function createAuthor(data) {
  return api.post('/authors/', data);
}

export function updateAuthor(id, data) {
  return api.patch(`/authors/${id}`, data);
}

export function deleteAuthor(id) {
  return api.delete(`/authors/${id}`);
}
