import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('MediPredict error boundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center" style={{ background: '#f8fafc' }}>
          <div className="text-5xl mb-6">⚠️</div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mb-3">Something went wrong</h1>
          <p className="text-slate-500 mb-6 max-w-md">
            An unexpected error occurred. This has been noted. Try refreshing the page.
          </p>
          <details className="text-xs text-slate-400 mb-6 max-w-lg text-left bg-white rounded-xl p-4 border border-surface-200">
            <summary className="cursor-pointer font-semibold mb-2">Error details</summary>
            <pre className="whitespace-pre-wrap">{String(this.state.error)}</pre>
          </details>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}
            className="px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:opacity-90 transition"
          >
            Go to Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
