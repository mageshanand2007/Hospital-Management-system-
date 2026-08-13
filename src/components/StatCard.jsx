import Icon from './Icon'

const trendStyles = {
  good: 'text-emerald-600',
  bad: 'text-rose-600',
  warn: 'text-amber-600',
  neutral: 'text-slate-500',
}

export default function StatCard({ icon, label, value, sub, trend, tone = 'neutral' }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
          <Icon name={icon} className="h-5 w-5" />
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-1 text-[11px] font-medium ${trendStyles[tone]}`}
        >
          {trend}
        </span>
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs text-slate-500">{sub}</p>
    </div>
  )
}