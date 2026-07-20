import { confidenceColor, confidenceLevel } from '../utils/prediction.js'

/**
 * ConfidenceBar — horizontal progress bar coloured by level.
 * <ConfidenceBar pct={78} level="moderate" />
 */
export function ConfidenceBar({ pct, level }) {
  const color = confidenceColor(level || confidenceLevel((pct || 0) / 100))
  return (
    <div className="confidence-bar" style={{ background: color + '22' }}>
      <div
        className="confidence-fill animate-progress"
        style={{ background: color, width: `${pct}%` }}
      />
    </div>
  )
}

/**
 * ConfidenceBadge — pill tag coloured by confidence level.
 * <ConfidenceBadge pct={84} />
 */
export function ConfidenceBadge({ pct, level }) {
  const lvl   = level || confidenceLevel((pct || 0) / 100)
  const color = confidenceColor(lvl)
  return (
    <span className="tag text-xs" style={{ background: color + '22', color }}>
      {pct}%
    </span>
  )
}

/**
 * StatusBadge — generic coloured pill for status strings.
 * <StatusBadge status="accepted" colorMap={{ accepted: '#059669' }} />
 */
export function StatusBadge({ status, colorMap = {} }) {
  const DEFAULTS = {
    pending:   '#d97706',
    accepted:  '#2563eb',
    rejected:  '#dc2626',
    completed: '#059669',
    confirmed: '#059669',
    verified:  '#059669',
  }
  const color = colorMap[status] || DEFAULTS[status] || '#64748b'
  return (
    <span className="tag text-xs" style={{ background: color + '22', color }}>
      {status}
    </span>
  )
}
