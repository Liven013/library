import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { listBooks, deleteBook, createBook } from '../api/books'
import { listAuthors, getAuthor } from '../api/authors'
import { listAllShelves } from '../api/shelves'
import { listAllTags } from '../api/tags'
import { buildBookFormData, showBookError } from '../utils/books'
import Modal from '../components/Modal'
import BookForm from '../components/BookForm'
import BooksSidebar from '../components/BooksSidebar'
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

function BookRow({ book, onDelete, tagsExpanded, onToggleTags }) {
  const tagNames = book.tag_names || []
  const genreNames = book.genre_names || []
  const hasTags = tagNames.length > 0
  const hasGenres = genreNames.length > 0

  return (
    <article className="book-row">
      <Link to={`/books/${book.id}`} className="book-row-cover-link">
        <div className="book-row-cover">
          {book.cover_path ? (
            <img src={`/covers/${book.cover_path.replace(/^covers\//, '')}`} alt="" />
          ) : (
            <DefaultCover />
          )}
        </div>
      </Link>
      <div className="book-row-body">
        <Link to={`/books/${book.id}`} className="book-row-title">{book.title}</Link>
        <p className="book-row-author">{book.author_name ? book.author_name.toUpperCase() : '—'}</p>
        <div className="book-row-desc">
          <p>{book.short_description || 'Нет описания'}</p>
        </div>
        {hasTags && (
          <div className="book-row-chips-wrap">
            <div
              className={`book-row-chips ${tagsExpanded ? 'book-row-chips-expanded' : ''}`}
              onClick={!tagsExpanded && tagNames.length > 0 ? onToggleTags : undefined}
              role={!tagsExpanded && tagNames.length > 0 ? 'button' : undefined}
              tabIndex={!tagsExpanded && tagNames.length > 0 ? 0 : undefined}
              onKeyDown={(e) => !tagsExpanded && tagNames.length > 0 && (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onToggleTags())}
            >
              {tagNames.map((name) => (
                <span key={name} className="tag-chip book-row-chip">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}
        {hasGenres && (
          <div className="book-row-chips-wrap">
            <div className="book-row-chips book-row-chips-expanded">
              {genreNames.map((name) => (
                <span key={name} className="tag-chip book-row-chip book-row-genre">{name}</span>
              ))}
            </div>
          </div>
        )}
        <div className="book-row-actions">
          <button type="button" onClick={() => onDelete(book.id)} className="btn-delete" title="Удалить">
            <IconDelete />
          </button>
        </div>
      </div>
    </article>
  )
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
  const [selectedTagIds, setSelectedTagIds] = useState([])
  const [expandedTagsBookIds, setExpandedTagsBookIds] = useState(new Set())
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

  const submitSearch = () => {
    setDebouncedSearch(searchQuery)
    setPage(1)
  }

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

  const toggleTagsExpand = (bookId) => {
    setExpandedTagsBookIds((prev) => {
      const next = new Set(prev)
      if (next.has(bookId)) next.delete(bookId)
      else next.add(bookId)
      return next
    })
  }

  const { books, pagination } = data
  const hasPrev = pagination.current_page > 1
  const hasNext = pagination.current_page < pagination.total_pages

  return (
    <div className="books-page">
      <header className="books-page-header">
        <h1 className="books-page-title">Библиотека</h1>
        <button type="button" onClick={openCreate} className="btn-primary btn-icon" title="Добавить книгу">
          <IconAdd />
        </button>
      </header>

      <div className="books-page-columns">
        <BooksSidebar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSubmitSearch={submitSearch}
          selectedTagIds={selectedTagIds}
          onTagToggle={(id) => setSelectedTagIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        />
        <div className="books-content">
          {error ? (
            <p className="books-content-error">{error}</p>
          ) : loading ? (
            <p className="books-content-muted">Загрузка...</p>
          ) : books.length === 0 ? (
            <p className="books-content-muted">Книг пока нет.</p>
          ) : (
            <>
              <ul className="books-list-rows">
                {books.map((book) => (
                  <li key={book.id}>
                    <BookRow
                      book={book}
                      onDelete={handleDelete}
                      tagsExpanded={expandedTagsBookIds.has(book.id)}
                      onToggleTags={() => toggleTagsExpand(book.id)}
                    />
                  </li>
                ))}
              </ul>
              {(hasPrev || hasNext) && (
                <div className="books-pagination">
                  <button type="button" disabled={!hasPrev} onClick={() => setPage((p) => p - 1)} className="btn-primary">Назад</button>
                  <span className="books-pagination-info">{pagination.current_page} / {pagination.total_pages}</span>
                  <button type="button" disabled={!hasNext} onClick={() => setPage((p) => p + 1)} className="btn-primary">Вперёд</button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
