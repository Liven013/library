import { useState, useEffect } from 'react'
import { IconSearch } from './Icons'
import { IconChevronDown } from './Icons'
import { listAllTags } from '../api/tags'

export default function BooksSidebar({ searchQuery, onSearchChange, onSubmitSearch, selectedTagIds, onTagToggle }) {
  const [tagsOpen, setTagsOpen] = useState(false)
  const [genresOpen, setGenresOpen] = useState(false)
  const [tags, setTags] = useState([])
  const [tagsLoading, setTagsLoading] = useState(false)

  useEffect(() => {
    if (tagsOpen && tags.length === 0) {
      setTagsLoading(true)
      listAllTags()
        .then((list) => setTags(Array.isArray(list) ? list : []))
        .catch(() => setTags([]))
        .finally(() => setTagsLoading(false))
    }
  }, [tagsOpen])

  const hasSearchText = searchQuery.trim().length > 0

  return (
    <aside className="books-sidebar">
      <h2 className="books-sidebar-title">КНИГИ</h2>
      <div className="books-sidebar-search-wrap">
        <span className="books-sidebar-search-icon" aria-hidden>
          <IconSearch />
        </span>
        <input
          type="search"
          className="books-sidebar-search-input"
          placeholder="Введите текст..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSubmitSearch()}
          aria-label="Поиск книг"
        />
        {hasSearchText && (
          <button
            type="button"
            className="books-sidebar-search-submit"
            onClick={onSubmitSearch}
            title="Искать"
          >
            Искать
          </button>
        )}
      </div>

      <div className="books-sidebar-section">
        <button
          type="button"
          className="books-sidebar-section-head"
          onClick={() => setGenresOpen((o) => !o)}
          aria-expanded={genresOpen}
        >
          <span>Жанры</span>
          <IconChevronDown open={genresOpen} />
        </button>
        {genresOpen && (
          <ul className="books-sidebar-list">
            <li className="books-sidebar-list-empty">Пока нет жанров</li>
          </ul>
        )}
      </div>

      <div className="books-sidebar-section">
        <button
          type="button"
          className="books-sidebar-section-head"
          onClick={() => setTagsOpen((o) => !o)}
          aria-expanded={tagsOpen}
        >
          <span>Тэги</span>
          <IconChevronDown open={tagsOpen} />
        </button>
        {tagsOpen && (
          <ul className="books-sidebar-list">
            {tagsLoading ? (
              <li className="books-sidebar-list-empty">Загрузка...</li>
            ) : tags.length === 0 ? (
              <li className="books-sidebar-list-empty">Нет тэгов</li>
            ) : (
              tags.map((tag) => (
                <li key={tag.id}>
                  <label className="books-sidebar-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTagIds.includes(tag.id)}
                      onChange={() => onTagToggle(tag.id)}
                    />
                    <span>{tag.name || tag.title || `#${tag.id}`}</span>
                  </label>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </aside>
  )
}
