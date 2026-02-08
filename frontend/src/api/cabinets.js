import { api } from './client';

export function listCabinets(params = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', params.page);
  if (params.per_page != null) sp.set('per_page', params.per_page);
  const qs = sp.toString();
  return api.get(`/cabinets/${qs ? `?${qs}` : ''}`);
}

export function listAllCabinets() {
  return api.get('/cabinets/all');
}

export function getCabinet(id) {
  return api.get(`/cabinets/${id}`);
}

export function createCabinet(data) {
  return api.post('/cabinets/', data);
}

export function updateCabinet(id, data) {
  return api.patch(`/cabinets/${id}`, data);
}

export function deleteCabinet(id) {
  return api.delete(`/cabinets/${id}`);
}
