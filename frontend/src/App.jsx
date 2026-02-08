import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import BooksList from './pages/BooksList'
import BookPage from './pages/BookPage'
import AuthorsList from './pages/AuthorsList'
import CabinetsPage from './pages/CabinetsPage'
import TagsList from './pages/TagsList'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<BooksList />} />
        <Route path="/books" element={<BooksList />} />
        <Route path="/books/:id" element={<BookPage />} />
        <Route path="/authors" element={<AuthorsList />} />
        <Route path="/cabinets" element={<CabinetsPage />} />
        <Route path="/tags" element={<TagsList />} />
      </Routes>
    </Layout>
  )
}
