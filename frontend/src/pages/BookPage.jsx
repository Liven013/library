import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getBook, updateBook, deleteBook } from '../api/books'
import { listAuthors } from '../api/authors'
import { listAllShelves } from '../api/shelves'
import { listAllTags } from '../api/tags'
import { buildBookFormData, showBookError } from '../utils/books'
import Modal from '../components/Modal'
import BookForm from '../components/BookForm'
import { IconEdit, IconDelete } from '../components/Icons'

const DEFAULT_COVER_URL = '/default-cover.png'

function DefaultCover() {
  const [failed, setFailed] = useState(false)
  if (failed) {
    return (
      <span className="book-cover-placeholder" aria-hidden style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 40 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="book-placeholder-icon" style={{ width: '56%', maxWidth: 120 }}>
          <ellipse cx="20" cy="50" rx="14" ry="2.5" fill="var(--placeholder-shadow)" />
          <path d="M5 12 L8 11 L8 48 L5 49 Z" fill="var(--placeholder-side)" stroke="var(--placeholder-outline)" strokeWidth="0.9" strokeLinejoin="round" />
          <path d="M8 11 L32 11 L32 47.5 Q32 49 30 49 L10 49 Q8 49 8 47.5 Z" fill="var(--placeholder-cover)" stroke="var(--placeholder-outline)" strokeWidth="0.9" strokeLinejoin="round" />
          <rect x="13" y="19" width="12" height="10" rx="1.5" fill="var(--placeholder-label)" stroke="var(--placeholder-outline)" strokeWidth="0.75" />
        </svg>
      </span>
    )
  }
  return <img src={DEFAULT_COVER_URL} alt="" onError={() => setFailed(true)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
}

export default function BookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [authors, setAuthors] = useState([])
  const [shelves, setShelves] = useState([])
  const [tags, setTags] = useState([])
  const [form, setForm] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(null)
    getBook(id)
      .then((data) => {
        setBook(data)
        setForm({
          title: data.title ?? '',
          short_description: data.short_description ?? '',
          full_description: data.full_description ?? '',
          author_id: data.author_id ?? '',
          shelf_id: data.shelf_id ?? '',
          tag_ids: data.tag_ids ?? [],
          cover_file: null,
        })
      })
      .catch((e) => setError(e.message || 'Книга не найдена'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (editing) {
      Promise.all([
        listAuthors({ per_page: 500 }).then((r) => setAuthors(r.authors || [])).catch(() => setAuthors([])),
        listAllShelves().then(setShelves).catch(() => setShelves([])),
        listAllTags().then(setTags).catch(() => setTags([])),
      ])
    }
  }, [editing])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!id || !form) return
    setSubmitLoading(true)
    updateBook(id, buildBookFormData(form))
      .then(() => {
        getBook(id).then(setBook)
        setEditing(false)
        setForm((f) => ({ ...f, cover_file: null }))
      })
      .catch(showBookError)
      .finally(() => setSubmitLoading(false))
  }

  const handleDelete = () => {
    if (!confirm('Удалить эту книгу?')) return
    deleteBook(id).then(() => navigate('/books')).catch((e) => alert(e.message || 'Ошибка удаления'))
  }

  if (loading) return <p style={{ color: 'var(--muted)' }}>Загрузка...</p>
  if (error) return <p style={{ color: 'var(--danger)' }}>{error}</p>
  if (!book) return null

  const coverUrl = book.cover_path ? `/covers/${book.cover_path.replace(/^covers\//, '')}` : null

  return (
    <div style={styles.wrapper}>
      <div style={styles.back}>
        <Link to="/books">← К списку книг</Link>
      </div>

      {!editing ? (
        <>
          <div style={styles.header}>
            <h1 style={styles.title}>{book.title}</h1>
            <div style={styles.headerActions}>
              <button type="button" onClick={() => setEditing(true)} className="btn-edit" title="Редактировать">
                <IconEdit />
              </button>
              <button type="button" onClick={handleDelete} className="btn-delete" title="Удалить">
                <IconDelete />
              </button>
            </div>
          </div>

          <div style={styles.content}>
            <div style={styles.coverBlock}>
              {coverUrl ? (
                <img src={coverUrl} alt="" style={styles.coverImg} />
              ) : (
                <div style={styles.coverPlaceholder}>
                  <DefaultCover />
                </div>
              )}
            </div>
            <div style={styles.details}>
              {book.author_name && <p style={styles.meta}><strong>Автор:</strong> {book.author_name}</p>}
              {book.shelf_name && <p style={styles.meta}><strong>Полка:</strong> {book.shelf_name}</p>}
              {book.tag_names?.length > 0 && (
                <p style={styles.meta}>
                  <strong>Теги:</strong>{' '}
                  {book.tag_names.map((n) => (
                    <span key={n} className="tag-chip" style={{ marginRight: '0.35rem' }}>{n}</span>
                  ))}
                </p>
              )}
              {book.short_description && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Краткое описание</h3>
                  <p style={styles.text}>{book.short_description}</p>
                </div>
              )}
              {book.full_description && (
                <div style={styles.section}>
                  <h3 style={styles.sectionTitle}>Полное описание</h3>
                  <p style={styles.textWhiteSpace}>{book.full_description}</p>
                </div>
              )}
              {!book.short_description && !book.full_description && (
                <p style={{ color: 'var(--muted)' }}>Описание не указано.</p>
              )}
            </div>
          </div>
        </>
      ) : (
        <Modal title="Редактировать книгу" onClose={() => !submitLoading && setEditing(false)}>
          <BookForm
            form={form}
            setForm={setForm}
            authors={authors}
            shelves={shelves}
            tags={tags}
            onSubmit={handleSubmit}
            submitLoading={submitLoading}
            submitLabel="Сохранить"
            onCancel={() => setEditing(false)}
          />
        </Modal>
      )}
    </div>
  )
}

const styles = {
  wrapper: { maxWidth: 720 },
  back: { marginBottom: '1rem' },
  header: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.5rem' },
  title: { margin: 0, fontSize: '1.75rem' },
  headerActions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  content: { display: 'flex', gap: '2rem', flexWrap: 'wrap' },
  coverBlock: { flexShrink: 0, width: 200, maxWidth: '100%' },
  coverPlaceholder: { aspectRatio: '2/3', background: 'var(--border)', borderRadius: 8, overflow: 'hidden', minHeight: 280 },
  coverImg: { width: '100%', display: 'block', borderRadius: 8 },
  details: { flex: 1, minWidth: 0 },
  meta: { margin: '0 0 0.5rem', color: 'var(--text)', fontSize: '0.95rem' },
  section: { marginTop: '1.25rem' },
  sectionTitle: { margin: '0 0 0.35rem', fontSize: '1rem', color: 'var(--muted)' },
  text: { margin: 0, lineHeight: 1.5 },
  textWhiteSpace: { margin: 0, lineHeight: 1.5, whiteSpace: 'pre-wrap' },
}
