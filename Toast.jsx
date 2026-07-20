import { useApp } from '../context/AppContext.jsx'

const colorMap = {
  success: 'bg-accent-green',
  error: 'bg-accent-red',
  info: 'bg-brand-600',
}

export default function ToastContainer() {
  const { toasts } = useApp()
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${colorMap[t.type] || colorMap.info} text-white px-5 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in max-w-sm`}
        >
          {t.msg}
        </div>
      ))}
    </div>
  )
}
