import StatCard from '../components/StatCard'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { loadAlerts, useSupabaseData } from '../lib/supabaseData'

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

function AlertCard({ alert }) {
  return (
    <li
      className={`rounded-xl border-l-4 bg-white p-3.5 shadow-sm ring-1 ring-slate-200/70 ${severityStyle[alert.severity]}`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${severityIconColor[alert.severity]}`}
        >
          <Icon name={severityIcon[alert.severity]} className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-800">
              {alert.type} · {alert.caseId}
            </p>
            <span className="shrink-0 text-[11px] text-slate-400">{alert.time}</span>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{alert.message}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              <Icon name="user" className="h-3 w-3" />
              {alert.responsible}
            </span>
            <span className="rounded-md bg-slate-900 px-2 py-1 text-[11px] font-medium text-white">
              Why? {alert.rootCause}
            </span>
          </div>
        </div>
      </div>
    </li>
  )
}

export default function Alerts() {
  const { data } = useSupabaseData(loadAlerts)
  const alerts = data?.alerts || []
  const live = data?.live ?? false

  const activeAlerts = alerts.filter((a) => a.status === 'active')
  const resolvedAlerts = alerts.filter((a) => a.status !== 'active')
  const criticalCount = activeAlerts.filter((a) => a.severity === 'critical').length
  const warningCount = activeAlerts.filter((a) => a.severity === 'warning').length

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Intelligent Alerts"
        subtitle="Auto-detected from workflow data across ward, prep, OT and CSSD"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-3.5 py-1.5 text-xs font-medium text-white">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-400" />
            {activeAlerts.length} {live ? 'LIVE' : 'mock'}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="alert"
          label="Active Alerts"
          value={String(activeAlerts.length)}
          sub="auto-flagged right now"
          trend="monitoring"
          tone="neutral"
        />
        <StatCard
          icon="alert"
          label="Critical"
          value={String(criticalCount)}
          sub="starts blocked upstream"
          trend={criticalCount ? 'needs action' : 'clear'}
          tone={criticalCount ? 'bad' : 'good'}
        />
        <StatCard
          icon="bell"
          label="Warnings"
          value={String(warningCount)}
          sub="at-risk of running late"
          trend="watch list"
          tone="warn"
        />
        <StatCard
          icon="check"
          label="Resolved"
          value={String(resolvedAlerts.length)}
          sub="closed automatically"
          trend="clean"
          tone="good"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <SectionCard
            title="Active Feed"
            subtitle="Highest severity first, ordered by recency"
          >
            <ul className="space-y-3">
              {activeAlerts.map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
              {activeAlerts.length === 0 && (
                <li className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                  No active alerts. All clear on the floor.
                </li>
              )}
            </ul>
          </SectionCard>
        </div>

        <div className="lg:col-span-2">
          <SectionCard title="Resolved" subtitle="Cleared automatically this shift">
            <ul className="space-y-3">
              {resolvedAlerts.map((a) => (
                <AlertCard key={a.id} alert={a} />
              ))}
              {resolvedAlerts.length === 0 && (
                <li className="rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                  Nothing cleared yet this shift.
                </li>
              )}
            </ul>
          </SectionCard>
        </div>
      </div>
    </div>
  )
}