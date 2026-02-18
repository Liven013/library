import { useState, useEffect } from 'react'
import { listShelves, deleteShelf, createShelf, updateShelf } from '../api/shelves'
import Modal from '../components/Modal'
import { IconAdd, IconEdit, IconDelete } from '../components/Icons'

export default function ShelvesList() {
  const [data, setData] = useState({ shelves: [], pagination: { current_page: 1, total_pages: 1 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingShelf, setEditingShelf] = useState(null)
  const [name, setName] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  const loadShelves = () => {
    setLoading(true)
    setError(null)
    listShelves({ page, per_page: 10 })
      .then(setData)
      .catch((e) => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadShelves()
  }, [page])

  const openCreate = () => {
    setEditingShelf(null)
    setName('')
    setModalOpen(true)
  }

  const openEdit = (shelf) => {
    setEditingShelf(shelf)
    setName(shelf.name ?? '')
    setModalOpen(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitLoading(true)
    const promise = editingShelf
      ? updateShelf(editingShelf.id, { name: trimmed })
      : createShelf({ name: trimmed })
    promise
      .then(() => {
        setModalOpen(false)
        loadShelves()
      })
      .catch((err) => alert(err.message || 'Ошибка сохранения'))
      .finally(() => setSubmitLoading(false))
  }

  const handleDelete = (id) => {
    if (!confirm('Удалить полку?')) return
    deleteShelf(id)
      .then(() => setData((prev) => ({ ...prev, shelves: prev.shelves.filter((s) => s.id !== id) })))
      .catch((e) => alert(e.message || 'Ошибка удаления'))
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Загрузка...</p>
  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>

  const { shelves, pagination } = data
  const hasPrev = pagination.current_page > 1
  const hasNext = pagination.current_page < pagination.total_pages

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Полки</h1>
        <button type="button" onClick={openCreate} className="btn-primary btn-icon" title="Добавить полку">
          <IconAdd />
        </button>
      </div>

      {shelves.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Полок пока нет. Добавьте полки для организации книг.</p>
      ) : (
        <>
          <ul style={styles.list}>
            {shelves.map((shelf) => (
              <li key={shelf.id} style={styles.listItem}>
                <span>{shelf.name}</span>
                <div style={styles.actions}>
                  <button type="button" onClick={() => openEdit(shelf)} className="btn-edit" title="Изменить">
                    <IconEdit />
                  </button>
                  <button type="button" onClick={() => handleDelete(shelf.id)} className="btn-delete" title="Удалить">
                    <IconDelete />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {(hasPrev || hasNext) && (
            <div style={styles.pagination}>
              <button type="button" disabled={!hasPrev} onClick={() => setPage((p) => p - 1)} className="btn-primary">Назад</button>
              <span style={styles.pageInfo}>{pagination.current_page} / {pagination.total_pages}</span>
              <button type="button" disabled={!hasNext} onClick={() => setPage((p) => p + 1)} className="btn-primary">Вперёд</button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <Modal
          title={editingShelf ? 'Редактировать полку' : 'Добавить полку'}
          onClose={() => !submitLoading && setModalOpen(false)}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="shelf-name">Название *</label>
              <input
                id="shelf-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Сохранение...' : editingShelf ? 'Сохранить' : 'Добавить'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)} disabled={submitLoading}>
                Отмена
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' },
  title: { margin: 0, fontSize: '1.5rem' },
  list: { listStyle: 'none', margin: 0, padding: 0 },
  listItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 8, marginBottom: '0.5rem', background: 'var(--surface)' },
  actions: { display: 'flex', gap: '0.5rem' },
  pagination: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' },
  pageInfo: { color: 'var(--muted)', fontSize: '0.9rem' },
}
