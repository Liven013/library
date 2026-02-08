import Modal from './Modal'
import { IconAdd, IconEdit, IconDelete } from './Icons'
import { useSimpleList } from '../hooks/useSimpleList'

const paginationStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem',
  marginTop: '1rem',
}
const pageInfoStyle = { color: 'var(--muted)', fontSize: '0.9rem' }
const listStyles = {
  list: { listStyle: 'none', padding: 0, margin: 0 },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    marginBottom: '0.5rem',
  },
  actions: { display: 'flex', gap: '0.5rem' },
}

/**
 * Страница списка с одним полем (имя): заголовок, кнопка «Добавить», список, пагинация, модалка создания/редактирования.
 * Пропсы: title, emptyMessage, addTitle, editTitle, fieldLabel, listApi, itemsKey, createApi, updateApi, deleteApi, renderItem (опционально).
 */
export default function SimpleListPage({
  title,
  emptyMessage = 'Пока ничего нет.',
  addTitle = 'Добавить',
  editTitle = 'Редактировать',
  fieldLabel = 'Имя',
  deleteConfirm = 'Удалить?',
  listApi,
  itemsKey,
  createApi,
  updateApi,
  deleteApi,
  renderItem = (item) => <strong>{item.name}</strong>,
}) {
  const {
    data: { items, pagination },
    loading,
    error,
    page,
    setPage,
    modalOpen,
    openCreate,
    openEdit,
    closeModal,
    name,
    setName,
    editingItem,
    handleSubmit,
    handleDelete,
    submitLoading,
  } = useSimpleList({ listApi, itemsKey, createApi, updateApi, deleteApi, deleteConfirm })

  if (loading) return <p style={{ color: 'var(--muted)' }}>Загрузка...</p>
  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>

  const hasPrev = pagination.current_page > 1
  const hasNext = pagination.current_page < pagination.total_pages

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem' }}>{title}</h1>
        <button type="button" onClick={openCreate} className="btn-primary btn-icon" title={addTitle}>
          <IconAdd />
        </button>
      </div>

      {items.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>{emptyMessage}</p>
      ) : (
        <>
          <ul style={listStyles.list}>
            {items.map((item) => (
              <li key={item.id} style={listStyles.item}>
                <div>{renderItem(item)}</div>
                <div style={listStyles.actions}>
                  <button type="button" onClick={() => openEdit(item)} className="btn-edit" title="Изменить">
                    <IconEdit />
                  </button>
                  <button type="button" onClick={() => handleDelete(item.id)} className="btn-delete" title="Удалить">
                    <IconDelete />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {(hasPrev || hasNext) && (
            <div style={paginationStyles}>
              <button type="button" disabled={!hasPrev} onClick={() => setPage((p) => p - 1)} className="btn-primary">
                Назад
              </button>
              <span style={pageInfoStyle}>
                {pagination.current_page} / {pagination.total_pages}
              </span>
              <button type="button" disabled={!hasNext} onClick={() => setPage((p) => p + 1)} className="btn-primary">
                Вперёд
              </button>
            </div>
          )}
        </>
      )}

      {modalOpen && (
        <Modal title={editingItem ? editTitle : addTitle} onClose={closeModal}>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label htmlFor="item-name">{fieldLabel} *</label>
              <input
                id="item-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={submitLoading}>
                {submitLoading ? 'Сохранение...' : editingItem ? 'Сохранить' : 'Добавить'}
              </button>
              <button type="button" className="btn-secondary" onClick={closeModal} disabled={submitLoading}>
                Отмена
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
