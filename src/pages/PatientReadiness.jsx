import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import Toast from '../components/Toast'
import UpdateReadinessModal from '../components/forms/UpdateReadinessModal'
import {
  loadReadiness,
  useSupabaseData,
  subscribeToTable,
} from '../lib/supabaseData'

const readinessStyles = {
  ready: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  blocked: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const readinessLabels = {
  ready: 'Ready',
  pending: 'In Prep',
  blocked: 'Not Ready',
}

const readinessDots = {
  ready: 'bg-emerald-500',
  pending: 'bg-amber-500',
  blocked: 'bg-rose-500',
}

function ReadinessPill({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${readinessStyles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${readinessDots[status]}`}
      />
      {readinessLabels[status]}
    </span>
  )
}

export default function PatientReadiness() {
  const { data, refresh } = useSupabaseData(loadReadiness)
  const [toast, setToast] = useState(null)
  const [selected, setSelected] = useState(null)
  const rows = data?.rows || []
  const live = data?.live ?? false

  useEffect(() => {
    const unsubscribe = subscribeToTable('patient_readiness', () => refresh())
    return unsubscribe
  }, [refresh])

  const readyCount = rows.filter((r) => r.readiness === 'ready').length
  const pendingCount = rows.filter((r) => r.readiness === 'pending').length
  const blockedCount = rows.filter((r) => r.readiness === 'blocked').length
  const readyPct = rows.length ? Math.round((readyCount / rows.length) * 100) : 0

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="Patient Readiness"
        subtitle="Prep status for every scheduled case — ward, consent and pre-op"
        action={
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {live ? 'Supabase live' : 'Mock data'}
          </span>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="users"
          label="Patients Ready"
          value={rows.length ? `${readyCount} of ${rows.length}` : '—'}
          sub={`${readyPct}% ready on time`}
          trend={readyPct >= 60 ? 'healthy' : 'warn'}
          tone={readyPct >= 60 ? 'good' : 'warn'}
        />
        <StatCard
          icon="user"
          label="In Preparation"
          value={String(pendingCount)}
          sub="Ward or pre-op in progress"
          trend="tracking"
          tone="neutral"
        />
        <StatCard
          icon="alert"
          label="Not Ready"
          value={String(blockedCount)}
          sub="Consent, pre-anesthesia or transfer pending"
          trend={blockedCount ? 'needs action' : 'clear'}
          tone={blockedCount ? 'bad' : 'good'}
        />
        <StatCard
          icon="clock"
          label="Avg Prep Time"
          value="22 min"
          sub="target is under 30 min"
          trend="-4 min"
          tone="good"
        />
      </div>

      <div className="mt-4">
        <SectionCard
          title="Patient Readiness Board"
          subtitle="Ready list for every case today"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-4 font-medium">Case</th>
                  <th className="pb-3 pr-4 font-medium">Patient</th>
                  <th className="pb-3 pr-4 font-medium">Procedure</th>
                  <th className="pb-3 pr-4 font-medium">Current Phase</th>
                  <th className="pb-3 pr-4 font-medium">Responsible</th>
                  <th className="pb-3 pr-4 font-medium">Readiness</th>
                  <th className="pb-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s) => (
                  <tr
                    key={s.readinessId || s.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-slate-800">{s.id}</p>
                      <p className="text-xs text-slate-500">{s.otRoom} · {s.time}</p>
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="font-medium text-slate-700">{s.patient}</p>
                      <p className="text-xs text-slate-500">{s.age} yrs</p>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">{s.procedure}</td>
                    <td className="py-3.5 pr-4 text-slate-600">{s.phase}</td>
                    <td className="py-3.5 pr-4 text-xs text-slate-500">
                      {s.responsible}
                    </td>
                    <td className="py-3.5 pr-4">
                      <ReadinessPill status={s.readiness} />
                    </td>
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() => setSelected(s)}
                        disabled={!live}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Update readiness fields"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-8 text-center text-sm text-slate-400"
                    >
                      No readiness records yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
      <UpdateReadinessModal
        open={!!selected}
        row={selected}
        onClose={() => setSelected(null)}
        onUpdated={refresh}
        onResult={(type, message) => setToast({ type, message })}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SectionCard title="Ward Assignments" subtitle="Patients by holding area">
          <ul className="space-y-3">
            {['Ward 2A', 'Ward 3A', 'Ward 3B', 'Ward 4A', 'ICU']
              .map((ward) => ({
                ward,
                count: rows.filter((r) =>
                  String(r.responsible).includes(ward),
                ).length,
              }))
              .map((w) => (
                <li
                  key={w.ward}
                  className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm"
                >
                  <span className="font-medium text-slate-700">{w.ward}</span>
                  <span className="text-xs text-slate-500">
                    {w.count} patient{w.count === 1 ? '' : 's'}
                  </span>
                </li>
              ))}
          </ul>
        </SectionCard>
        <SectionCard title="Prep Checklist Coverage" subtitle="Across all cases">
          <ul className="space-y-3">
            {[
              { label: 'Vitals documented', value: 88 },
              { label: 'Consent signed', value: 75 },
              { label: 'Pre-anesthesia cleared', value: 62 },
              { label: 'Patient at OT', value: 12 },
            ].map((c) => (
              <li key={c.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{c.label}</span>
                  <span className="font-semibold text-slate-900">{c.value}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${c.value >= 70 ? 'bg-emerald-500' : c.value >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                    style={{ width: `${c.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Status Legend">
          <ul className="space-y-3">
            {Object.keys(readinessLabels).map((k) => (
              <li key={k} className="flex items-center gap-3 text-sm">
                <ReadinessPill status={k} />
                <span className="text-slate-500">
                  {k === 'ready' && 'Patient cleared for OT'}
                  {k === 'pending' && 'Prep still in progress'}
                  {k === 'blocked' && 'Action needed before OT'}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
            Readiness is auto-derived from ward, consent, pre-anesthesia and
            transfer checklists synced from the EMR.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}