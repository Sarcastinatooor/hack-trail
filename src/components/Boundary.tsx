"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"

interface Props {
  children: ReactNode
  label?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class Boundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[Boundary: ${this.props.label}]`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="neon-card-static p-5 border-l-2 border-l-[#ff2255]">
          <div className="flex items-center gap-2 mb-2">
            <span className="mono text-[10px] text-[#ff2255] uppercase tracking-wider">
              ● Error
            </span>
            {this.props.label && (
              <span className="mono text-[10px] text-neutral-600">
                {this.props.label}
              </span>
            )}
          </div>
          <div className="mono text-xs text-neutral-400 mb-3">
            {this.state.error?.message ?? "An unexpected error occurred"}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mono text-[10px] px-3 py-1.5 rounded border border-[#00ff88]/20 bg-[#00ff88]/5 text-[#00ff88] hover:bg-[#00ff88]/10 transition-colors"
          >
            RETRY →
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
