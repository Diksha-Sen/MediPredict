/**
 * TagInput — reusable chip/tag selector component.
 *
 * Props:
 *   label       string
 *   options     string[]   — full list of available options
 *   selected    string[]   — currently selected values
 *   onChange    (string[]) => void
 *   placeholder string
 *   max?        number     — max selections allowed
 */
import { useState, useRef } from 'react'
import { X } from 'lucide-react'

export default function TagInput({ label, options = [], selected = [], onChange, placeholder = 'Search and select…', max }) {
  const [search,   setSearch]   = useState('')
  const [open,     setOpen]     = useState(false)
  const inputRef = useRef()

  const filtered = options.filter(
    o => o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o)
  ).slice(0, 10)

  const add = (val) => {
    if (max && selected.length >= max) return
    onChange([...selected, val])
    setSearch('')
    setOpen(false)
    inputRef.current?.focus()
  }

  const remove = (val) => onChange(selected.filter(s => s !== val))

  return (
    <div>
      {label && <label className="block text-sm font-medium mb-2 text-slate-700">{label}</label>}

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {selected.map(s => (
            <span key={s} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background:'#2563eb15', color:'#2563eb', border:'1px solid #2563eb30' }}>
              {s}
              <button type="button" onClick={() => remove(s)}
                className="hover:opacity-70 transition flex-shrink-0">
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <input ref={inputRef} type="text" value={search} autoComplete="off"
          onChange={e => { setSearch(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={max && selected.length >= max ? `Max ${max} selected` : placeholder}
          disabled={!!(max && selected.length >= max)}
          className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {open && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-lg z-50 max-h-48 overflow-y-auto">
            {filtered.map(o => (
              <div key={o} onMouseDown={() => add(o)}
                className="px-4 py-2 text-sm text-slate-700 cursor-pointer hover:bg-blue-50 transition">
                + {o}
              </div>
            ))}
          </div>
        )}

        {open && search && filtered.length === 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-surface-200 rounded-xl shadow-sm z-50 px-4 py-3 text-sm text-slate-400">
            No matches found
          </div>
        )}
      </div>
    </div>
  )
}
