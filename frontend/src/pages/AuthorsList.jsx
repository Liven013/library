import SimpleListPage from '../components/SimpleListPage'
import { listAuthors, createAuthor, updateAuthor, deleteAuthor } from '../api/authors'

export default function AuthorsList() {
  return (
    <SimpleListPage
      title="Авторы"
      emptyMessage="Авторов пока нет."
      addTitle="Добавить автора"
      editTitle="Редактировать автора"
      fieldLabel="Имя"
      deleteConfirm="Удалить автора?"
      listApi={listAuthors}
      itemsKey="authors"
      createApi={createAuthor}
      updateApi={updateAuthor}
      deleteApi={deleteAuthor}
    />
  )
}
