import SectionCard from './SectionCard'
import Icon from './Icon'
import { alerts as fallback } from '../data/mockData'

const severityStyle = {
  critical: 'border-l-rose-500 bg-rose-50/60',
  warning: 'border-l-amber-500 bg-amber-50/50',
  info: 'border-l-sky-500 bg-sky-50/50',
}

const severityIcon = {
  critical: 'alert',
  warning: 'alert',
  info: 'bell',
}

const severityIconColor = {
  critical: 'bg-rose-100 text-rose-600',
  warning: 'bg-amber-100 text-amber-600',
  info: 'bg-sky-100 text-sky-600',
}

export default function AlertFeed({ alerts = fallback }) {
  const active = alerts.filter((a) => a.status === 'active')
  return (
    <SectionCard
      title="Intelligent Alerts"
      subtitle={`${active.length} active · auto-detected from workflow data`}
      action={
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-white">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
          LIVE
        </span>
      }
    >
      <ul className="space-y-3">
        {alerts
          .filter((a) => a.status === 'active')
          .map((a) => (
            <li
              key={a.id}
              className={`rounded-xl border-l-4 bg-white p-3.5 shadow-sm ring-1 ring-slate-200/70 ${severityStyle[a.severity]}`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${severityIconColor[a.severity]}`}
                >
                  <Icon name={severityIcon[a.severity]} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">
                      {a.type} · {a.caseId}
                    </p>
                    <span className="shrink-0 text-[11px] text-slate-400">
                      {a.time}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">
                    {a.message}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
                      <Icon name="user" className="h-3 w-3" />
                      {a.responsible}
                    </span>
                    <span className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white">
                      Why? {a.rootCause}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
      </ul>
    </SectionCard>
  )
}