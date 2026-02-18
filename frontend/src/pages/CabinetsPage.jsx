import { useState, useEffect, useRef } from 'react'
import { listAllCabinets, createCabinet, updateCabinet, deleteCabinet } from '../api/cabinets'
import { listAllShelves, createShelf, updateShelf, deleteShelf } from '../api/shelves'
import Modal from '../components/Modal'
import { IconAdd, IconEdit, IconDelete } from '../components/Icons'

function toList(res, key) {
  if (Array.isArray(res)) return res
  return Array.isArray(res?.[key]) ? res[key] : []
}

/** True, если хотя бы одно слово в text начинается с fragment (без учёта регистра). */
function wordStartsWith(text, fragment) {
  if (!fragment || !text) return !fragment
  const f = fragment.trim().toLowerCase()
  if (!f) return true
  const words = (text || '').trim().split(/\s+/)
  return words.some((w) => w.toLowerCase().startsWith(f))
}

/** Группирует полки по шкафу. Сначала шкафы по порядку, в конце — «Без шкафа». */
function groupShelvesByCabinet(shelves, cabinets) {
  const cabIds = new Set(cabinets.map((c) => String(c.id)))
  const byCab = cabinets.map((cab) => ({
    cabinet: cab,
    name: cab?.name ?? '',
    shelves: shelves.filter((s) => String(s?.cabinet_id) === String(cab.id)),
  }))
  const noCabinet = shelves.filter((s) => !s?.cabinet_id || !cabIds.has(String(s.cabinet_id)))
  if (noCabinet.length > 0) byCab.push({ cabinet: null, name: 'Без шкафа', shelves: noCabinet })
  return byCab
}

