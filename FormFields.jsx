export function InputField({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1 text-slate-700">{label}</label>}
      <input
        className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white"
        {...props}
      />
    </div>
  )
}

export function SelectField({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1 text-slate-700">{label}</label>}
      <select
        className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

export function TextareaField({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium mb-1 text-slate-700">{label}</label>}
      <textarea
        className="w-full px-4 py-3 rounded-xl border border-surface-200 text-sm text-slate-900 bg-white"
        {...props}
      />
    </div>
  )
}

export function PrimaryBtn({ children, className = '', ...props }) {
  return (
    <button
      className={`px-6 py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
