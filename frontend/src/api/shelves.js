import { api } from './client';

export function listShelves(params = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', params.page);
  if (params.per_page != null) sp.set('per_page', params.per_page);
  const qs = sp.toString();
  return api.get(`/shelves/${qs ? `?${qs}` : ''}`);
}

export function listAllShelves() {
  return api.get('/shelves/all');
}

export function getShelf(id) {
  return api.get(`/shelves/${id}`);
}

export function createShelf(data) {
  return api.post('/shelves/', data);
}

export function updateShelf(id, data) {
  return api.patch(`/shelves/${id}`, data);
}

export function deleteShelf(id) {
  return api.delete(`/shelves/${id}`);
}
