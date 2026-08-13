import { useEffect, useMemo, useState } from 'react'
import StatCard from '../components/StatCard'
import SurgeryBoard from '../components/SurgeryBoard'
import AlertFeed from '../components/AlertFeed'
import UtilizationPanel from '../components/UtilizationPanel'
import RootCausePanel from '../components/RootCausePanel'
import SchedulePanel from '../components/SchedulePanel'
import PatientsPanel from '../components/PatientsPanel'
import Icon from '../components/Icon'
import Toast from '../components/Toast'
import AddPatientModal from '../components/forms/AddPatientModal'
import ScheduleSurgeryModal from '../components/forms/ScheduleSurgeryModal'
import { kpis as fallbackKpis } from '../data/mockData'
import {
  loadControlTower,
  loadFormOptions,
  simulateDelay,
  resolveLatestDelay,
  subscribeToControlTower,
  subscribeToTable,
  useSupabaseData,
} from '../lib/supabaseData'

export default function Dashboard() {
  const { data, loading, refresh } = useSupabaseData(loadControlTower)
  const form = useSupabaseData(loadFormOptions)
  const formRefresh = form.refresh
  const [busy, setBusy] = useState(false)
  const [actionMsg, setActionMsg] = useState(null)
  const [toast, setToast] = useState(null)
  const [showAddPatient, setShowAddPatient] = useState(false)
  const [showSchedule, setShowSchedule] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToControlTower(() => refresh())
    return unsubscribe
  }, [refresh])

  useEffect(() => {
    const unsubscribe = subscribeToTable('patients', () => formRefresh())
    return unsubscribe
  }, [formRefresh])

  const nextTarget = useMemo(() => {
    const rows = data?.surgeries || []
    return (
      rows.find((s) => s.status === 'on_track' && !s.delayMinutes) ||
      rows.find((s) => s.status === 'scheduled') ||
      null
    )
  }, [data])

  const kpis = data?.kpis || fallbackKpis
  const live = data?.live ?? false

  async function run(action) {
    if (busy) return
    setBusy(true)
    setActionMsg(null)
    try {
      if (action === 'simulate') {
        if (!nextTarget) throw new Error('No upcoming on-track case to simulate')
        await simulateDelay(nextTarget.surgeryId)
        setActionMsg(`Delay simulated on ${nextTarget.id}`)
      } else if (action === 'resolve') {
        const result = await resolveLatestDelay()
        if (!result?.ok) setActionMsg(result?.reason || 'Nothing to resolve')
        else setActionMsg('Latest delay resolved')
      } else {
        setActionMsg('Refreshed')
      }
      refresh()
    } catch (error) {
      setActionMsg(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 sm:text-2xl">
            Operational Control Tower
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Thu 13 Aug 2026 · Coordinating Ward, Patient Prep, OT &amp; CSSD in
            real time
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {live ? 'Supabase live' : loading ? 'Connecting…' : 'Mock data'}
          </span>
          {actionMsg && (
            <span className="max-w-[180px] truncate text-xs font-medium text-slate-500">
              {actionMsg}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowAddPatient(true)}
            disabled={busy || !live}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            title="Add a new patient"
          >
            <Icon name="user" className="h-3.5 w-3.5" />
            Add Patient
          </button>
          <button
            type="button"
            onClick={() => setShowSchedule(true)}
            disabled={busy || !live}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            title="Schedule a new surgery"
          >
            <Icon name="calendar" className="h-3.5 w-3.5" />
            Schedule Surgery
          </button>
          <button
            type="button"
            onClick={() => run('simulate')}
            disabled={busy || !live}
            className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
            title="Create an 18-minute delay on the next on-track case"
          >
            <Icon name="alert" className="h-3.5 w-3.5" />
            Simulate Delay
          </button>
          <button
            type="button"
            onClick={() => run('resolve')}
            disabled={busy || !live}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
            title="Resolve the most recent pending delay"
          >
            <Icon name="check" className="h-3.5 w-3.5" />
            Resolve Delay
          </button>
          <button
            type="button"
            onClick={() => run('refresh')}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
          >
            <Icon name="refresh" className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>
      </header>

      <Toast
        message={toast?.message}
        type={toast?.type}
        onClose={() => setToast(null)}
      />
      <AddPatientModal
        open={showAddPatient}
        onClose={() => setShowAddPatient(false)}
        onCreated={() => {
          refresh()
          form.refresh()
        }}
        onResult={(type, message) => setToast({ type, message })}
        patients={form.data?.patients}
      />
      <ScheduleSurgeryModal
        open={showSchedule}
        onClose={() => setShowSchedule(false)}
        onCreated={() => {
          refresh()
          form.refresh()
        }}
        onResult={(type, message) => setToast({ type, message })}
        patients={form.data?.patients}
        theatres={form.data?.theatres}
        surgeries={form.data?.surgeries}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatCard key={kpi.label} {...kpi} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SurgeryBoard surgeries={data?.surgeries} />
        <AlertFeed alerts={data?.alerts} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <UtilizationPanel otUtilization={data?.otUtilization} />
        <RootCausePanel rootCauses={data?.rootCauses} />
        <SchedulePanel surgeries={data?.surgeries} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <PatientsPanel patients={form.data?.patients} />
      </div>
    </div>
  )
}