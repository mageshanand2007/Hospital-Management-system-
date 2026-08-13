import SectionCard from './SectionCard'
import StatusPill from './StatusPill'
import { surgeries as fallback } from '../data/mockData'

const barColor = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  delayed: 'bg-rose-500',
}

function ProgressBar({ value, status }) {
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full ${barColor[status] || 'bg-slate-400'}`}
        style={{ width: `${value}%` }}
      />
    </div>
  )
}

function DelayTag({ minutes }) {
  if (!minutes) {
    return <span className="text-xs font-medium text-emerald-600">On time</span>
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-600/20">
      +{minutes} min
    </span>
  )
}

export default function SurgeryBoard({ surgeries = fallback }) {
  return (
    <SectionCard
      title="Realtime Surgery Board"
      subtitle="Live status of today's surgical cases"
      className="lg:col-span-2"
      action={
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          View schedule
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
              <th className="pb-3 pr-4 font-medium">Case</th>
              <th className="pb-3 pr-4 font-medium">Patient</th>
              <th className="pb-3 pr-4 font-medium">Phase &amp; Progress</th>
              <th className="pb-3 pr-4 font-medium">OT / Time</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {surgeries.map((s) => (
              <tr
                key={s.id}
                className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
              >
                <td className="py-3.5 pr-4">
                  <p className="font-semibold text-slate-800">{s.id}</p>
                  <p className="text-xs text-slate-500">{s.procedure}</p>
                </td>
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-slate-700">{s.patient}</p>
                  <p className="text-xs text-slate-500">
                    {s.age} yrs · {s.surgeon}
                  </p>
                </td>
                <td className="py-3.5 pr-4 min-w-[160px]">
                  <p className="text-xs font-medium text-slate-600">
                    {s.phase}
                  </p>
                  <ProgressBar value={s.progress} status={s.status} />
                </td>
                <td className="py-3.5 pr-4">
                  <p className="font-medium text-slate-700">{s.otRoom}</p>
                  <p className="text-xs text-slate-500">{s.time} · {s.duration}m</p>
                </td>
                <td className="py-3.5">
                  <div className="flex flex-col items-start gap-2">
                    <StatusPill status={s.status} />
                    <DelayTag minutes={s.delayMinutes} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}