import { useEffect, useState } from 'react'
import StatCard from '../components/StatCard'
import SectionCard from '../components/SectionCard'
import PageHeader from '../components/PageHeader'
import Toast from '../components/Toast'
import AddCssdInstrumentModal from '../components/forms/AddCssdInstrumentModal'
import {
  loadCssdInstruments,
  loadFormOptions,
  useSupabaseData,
  subscribeToTable,
} from '../lib/supabaseData'

const trayStyles = {
  released: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  sterilizing: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  assembling: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  blocked: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  delayed: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const trayDots = {
  released: 'bg-emerald-500',
  sterilizing: 'bg-amber-500',
  assembling: 'bg-sky-500',
  blocked: 'bg-rose-500',
  delayed: 'bg-rose-500',
}

const trayLabels = {
  released: 'Released',
  sterilizing: 'Sterilizing',
  assembling: 'Assembling',
  blocked: 'Blocked',
  delayed: 'Blocked',
}

function TrayStatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${trayStyles[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${trayDots[status] || trayDots.released}`}
      />
      {trayLabels[status] || status}
    </span>
  )
}

export default function CssdInstruments() {
  const { data, refresh } = useSupabaseData(loadCssdInstruments)
  const form = useSupabaseData(loadFormOptions)
  const [toast, setToast] = useState(null)
  const [showAdd, setShowAdd] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToTable('cssd_instruments', () => refresh())
    return unsubscribe
  }, [refresh])

  const rows = data?.rows || []
  const live = data?.live ?? false

  const released = rows.filter((t) => t.status === 'released').length
  const sterilizing = rows.filter((t) => t.status === 'sterilizing').length
  const assembling = rows.filter((t) => t.status === 'assembling').length
  const delayed = rows.filter(
    (t) => t.status === 'blocked' || t.status === 'delayed',
  ).length
  const totalInstruments = rows.reduce((sum, t) => sum + (t.qty || 0), 0)
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <PageHeader
        title="CSSD Instruments"
        subtitle="Sterile tray tracking across wash, assembly and sterilization"
        action={
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {live ? 'Cycle monitor live' : 'Mock data'}
            </span>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              disabled={!live}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              title="Add a new CSSD instrument pack"
            >
              <span className="text-sm leading-none">+</span>
              Add Instrument
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="check"
          label="Trays Released"
          value={String(released)}
          sub={`${totalInstruments} instruments prepped`}
          trend="on time"
          tone="good"
        />
        <StatCard
          icon="refresh"
          label="In Sterilization"
          value={String(sterilizing)}
          sub="autoclave cycles running"
          trend="eta ~11:10"
          tone="neutral"
        />
        <StatCard
          icon="package"
          label="Under Assembly"
          value={String(assembling)}
          sub="picking & wrapping in progress"
          trend="tracking"
          tone="neutral"
        />
        <StatCard
          icon="alert"
          label="Blocked Trays"
          value={String(delayed)}
          sub="holding up OT starts"
          trend={delayed ? 'needs action' : 'clear'}
          tone={delayed ? 'bad' : 'good'}
        />
      </div>

      <div className="mt-4">
        <SectionCard
          title="Tray Tracking Board"
          subtitle="Every packet tied to its scheduled case"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-400">
                  <th className="pb-3 pr-4 font-medium">Tray</th>
                  <th className="pb-3 pr-4 font-medium">Instrument Set</th>
                  <th className="pb-3 pr-4 font-medium">Qty</th>
                  <th className="pb-3 pr-4 font-medium">For Case</th>
                  <th className="pb-3 pr-4 font-medium">Last Activity</th>
                  <th className="pb-3 pr-4 font-medium">Next Use</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="py-3.5 pr-4">
                      <p className="font-semibold text-slate-800">{t.id}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600">{t.instrumentSet}</td>
                    <td className="py-3.5 pr-4 font-medium text-slate-700">
                      {t.qty}
                    </td>
                    <td className="py-3.5 pr-4">
                      <p className="font-medium text-slate-700">{t.caseId}</p>
                      <p className="text-xs text-slate-500">{t.procedure}</p>
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-500">
                      {t.lastAction}
                    </td>
                    <td className="py-3.5 pr-4 text-xs text-slate-500">{t.nextUse}</td>
                    <td className="py-3.5">
                      <TrayStatusPill status={t.status} />
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan="7"
                      className="py-8 text-center text-sm text-slate-400"
                    >
                      No instrument packs yet.
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
      <AddCssdInstrumentModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={refresh}
        onResult={(type, message) => setToast({ type, message })}
        surgeries={form.data?.surgeries}
        theatres={form.data?.theatres}
        rows={rows}
      />

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <SectionCard title="Cycle Throughput" subtitle="Trays per stage today">
          <ul className="space-y-4">
            {[
              { label: 'Wash & decontaminate', value: 9, color: 'bg-sky-500' },
              { label: 'Assembly & wrap', value: assembling, color: 'bg-teal-500' },
              { label: 'Sterilization (dry)', value: sterilizing, color: 'bg-amber-500' },
              { label: 'Released to OT', value: released, color: 'bg-emerald-500' },
            ].map((c) => (
              <li key={c.label}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700">{c.label}</span>
                  <span className="font-semibold text-slate-900">{c.value}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full rounded-full ${c.color}`}
                    style={{ width: `${Math.min((c.value / 10) * 100, 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title="Loaded Equipment" subtitle="Tracked in real time">
          <ul className="space-y-3">
            {[
              { label: 'Instruments tracked', value: `${totalInstruments}` },
              { label: 'Uniquely tagged sets', value: '48' },
              { label: 'Autoclaves online', value: '3 / 3' },
              { label: 'Barcode scans today', value: '236' },
            ].map((row) => (
              <li
                key={row.label}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm"
              >
                <span className="text-slate-600">{row.label}</span>
                <span className="font-semibold text-slate-900">{row.value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
            Tray #T-204 for Total Knee Replacement is holding OT-2 — CSSD and
            OT coordination is being escalated.
          </p>
        </SectionCard>
      </div>
    </div>
  )
}