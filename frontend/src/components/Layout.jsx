import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NARROW_WIDTH = 640
const nav = [
  { to: '/books', label: 'Книги' },
  { to: '/authors', label: 'Авторы' },
  { to: '/cabinets', label: 'Шкаф' },
  { to: '/tags', label: 'Теги' },
]

function isActive(pathname, to) {
  if (to === '/books') return pathname === '/' || pathname.startsWith('/books')
  return pathname === to || pathname.startsWith(to + '/')
}

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.innerWidth <= NARROW_WIDTH)

  useEffect(() => {
    const onResize = () => setNarrow(window.innerWidth <= NARROW_WIDTH)
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  return (
    <div style={styles.wrapper} className={narrow ? 'layout-narrow' : ''}>
      <header style={styles.header}>
        <Link to="/books" style={styles.logo}>Библиотека</Link>
        <nav style={styles.nav}>
          {nav.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              style={{ ...styles.navLink, ...(isActive(pathname, to) ? styles.navLinkActive : {}) }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </header>
      <main style={styles.main}>{children}</main>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    paddingLeft: '1rem',
    paddingRight: '1rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
    padding: '1rem 0.5rem',
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    borderLeft: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    width: '100%',
  },
  logo: {
    fontSize: '1.25rem',
    fontWeight: 600,
    color: 'var(--text)',
    textDecoration: 'none',
  },
  nav: {
    display: 'flex',
    gap: '0.5rem',
  },
  navLink: {
    padding: '0.5rem 0.75rem',
    borderRadius: '6px',
    color: 'var(--muted)',
    textDecoration: 'none',
  },
  navLinkActive: {
    color: 'var(--accent)',
    background: 'rgba(189, 183, 107, 0.35)',
  },
  main: {
    flex: 1,
    padding: '1.5rem',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
}
