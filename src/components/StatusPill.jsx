const styles = {
  on_track: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  at_risk: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  delayed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  completed: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  resolved: 'bg-slate-100 text-slate-500 ring-slate-500/20',
}

const dotColors = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  delayed: 'bg-rose-500',
  completed: 'bg-sky-500',
  resolved: 'bg-slate-400',
}

const labels = {
  on_track: 'On Track',
  at_risk: 'At Risk',
  delayed: 'Delayed',
  completed: 'Completed',
  resolved: 'Resolved',
}

export default function StatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status] || styles.on_track}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${dotColors[status] || dotColors.on_track}`}
      />
      {labels[status] || status}
    </span>
  )
}