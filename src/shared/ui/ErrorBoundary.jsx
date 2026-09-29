import { Component } from 'react'

/**
 * Top-level error boundary.
 *
 * A render error inside any route would otherwise unmount the whole tree and
 * leave the visitor on a blank white page. This keeps the failure contained,
 * shows something actionable, and logs the real error for monitoring.
 *
 * A class is required here — there is no hook equivalent of
 * `componentDidCatch`.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error('Unhandled render error:', error, info.componentStack)
    }
    // In production this is where you would forward to Sentry, etc.
  }

  render() {
    const { error } = this.state

    if (!error) return this.props.children

    return (
      <div className="container empty-state" role="alert">
        <h1>Something went wrong</h1>
        <p>The page failed to render. Reloading usually clears it.</p>
        <pre className="error-detail">{String(error.message || error)}</pre>
        <button type="button" className="btn btn--primary" onClick={() => window.location.reload()}>
          Reload page
        </button>
      </div>
    )
  }
}