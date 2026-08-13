import StatCard from '../components/StatCard'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import Icon from '../components/Icon'
import { rootCauses, surgeries, otUtilization } from '../data/mockData'

const delayed = surgeries.filter((s) => s.delayMinutes > 0)
const totalDelay = delayed.reduce((sum, s) => sum + s.delayMinutes, 0)
const onTimePct = Math.round(((surgeries.length - delayed.length) / surgeries.length) * 100)
const avgDelay = Math.round(totalDelay / surgeries.length)

const delayByRoom = otUtilization.map((r) => {
  const roomCases = surgeries.filter((s) => s.otRoom === r.room)
  const roomDelay = roomCases.reduce((sum, s) => sum + s.delayMinutes, 0)
  return { ...r, cases: roomCases.length, delay: roomDelay }
})
const maxDelay = Math.max(...delayByRoom.map((r) => r.delay), 1)

export default function Analytics() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Delay Analytics"
        subtitle="Root-cause breakdown of today's late starts, by cause and OT"
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            <Icon name="calendar" className="h-3.5 w-3.5" />
            Thu 13 Aug 2026
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="activity"
          label="Started On Time"
          value={`${onTimePct}%`}
          sub={`${surgeries.length - delayed.length} of ${surgeries.length} cases`}
          trend={onTimePct >= 70 ? 'healthy' : 'warn'}
          tone={onTimePct >= 70 ? 'good' : 'warn'}
        />
        <StatCard
          icon="clock"
          label="Avg Start Delay"
          value={`${avgDelay} min`}
          sub={`${totalDelay} min lost today`}
          trend="+6 min vs week"
          tone="bad"
        />
        <StatCard
          icon="alert"
          label="Delayed Cases"
          value={String(delayed.length)}
          sub="at or after scheduled start"
          trend="needs action"
          tone="warn"
        />
        <StatCard
          icon="chart"
          label="Top Root Cause"
          value={rootCauses[0].cause}
          sub={`${rootCauses[0].value}% of delays`}
          trend="contributor"
          tone="neutral"
        />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Delay by Root Cause"
          subtitle="Auto-classified by the delay engine"
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
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
            {rootCauses[0].cause} and CSSD cover {rootCauses[0].value + rootCauses[1].value}%
            of today's delays — both are coordination, not capacity, issues.
          </p>
        </SectionCard>

        <SectionCard title="Delay by OT Room" subtitle="Lost minutes per theatre">
          <ul className="space-y-4">
            {delayByRoom.map((r) => (
              <li key={r.room}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">
                    {r.room}
                    <span className="ml-2 text-xs text-slate-400">
                      {r.cases} cases · {r.utilization}% util
                    </span>
                  </span>
                  <span className={`font-semibold ${r.delay ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {r.delay ? `+${r.delay} min` : 'On time'}
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${r.delay ? r.color : 'bg-emerald-500'}`}
                    style={{ width: `${Math.max((r.delay / maxDelay) * 100, 4)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>

      <div className="mt-4">
        <SectionCard title="Per-Case Delay Register" subtitle="Every late start this morning">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-4 font-medium">Case</th>
                  <th className="pb-3 pr-4 font-medium">Procedure</th>
                  <th className="pb-3 pr-4 font-medium">Surgeon</th>
                  <th className="pb-3 pr-4 font-medium">OT / Time</th>
                  <th className="pb-3 pr-4 font-medium">Delay</th>
                  <th className="pb-3 font-medium">Root Cause</th>
                </tr>
              </thead>
              <tbody>
                {delayed
                  .slice()
                  .sort((a, b) => b.delayMinutes - a.delayMinutes)
                  .map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="py-3.5 pr-4">
                        <p className="font-semibold text-slate-800">{s.id}</p>
                      </td>
                      <td className="py-3.5 pr-4 text-slate-600">{s.procedure}</td>
                      <td className="py-3.5 pr-4 text-slate-600">{s.surgeon}</td>
                      <td className="py-3.5 pr-4">
                        <span className="font-medium text-slate-700">{s.otRoom}</span>
                        <span className="ml-1.5 text-xs text-slate-500">{s.time}</span>
                      </td>
                      <td className="py-3.5 pr-4">
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-600/20">
                          +{s.delayMinutes} min
                        </span>
                      </td>
                      <td className="py-3.5 text-slate-600">{s.phase}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
            Out of {surgeries.length} cases, {surgeries.length - delayed.length} started on time
            today. Estimated recoverable time with top-down coordination:{' '}
            <span className="font-semibold text-slate-700">{totalDelay} min</span>.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}