import { useState, useEffect, useCallback, useRef } from 'react'

const SEARCH_DEBOUNCE_MS = 350

/**
 * Универсальный хук для страницы списка с одним полем (имя): загрузка, пагинация, создание/редактирование/удаление в модалке.
 * Поиск выполняется фоново с debounce, не сбивая ввод.
 */
export function useSimpleList({ listApi, itemsKey, createApi, updateApi, deleteApi, deleteConfirm = 'Удалить?' }) {
  const [data, setData] = useState({ items: [], pagination: { current_page: 1, total_pages: 1 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [name, setName] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery)
      setPage(1)
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    const params = { page, per_page: 10 }
    if (debouncedSearch.trim()) params.q = debouncedSearch.trim()
    listApi(params)
      .then((res) =>
        setData({
          items: res[itemsKey] ?? [],
          pagination: res.pagination ?? { current_page: 1, total_pages: 1 },
        })
      )
      .catch((e) => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, listApi, itemsKey])

  useEffect(() => {
    load()
  }, [load])

  const setSearchQueryAndResetPage = useCallback((v) => {
    setSearchQuery(v)
    setPage(1)
  }, [])

  const openCreate = () => {
    setEditingItem(null)
    setName('')
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingItem(item)
    setName(item.name ?? '')
    setModalOpen(true)
  }

  const closeModal = () => {
    if (!submitLoading) setModalOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    setSubmitLoading(true)
    const promise = editingItem
      ? updateApi(editingItem.id, { name: trimmed })
      : createApi({ name: trimmed })
    promise
      .then(() => {
        setModalOpen(false)
        load()
      })
      .catch((err) => alert(err.message || 'Ошибка сохранения'))
      .finally(() => setSubmitLoading(false))
  }

  const handleDelete = (id) => {
    if (!confirm(deleteConfirm)) return
    deleteApi(id)
      .then(() => setData((prev) => ({ ...prev, items: prev.items.filter((i) => i.id !== id) })))
      .catch((e) => alert(e.message || 'Ошибка удаления'))
  }

  return {
    data,
    loading,
    error,
    page,
    setPage,
    searchQuery,
    setSearchQuery: setSearchQueryAndResetPage,
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
  }
}
