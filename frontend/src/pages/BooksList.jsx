import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { listBooks, deleteBook, createBook } from '../api/books'
import { listAuthors, getAuthor } from '../api/authors'
import { listAllShelves } from '../api/shelves'
import { listAllTags } from '../api/tags'
import { buildBookFormData, showBookError } from '../utils/books'
import Modal from '../components/Modal'
import BookForm from '../components/BookForm'
import { IconAdd, IconDelete } from '../components/Icons'

const DEFAULT_COVER_URL = '/default-cover.png'

const emptyForm = {
  title: '',
  short_description: '',
  full_description: '',
  author_id: '',
  shelf_id: '',
  tag_ids: [],
  cover_file: null,
}

function DefaultCover() {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className="book-cover-placeholder" aria-hidden>
        <svg viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="book-placeholder-icon">
          <ellipse cx="20" cy="50" rx="14" ry="2.5" fill="var(--placeholder-shadow)" />
          <path d="M5 12 L8 11 L8 48 L5 49 Z" fill="var(--placeholder-side)" stroke="var(--placeholder-outline)" strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M8 11 L32 11 L32 47.5 Q32 49 30 49 L10 49 Q8 49 8 47.5 Z" fill="var(--placeholder-cover)" stroke="var(--placeholder-outline)" strokeWidth="0.9" strokeLinejoin="round" />
          <rect x="13" y="19" width="12" height="10" rx="1.5" fill="var(--placeholder-label)" stroke="var(--placeholder-outline)" strokeWidth="0.75" />
        </svg>
      </span>
    )
  }
  return <img src={DEFAULT_COVER_URL} alt="" onError={() => setFailed(true)} />
}

export default function BooksList() {
  const [data, setData] = useState({ books: [], pagination: { current_page: 1, total_pages: 1 } })
  const [shelves, setShelves] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const debounceRef = useRef(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, 350)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [searchQuery])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const params = { page, per_page: 10 }
    if (debouncedSearch.trim()) params.q = debouncedSearch.trim()
    listBooks(params)
      .then((res) => { if (!cancelled) setData(res) })
      .catch((e) => { if (!cancelled) setError(e.message || 'Ошибка загрузки') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [page, debouncedSearch])

  const openCreate = () => {
    setForm(emptyForm)
    setModalOpen(true)
    Promise.all([
      listAllShelves().then(setShelves).catch(() => setShelves([])),
      listAllTags().then(setTags).catch(() => setTags([])),
    ])
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    createBook(buildBookFormData(form))
      .then(() => {
        setModalOpen(false)
        setPage(1)
        const params = { page: 1, per_page: 10 }
        if (debouncedSearch.trim()) params.q = debouncedSearch.trim()
        listBooks(params).then(setData)
      })
      .catch(showBookError)
      .finally(() => setSubmitLoading(false))
  }

  const handleDelete = (id) => {
    if (!confirm('Удалить книгу?')) return
    deleteBook(id)
      .then(() => setData((prev) => ({ ...prev, books: prev.books.filter((b) => b.id !== id) })))
      .catch((e) => alert(e.message || 'Ошибка удаления'))
  }

  const { books, pagination } = data
  const hasPrev = pagination.current_page > 1
  const hasNext = pagination.current_page < pagination.total_pages

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Книги</h1>
        <button type="button" onClick={openCreate} className="btn-primary btn-icon" title="Добавить книгу">
          <IconAdd />
        </button>
      </div>

      <div className="form-row" style={{ marginBottom: '1rem', maxWidth: 320 }}>
        <label htmlFor="books-search">Поиск</label>
        <input
          id="books-search"
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="По названию книги..."
          autoComplete="off"
          autoFocus
        />
      </div>

      {error ? (
        <p style={{ color: 'var(--danger)' }}>{error}</p>
      ) : loading ? (
        <p style={{ color: 'var(--muted)' }}>Загрузка...</p>
      ) : books.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Книг пока нет.</p>
      ) : (
        <>
          <div className="books-grid">
            {books.map((book) => (
              <article key={book.id} className="book-card">
                <Link to={`/books/${book.id}`} className="book-cover-link book-card-cover">
                  <div className="book-cover">
                    {book.cover_path ? (
                      <img src={`/covers/${book.cover_path.replace(/^covers\//, '')}`} alt="" />
                    ) : (
                      <DefaultCover />
                    )}
                  </div>
                </Link>
                <div className="book-card-body">
                  <Link to={`/books/${book.id}`} className="book-card-title">{book.title}</Link>
                  <p className="book-card-author">{book.author_name || '—'}</p>
                  <div className="book-card-desc">
                    <p>{book.short_description || 'Нет описания'}</p>
                  </div>
                  <p className="book-card-shelf">
                    <span className="book-card-shelf-label">Полка:</span> {book.shelf_name || 'не указана'}
                  </p>
                  {book.tag_names?.length > 0 && (
                    <div className="book-card-tags">
                      {book.tag_names.map((name) => (
                        <span key={name} className="tag-chip">{name}</span>
                      ))}
                    </div>
                  )}
                  <div className="book-card-actions">
                    <button type="button" onClick={() => handleDelete(book.id)} className="btn-delete" title="Удалить">
                      <IconDelete />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
        <Modal title="Добавить книгу" onClose={() => !submitLoading && setModalOpen(false)}>
          <BookForm
            form={form}
            setForm={setForm}
            listAuthors={listAuthors}
            getAuthor={getAuthor}
            shelves={shelves}
            tags={tags}
            onSubmit={handleSubmit}
            submitLoading={submitLoading}
            submitLabel="Добавить"
            onCancel={() => setModalOpen(false)}
          />
        </Modal>
      )}
    </div>
  )
}

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' },
  title: { margin: 0, fontSize: '1.5rem' },
  pagination: { display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' },
  pageInfo: { color: 'var(--muted)', fontSize: '0.9rem' },
}
