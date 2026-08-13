import StatCard from '../components/StatCard'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import StatusPill from '../components/StatusPill'
import { surgeries } from '../data/mockData'

const sorted = surgeries.slice().sort((a, b) => a.time.localeCompare(b.time))

const dotColor = {
  on_track: 'bg-emerald-500',
  at_risk: 'bg-amber-500',
  delayed: 'bg-rose-500',
}

const totalCases = sorted.length
const inProgress = sorted.filter((s) => s.status !== 'on_track').length
const nextCase = sorted.find((s) => s.status === 'on_track') || sorted[0]

export default function SurgeryTimeline() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Surgery Timeline"
        subtitle="Chronological view of today's cases across all OTs"
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Now · 12:40
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="calendar"
          label="Cases Today"
          value={String(totalCases)}
          sub="across OT-1, OT-2, OT-3, OT-C"
          trend="full board"
          tone="neutral"
        />
        <StatCard
          icon="activity"
          label="In Progress"
          value={String(inProgress)}
          sub="at risk or delayed right now"
          trend={inProgress ? 'monitoring' : 'clear'}
          tone={inProgress ? 'warn' : 'good'}
        />
        <StatCard
          icon="check"
          label="On Time"
          value={String(sorted.filter((s) => s.status === 'on_track').length)}
          sub="running to schedule"
          trend="healthy"
          tone="good"
        />
        <StatCard
          icon="arrowRight"
          label="Next Up"
          value={nextCase ? `${nextCase.otRoom} · ${nextCase.time}` : '—'}
          sub={nextCase ? nextCase.patient : ''}
          trend="standby"
          tone="neutral"
        />
      </div>

      <div className="mt-4">
        <SectionCard
          title="Today's Case Timeline"
          subtitle="Oldest to newest — tap a stage to see the handoff owner"
        >
          <ol className="relative space-y-6 border-l border-slate-200 pl-6">
            {sorted.map((s) => (
              <li key={s.id} className="relative">
                  <span
                    className={`absolute -left-[31px] top-1.5 flex h-3 w-3 rounded-full ring-4 ring-white ${dotColor[s.status]}`}
                  />
                  <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-bold text-slate-900">{s.id}</p>
                        <span className="rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-medium text-white">
                          {s.otRoom}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {s.time} · {s.duration}m
                        </span>
                        <StatusPill status={s.status} />
                      </div>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {s.patient} · {s.procedure}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{s.surgeon}</p>
                    </div>
                    <div className="min-w-[200px] flex-1 sm:max-w-sm">
                      <div className="flex items-center justify-between text-[11px] font-medium text-slate-500">
                        <span>Prep</span>
                        <span className="text-slate-700">{s.phase}</span>
                        <span>In OT</span>
                      </div>
                      <div className="relative mt-1.5 h-1.5 w-full rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full ${dotColor[s.status]}`}
                          style={{ width: `${s.progress}%` }}
                        />
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Progress {s.progress}%</span>
                        <span className="text-slate-600">{s.responsible}</span>
                      </div>
                    </div>
                  </div>
                </li>
              )
            )}
          </ol>
        </SectionCard>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="Handoff Owners" subtitle="Who is accountable at each stage">
          <ul className="space-y-3">
            {[
              { label: 'Ward prep', owner: 'Nursing · Wards 2A-4A', pct: 62 },
              { label: 'Consent desk', owner: 'Front Desk · Maria', pct: 50 },
              { label: 'Pre-anesthesia', owner: 'Anesthesia · Dr. Thomas', pct: 45 },
              { label: 'CSSD release', owner: 'CSSD · Ms. Priya', pct: 58 },
            ].map((h) => (
              <li key={h.label} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="font-medium text-slate-700">{h.label}</p>
                  <p className="text-xs text-slate-500">{h.owner}</p>
                </div>
                <span className="font-semibold text-slate-900">{h.pct}%</span>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Handoff Rules" subtitle="How the timeline updates">
          <ul className="space-y-2.5 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              A case advances only when the next handoff confirms readiness.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              Delays are attributed to the owner of the current phase.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              Projected start times re-plan automatically on handoff delay.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
              OT turnover is folded into the gap between consecutive cases.
            </li>
          </ul>
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
            S-1109 (OT-2) is still blocked on CSSD tray T-204 — the timeline
            shows it holding the slot for the rest of the morning.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}