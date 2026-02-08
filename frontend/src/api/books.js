import { api } from './client';

export function listBooks(params = {}) {
  const sp = new URLSearchParams();
  if (params.page != null) sp.set('page', params.page);
  if (params.per_page != null) sp.set('per_page', params.per_page);
  const qs = sp.toString();
  return api.get(`/books/${qs ? `?${qs}` : ''}`);
}

export function getBook(id) {
  return api.get(`/books/${id}`);
}

/**
 * Создание книги. data — FormData: title, short_description, full_description, author_id, shelf_id, tag_ids (через запятую), cover (файл).
 */
export function createBook(data) {
  return api.post('/books/', data);
}

/**
 * Обновление книги. data — FormData: title, short_description, full_description, author_id, shelf_id, tag_ids (через запятую), cover (файл).
 */
export function updateBook(id, data) {
  return api.patch(`/books/${id}`, data);
}

export function deleteBook(id) {
  return api.delete(`/books/${id}`);
}
