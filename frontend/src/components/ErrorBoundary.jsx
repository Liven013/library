import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '2rem', maxWidth: 600, margin: '0 auto' }}>
          <h1 style={{ color: 'var(--danger)', marginTop: 0 }}>Ошибка</h1>
          <p style={{ color: 'var(--text)' }}>{String(this.state.error?.message || this.state.error)}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => this.setState({ error: null })}
          >
            Закрыть
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
