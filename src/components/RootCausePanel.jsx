import SectionCard from './SectionCard'
import Icon from './Icon'
import { rootCauses as fallback } from '../data/mockData'

export default function RootCausePanel({ rootCauses = fallback }) {
  return (
    <SectionCard
      title="Delay Root Causes"
      subtitle="Auto-classified by the delay engine"
      action={
        <Icon name="chart" className="h-4 w-4 text-slate-400" />
      }
    >
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {rootCauses.map((r) => (
          <div
            key={r.cause}
            className={r.color}
            style={{ width: `${r.value}%` }}
            title={`${r.cause}: ${r.value}%`}
          />
        ))}
      </div>
      <ul className="mt-4 space-y-2.5">
        {rootCauses.map((r) => (
          <li key={r.cause} className="flex items-center gap-2.5 text-sm">
            <span className={`h-2.5 w-2.5 shrink-0 rounded-sm ${r.color}`} />
            <span className="flex-1 text-slate-600">{r.cause}</span>
            <span className="font-semibold text-slate-800">{r.value}%</span>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}