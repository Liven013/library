import { useState, useEffect, useCallback } from 'react'

/**
 * Универсальный хук для страницы списка с одним полем (имя): загрузка, пагинация, создание/редактирование/удаление в модалке.
 */
export function useSimpleList({ listApi, itemsKey, createApi, updateApi, deleteApi, deleteConfirm = 'Удалить?' }) {
  const [data, setData] = useState({ items: [], pagination: { current_page: 1, total_pages: 1 } })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [name, setName] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    listApi({ page, per_page: 10 })
      .then((res) =>
        setData({
          items: res[itemsKey] ?? [],
          pagination: res.pagination ?? { current_page: 1, total_pages: 1 },
        })
      )
      .catch((e) => setError(e.message || 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [page, listApi, itemsKey])

  useEffect(() => {
    load()
  }, [load])

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
