export function buildBookFormData(form) {
  const fd = new FormData()
  fd.append('title', form.title.trim())
  fd.append('short_description', form.short_description.trim() || '')
  fd.append('full_description', form.full_description.trim() || '')
  fd.append('author_id', form.author_id || '')
  fd.append('shelf_id', form.shelf_id || '')
  fd.append('tag_ids', form.tag_ids.length ? form.tag_ids.join(',') : '')
  if (form.cover_file) fd.append('cover', form.cover_file)
  return fd
}

export function showBookError(err) {
  const detail = err.body?.detail
  const msg = Array.isArray(detail)
    ? detail.map((d) => d.msg || d.loc?.join('.')).join('; ')
    : typeof detail === 'string'
      ? detail
      : err.message || 'Ошибка сохранения'
  alert(msg)
}
