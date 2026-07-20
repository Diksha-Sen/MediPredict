export function Spinner({ size = 24, color = '#2563eb' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

export function LoadingScreen({ message = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: '#f8fafc' }}>
      <Spinner size={40} />
      <p className="text-slate-400 text-sm">{message}</p>
    </div>
  )
}

export function ButtonSpinner() {
  return <Spinner size={16} color="currentColor" />
}
