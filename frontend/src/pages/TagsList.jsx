import SimpleListPage from '../components/SimpleListPage'
import { listTags, createTag, updateTag, deleteTag } from '../api/tags'

export default function TagsList() {
  return (
    <SimpleListPage
      title="Теги"
      emptyMessage="Тегов пока нет. Добавьте теги для категоризации книг."
      addTitle="Добавить тег"
      editTitle="Редактировать тег"
      fieldLabel="Название"
      deleteConfirm="Удалить тег?"
      listApi={listTags}
      itemsKey="tags"
      createApi={createTag}
      updateApi={updateTag}
      deleteApi={deleteTag}
      renderItem={(tag) => <span className="tag-chip" style={{ fontSize: '0.9rem' }}>{tag.name}</span>}
    />
  )
}
