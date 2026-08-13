import SectionCard from './SectionCard'
import { surgeries as fallback } from '../data/mockData'

const dotColor = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  delayed: 'bg-rose-500',
}

export default function SchedulePanel({ surgeries = fallback }) {
  return (
    <SectionCard
      title="Today's Schedule"
      subtitle="Next cases across all OTs"
      action={
        <span className="text-xs font-medium text-slate-500">As of 12:40</span>
      }
    >
      <ul className="divide-y divide-slate-100">
        {surgeries.map((s) => (
          <li key={s.id} className="flex items-center gap-3 py-2.5">
            <div className="flex w-14 flex-col items-center">
              <span className="text-sm font-semibold text-slate-800">
                {s.time}
              </span>
              <span
                className={`mt-1 h-1.5 w-1.5 rounded-full ${dotColor[s.status]}`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">
                {s.id} · {s.procedure}
              </p>
              <p className="text-xs text-slate-500">
                {s.patient} · {s.surgeon}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              {s.otRoom}
            </span>
          </li>
        ))}
      </ul>
    </SectionCard>
  )
}