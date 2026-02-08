import { api } from './client';

export function listTags(params = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', params.page);
  if (params.per_page != null) sp.set('per_page', params.per_page);
  const qs = sp.toString();
  return api.get(`/tags/${qs ? `?${qs}` : ''}`);
}

export function listAllTags() {
  return api.get('/tags/all');
}

export function getTag(id) {
  return api.get(`/tags/${id}`);
}

export function createTag(data) {
  return api.post('/tags/', data);
}

export function updateTag(id, data) {
  return api.patch(`/tags/${id}`, data);
}

export function deleteTag(id) {
  return api.delete(`/tags/${id}`);
}