export default function CabinetsPage() {
  const [cabinets, setCabinets] = useState([])
  const [shelves, setShelves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [cabinetModalOpen, setCabinetModalOpen] = useState(false)
  const [editingCabinet, setEditingCabinet] = useState(null)
  const [cabinetName, setCabinetName] = useState('')
  const [cabinetSubmitting, setCabinetSubmitting] = useState(false)

  const [shelfModalOpen, setShelfModalOpen] = useState(false)
  const [editingShelf, setEditingShelf] = useState(null)
  const [shelfName, setShelfName] = useState('')
  const [shelfCabinetId, setShelfCabinetId] = useState('')
  const [shelfSubmitting, setShelfSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef(null)

  const load = () => {
    setLoading(true)
    setError(null)
    Promise.all([listAllCabinets(), listAllShelves()])
      .then(([cabs, shvs]) => {
        setCabinets(toList(cabs, 'cabinets'))
        setShelves(toList(shvs, 'shelves'))
      })
      .catch((e) => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }

  useEffect(() => load(), [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(searchQuery), 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery])

  const openCabinet = (cabinet = null) => {
    setEditingCabinet(cabinet)
    setCabinetName(cabinet?.name ?? '')
    setCabinetModalOpen(true)
  }

  const saveCabinet = (e) => {
    e.preventDefault()
    const name = cabinetName.trim()
    if (!name) return
    setCabinetSubmitting(true)
    const fn = editingCabinet ? () => updateCabinet(String(editingCabinet.id), { name }) : () => createCabinet({ name })
    fn()
      .then(() => { setCabinetModalOpen(false); load() })
      .catch((err) => alert(err.message || 'Ошибка'))
      .finally(() => setCabinetSubmitting(false))
  }

  const removeCabinet = (id) => {
    if (!confirm('Удалить шкаф? Полки останутся без шкафа.')) return
    deleteCabinet(String(id)).then(load).catch((e) => alert(e.message || 'Ошибка'))
  }

  const openShelf = (shelf = null, cabinetId = '') => {
    setEditingShelf(shelf)
    setShelfName(shelf?.name ?? '')
    setShelfCabinetId(shelf != null ? String(shelf.cabinet_id ?? '') : (cabinetId || (cabinets[0] ? String(cabinets[0].id) : '')))
    setShelfModalOpen(true)
  }

  const saveShelf = (e) => {
    e.preventDefault()
    const name = shelfName.trim()
    if (!name) return
    setShelfSubmitting(true)
    const data = { name, cabinet_id: shelfCabinetId?.trim() || null }
    const fn = editingShelf ? () => updateShelf(String(editingShelf.id), data) : () => createShelf(data)
    fn()
      .then(() => { setShelfModalOpen(false); load() })
      .catch((err) => alert(err.message || 'Ошибка'))
      .finally(() => setShelfSubmitting(false))
  }

  const removeShelf = (id) => {
    if (!confirm('Удалить полку?')) return
    deleteShelf(String(id)).then(load).catch((e) => alert(e.message || 'Ошибка'))
  }

  const allGroups = groupShelvesByCabinet(shelves, cabinets)
  const q = debouncedSearch.trim()
  const groups = q
    ? allGroups
      .map((g) => ({
        ...g,
        shelves: g.shelves.filter((s) => wordStartsWith(s.name, q)),
      }))
      .filter((g) => wordStartsWith(g.name, q) || g.shelves.length > 0)
    : allGroups
  const empty = cabinets.length === 0 && shelves.length === 0

  return (
    <div>
      <div style={s.header}>
        <h1 style={s.title}>Шкаф</h1>
        <div style={s.headerActions}>
          <button type="button" onClick={() => openCabinet()} className="btn-primary">Шкаф</button>
          <button type="button" onClick={() => openShelf()} className="btn-primary btn-icon" title="Добавить полку">
            <IconAdd />
          </button>
        </div>
      </div>

      <div className="form-row" style={{ marginBottom: '1rem', maxWidth: 320 }}>
        <label htmlFor="cabinets-search">Поиск</label>
        <input
          id="cabinets-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="По шкафу или полке..."
          autoComplete="off"
          autoFocus
        />
      </div>

      <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>Полки сгруппированы по шкафу.</p>

      {error ? (
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      ) : loading ? (
        <p style={{ color: 'var(--muted)' }}>Загрузка...</p>
      ) : empty ? (
        <p style={{ color: 'var(--muted)' }}>Нет шкафов и полок. Добавьте шкаф или полку.</p>
      ) : (
        <div style={s.groups}>
          {groups.map((group, idx) => (
            <section key={group.cabinet ? String(group.cabinet.id) : `no-cab-${idx}`} style={s.group}>
              <div style={s.groupHeader}>
                <h2 style={s.groupTitle}>{group.name}</h2>
                <div style={s.groupActions}>
                  {group.cabinet && (
                    <>
                      <button type="button" onClick={() => openCabinet(group.cabinet)} className="btn-edit" title="Изменить шкаф"><IconEdit /></button>
                      <button type="button" onClick={() => removeCabinet(group.cabinet.id)} className="btn-delete" title="Удалить шкаф"><IconDelete /></button>
                    </>
                  )}
                  <button type="button" onClick={() => openShelf(null, group.cabinet ? String(group.cabinet.id) : '')} className="btn-primary btn-icon" title="Добавить полку">
                    <IconAdd />
                  </button>
                </div>
              </div>
              <ul style={s.shelfList}>
                {group.shelves.length === 0 ? (
                  <li style={s.shelfMuted}>Нет полок</li>
                ) : (
                  group.shelves.map((shelf) => (
                    <li key={shelf.id} style={s.shelfItem}>
                      <span>{shelf.name}</span>
                      <div style={s.actions}>
                        <button type="button" onClick={() => openShelf(shelf)} className="btn-edit" title="Изменить"><IconEdit /></button>
                        <button type="button" onClick={() => removeShelf(shelf.id)} className="btn-delete" title="Удалить"><IconDelete /></button>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </section>
          ))}
        </div>
      )}

      {cabinetModalOpen && (
        <Modal title={editingCabinet ? 'Редактировать шкаф' : 'Добавить шкаф'} onClose={() => !cabinetSubmitting && setCabinetModalOpen(false)}>
          <form onSubmit={saveCabinet}>
            <div className="form-row">
              <label htmlFor="cabinet-name">Название *</label>
              <input id="cabinet-name" value={cabinetName} onChange={(e) => setCabinetName(e.target.value)} required autoFocus />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={cabinetSubmitting}>
                {cabinetSubmitting ? 'Сохранение...' : editingCabinet ? 'Сохранить' : 'Добавить'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setCabinetModalOpen(false)} disabled={cabinetSubmitting}>Отмена</button>
            </div>
          </form>
        </Modal>
      )}

      {shelfModalOpen && (
        <Modal title={editingShelf ? 'Редактировать полку' : 'Добавить полку'} onClose={() => !shelfSubmitting && setShelfModalOpen(false)}>
          <form onSubmit={saveShelf}>
            <div className="form-row">
              <label htmlFor="shelf-name">Название *</label>
              <input id="shelf-name" value={shelfName} onChange={(e) => setShelfName(e.target.value)} required autoFocus />
            </div>
            <div className="form-row">
              <label htmlFor="shelf-cabinet">Шкаф</label>
              <select id="shelf-cabinet" value={shelfCabinetId} onChange={(e) => setShelfCabinetId(e.target.value)}>
                <option value="">— без шкафа —</option>
                {cabinets.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={shelfSubmitting}>
                {shelfSubmitting ? 'Сохранение...' : editingShelf ? 'Сохранить' : 'Добавить'}
              </button>
              <button type="button" className="btn-secondary" onClick={() => setShelfModalOpen(false)} disabled={shelfSubmitting}>Отмена</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}

const s = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' },
  title: { margin: 0, fontSize: '1.5rem' },
  headerActions: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  groups: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  group: { border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden', background: 'var(--surface)' },
  groupHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', background: 'var(--bg)' },
  groupTitle: { margin: 0, fontSize: '1.1rem' },
  groupActions: { display: 'flex', gap: '0.35rem', alignItems: 'center' },
  shelfList: { listStyle: 'none', margin: 0, padding: '0.5rem' },
  shelfItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: 6, marginBottom: '0.35rem', background: 'var(--surface)', border: '1px solid var(--border)' },
  shelfMuted: { padding: '0.6rem 0.75rem', color: 'var(--muted)', fontSize: '0.9rem', margin: 0 },
  actions: { display: 'flex', gap: '0.35rem' },
}
