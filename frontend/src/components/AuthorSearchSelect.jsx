import { useState, useRef, useEffect, useCallback } from 'react'

const DEBOUNCE_MS = 300
const SEARCH_PER_PAGE = 25

/**
 * Поле выбора автора с поиском на бэкенде (без учёта регистра).
 * props: value (author_id), onChange(author_id), onSearch(query) -> Promise<{ authors }>, getAuthor(id) -> Promise<{ id, name } | null>, placeholder, id
 */
export default function AuthorSearchSelect({
  value: authorId,
  onChange,
  onSearch,
  getAuthor,
  placeholder = '— не выбран —',
  id = 'book-author',
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedAuthor, setSelectedAuthor] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef(null)
  const listRef = useRef(null)
  const debounceRef = useRef(null)

  const displayValue = selectedAuthor && !searchQuery ? selectedAuthor.name : searchQuery
  const list = searchResults

  // Загрузка имени выбранного автора при value снаружи (например, при редактировании книги)
  useEffect(() => {
    if (!authorId || !getAuthor) return
    if (selectedAuthor && String(selectedAuthor.id) === String(authorId)) return
    let cancelled = false
    getAuthor(authorId)
      .then((a) => {
        if (!cancelled && a) setSelectedAuthor({ id: a.id, name: a.name })
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [authorId, getAuthor])

  // Сброс выбранного автора при сбросе value снаружи
  useEffect(() => {
    if (!authorId) setSelectedAuthor(null)
  }, [authorId])

  // Поиск с debounce
  const runSearch = useCallback(
    (query) => {
      if (!onSearch) return
      setLoading(true)
      const q = query && typeof query === 'string' ? query.trim() || null : null
      onSearch(q, SEARCH_PER_PAGE)
        .then((res) => {
          const authors = res?.authors ?? res ?? []
          setSearchResults(Array.isArray(authors) ? authors : [])
        })
        .catch(() => setSearchResults([]))
        .finally(() => setLoading(false))
    },
    [onSearch]
  )

  // Поиск с debounce при открытии списка или при вводе
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!isOpen) return
    debounceRef.current = setTimeout(() => runSearch(searchQuery.trim() || null), DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery, isOpen, runSearch])

  // Закрытие по клику снаружи
  useEffect(() => {
    function handleClickOutside(e) {
      if (listRef.current?.contains(e.target) || inputRef.current?.contains(e.target)) return
      setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    setHighlightedIndex(0)
  }, [list.length, searchQuery])

  const closeDropdown = () => {
    setIsOpen(false)
    setSearchQuery('')
    setHighlightedIndex(0)
  }

  const handleInputChange = (e) => {
    const v = e.target.value
    setSearchQuery(v)
    if (authorId) {
      onChange('')
      setSelectedAuthor(null)
    }
    setIsOpen(true)
  }

  const handleFocus = () => setIsOpen(true)

  const handleSelect = (author) => {
    setSelectedAuthor(author)
    onChange(String(author.id))
    closeDropdown()
    inputRef.current?.blur()
  }

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === 'ArrowDown') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      closeDropdown()
      inputRef.current?.blur()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => (i < list.length - 1 ? i + 1 : i))
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => (i > 0 ? i - 1 : 0))
      return
    }
    if (e.key === 'Enter' && list.length > 0) {
      e.preventDefault()
      handleSelect(list[highlightedIndex])
      return
    }
  }

  useEffect(() => {
    if (!isOpen || highlightedIndex < 0) return
    listRef.current?.children[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
  }, [highlightedIndex, isOpen])

  return (
    <div className="author-search-select" style={{ position: 'relative' }}>
      <input
        ref={inputRef}
        type="text"
        id={id}
        autoComplete="off"
        value={displayValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={isOpen ? `${id}-listbox` : undefined}
        role="combobox"
        aria-activedescendant={isOpen && list[highlightedIndex] ? `${id}-opt-${list[highlightedIndex].id}` : undefined}
        aria-busy={loading}
      />
      {isOpen && (
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          className="author-search-select-list"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '100%',
            margin: 0,
            marginTop: '2px',
            padding: 0,
            listStyle: 'none',
            maxHeight: '220px',
            overflowY: 'auto',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(61, 53, 32, 0.15)',
            zIndex: 10,
          }}
        >
          {loading ? (
            <li style={{ padding: '0.6rem 0.75rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              Поиск...
            </li>
          ) : list.length === 0 ? (
            <li style={{ padding: '0.6rem 0.75rem', color: 'var(--muted)', fontSize: '0.9rem' }}>
              {searchQuery.trim() ? 'Ничего не найдено' : 'Введите имя для поиска'}
            </li>
          ) : (
            list.map((a, i) => (
              <li
                key={a.id}
                id={`${id}-opt-${a.id}`}
                role="option"
                aria-selected={String(a.id) === String(authorId)}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  background: i === highlightedIndex ? 'var(--accent)' : 'transparent',
                  color: i === highlightedIndex ? 'var(--text)' : 'inherit',
                }}
                onMouseEnter={() => setHighlightedIndex(i)}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(a)
                }}
              >
                {a.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  )
}
