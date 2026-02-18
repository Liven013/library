import AuthorSearchSelect from './AuthorSearchSelect'

/**
 * Форма книги (создание/редактирование): все поля + авторы (поиск на бэкенде), полки, теги, обложка.
 * Родитель передаёт form, setForm, listAuthors, getAuthor, shelves, tags и обрабатывает submit.
 */
export default function BookForm({ form, setForm, listAuthors, getAuthor, shelves = [], tags = [], onSubmit, submitLoading, submitLabel = 'Сохранить', onCancel }) {
  const toggleTag = (tagId) => {
    setForm((f) => ({
      ...f,
      tag_ids: f.tag_ids.includes(tagId) ? f.tag_ids.filter((t) => t !== tagId) : [...f.tag_ids, tagId],
    }))
  }

  const tagListStyle = { display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }
  const tagCheckboxStyle = { display: 'flex', alignItems: 'center', gap: '0.35rem', cursor: 'pointer', fontSize: '0.9rem' }

  return (
    <form onSubmit={onSubmit}>
      <div className="form-row">
        <label htmlFor="book-title">Название *</label>
        <input
          id="book-title"
          value={form?.title ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          required
          autoFocus
        />
      </div>
      <div className="form-row">
        <label htmlFor="book-short-desc">Краткое описание</label>
        <textarea
          id="book-short-desc"
          value={form?.short_description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, short_description: e.target.value }))}
          rows={2}
        />
      </div>
      <div className="form-row">
        <label htmlFor="book-full-desc">Полное описание</label>
        <textarea
          id="book-full-desc"
          value={form?.full_description ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, full_description: e.target.value }))}
        />
      </div>
      <div className="form-row">
        <label htmlFor="book-author">Автор</label>
        <AuthorSearchSelect
          id="book-author"
          value={form?.author_id ?? ''}
          onChange={(authorId) => setForm((f) => ({ ...f, author_id: authorId }))}
          onSearch={(q, perPage) => listAuthors({ q: q ?? undefined, per_page: perPage || 25 })}
          getAuthor={(id) => getAuthor(id)}
          placeholder="Введите имя для поиска или выберите из списка"
        />
      </div>
      <div className="form-row">
        <label htmlFor="book-shelf">Полка</label>
        <select
          id="book-shelf"
          value={form?.shelf_id ?? ''}
          onChange={(e) => setForm((f) => ({ ...f, shelf_id: e.target.value }))}
        >
          <option value="">— не выбрана —</option>
          {shelves.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}{s.cabinet_name ? ` — ${s.cabinet_name}` : ''}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label>Теги</label>
        <div style={tagListStyle}>
          {tags.map((t) => (
            <label key={t.id} style={tagCheckboxStyle}>
              <input
                type="checkbox"
                checked={form?.tag_ids?.includes(t.id) ?? false}
                onChange={() => toggleTag(t.id)}
              />
              <span>{t.name}</span>
            </label>
          ))}
          {tags.length === 0 && <span style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Нет тегов. Добавьте в разделе «Теги».</span>}
        </div>
      </div>
      <div className="form-row">
        <label htmlFor="book-cover">Обложка</label>
        <input
          id="book-cover"
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.gif"
          onChange={(e) => setForm((f) => ({ ...f, cover_file: e.target.files?.[0] ?? null }))}
        />
        {form?.cover_file && (
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Выбран: {form.cover_file.name}</span>
        )}
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={submitLoading}>
          {submitLoading ? 'Сохранение...' : submitLabel}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel} disabled={submitLoading}>
          Отмена
        </button>
      </div>
    </form>
  )
}
