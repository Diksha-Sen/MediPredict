/**
 * StatCard — numeric KPI tile used on both dashboards.
 *
 * <StatCard value={12} label="Predictions" color="#2563eb" delay={0.1} />
 */
export default function StatCard({ value, label, color = '#2563eb', icon, delay = 0 }) {
  return (
    <div
      className="p-5 rounded-xl bg-white shadow-sm animate-fade-in"
      style={{ animationDelay: `${delay}s` }}
    >
      {icon && <div className="text-2xl mb-2">{icon}</div>}
      <div className="text-3xl font-bold font-display" style={{ color }}>{value}</div>
      <div className="text-sm mt-1 text-slate-400">{label}</div>
    </div>
  )
}
