import { useEffect, useCallback, useState } from 'react'
import { supabase } from './supabase'
import * as mock from '../data/mockData'

// ------------------------------------------------------------------
// Mapping helpers — DB rows are mapped to the exact shapes the existing
// UI components expect, so the design does not change.
// ------------------------------------------------------------------

function fmtTime(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function relativeTime(ts) {
  if (!ts) return 'just now'
  const diff = Math.round((Date.now() - new Date(ts).getTime()) / 60000)
  if (diff <= 0) return 'just now'
  if (diff === 1) return '1 min ago'
  return `${diff} min ago`
}

// ------------------------------------------------------------------
// Queries
// ------------------------------------------------------------------

export async function fetchSurgeries() {
  const { data, error } = await supabase
    .from('surgeries')
    .select(
      'id, surgery_no, procedure, surgeon, scheduled_time, estimated_duration, status, current_phase, progress, delay_minutes, patients(name, age), operating_theatres(code), patient_readiness(checked_by)',
    )
    .order('scheduled_time', { ascending: true })
  if (error) throw error
  return (data || []).map((s) => ({
    surgeryId: s.id,
    id: s.surgery_no,
    patient: s.patients?.name || 'Unknown',
    age: s.patients?.age,
    procedure: s.procedure,
    surgeon: s.surgeon,
    otRoom: s.operating_theatres?.code || '—',
    time: fmtTime(s.scheduled_time),
    duration: s.estimated_duration,
    status: s.status,
    delayMinutes: s.delay_minutes || 0,
    phase: s.current_phase,
    progress: s.progress,
    responsible: s.patient_readiness?.[0]?.checked_by || '—',
  }))
}

export async function fetchAlerts() {
  const { data, error } = await supabase
    .from('alerts')
    .select(
      'id, alert_no, severity, type, message, responsible_role, status, root_cause, created_at, surgeries(surgery_no), operating_theatres(code)',
    )
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data || []).map((a) => ({
    id: a.alert_no,
    severity: a.severity,
    type: a.type,
    caseId: a.surgeries?.surgery_no || a.operating_theatres?.code || '—',
    message: a.message,
    responsible: a.responsible_role,
    time: relativeTime(a.created_at),
    status: a.status,
    rootCause: a.root_cause,
  }))
}

const theatrePalette = ['bg-teal-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500']

export async function fetchTheatres() {
  const { data, error } = await supabase
    .from('operating_theatres')
    .select('*')
    .order('code', { ascending: true })
  if (error) throw error
  return (data || []).map((t, i) => ({
    id: t.id,
    room: t.code,
    utilization: Number(t.utilization),
    color: theatrePalette[i % theatrePalette.length],
    status: t.status,
    is_delayed: t.is_delayed,
    delay_minutes: t.delay_minutes,
  }))
}

export async function fetchDelayEvents() {
  const { data, error } = await supabase
    .from('delay_events')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchPatients() {
  const { data, error } = await supabase
    .from('patients')
    .select('id, patient_code, name, age, gender, ward, bed, contact, status')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchTheatreOptions() {
  const { data, error } = await supabase
    .from('operating_theatres')
    .select('id, code, status')
    .order('code', { ascending: true })
  if (error) throw error
  return data || []
}

export async function fetchSurgeryOptions() {
  const { data, error } = await supabase
    .from('surgeries')
    .select('id, surgery_no, procedure, patient_id, ot_id, status, scheduled_time')
    .order('scheduled_time', { ascending: true })
  if (error) throw error
  return data || []
}

export async function fetchCssdInstruments() {
  const { data, error } = await supabase
    .from('cssd_instruments')
    .select(
      'id, pack_code, instrument_set, item_qty, status, last_action, cycle_eta, next_use, surgery_id, ot_id, surgeries(surgery_no, procedure), operating_theatres(code)',
    )
    .order('pack_code', { ascending: true })
  if (error) throw error
  return (data || []).map((c) => ({
    id: c.pack_code,
    instrumentSet: c.instrument_set,
    qty: c.item_qty,
    caseId: c.surgeries?.surgery_no || '—',
    procedure: c.surgeries?.procedure || '—',
    lastAction: c.last_action || '—',
    nextUse: c.next_use
      ? `${fmtTime(c.next_use)} · ${c.operating_theatres?.code || 'OT'}`
      : '—',
    status: c.status,
  }))
}

export async function fetchReadiness() {
  const { data, error } = await supabase
    .from('patient_readiness')
    .select(
      'id, patient_id, surgery_id, status, checked_by, checked_at, arrived_at_ot, arrived_at_ot_at, consent_signed, consent_signed_at, pre_anesthesia_cleared, pre_anesthesia_cleared_at, in_preop, vitals_documented, patients(patient_code, name, age), surgeries(surgery_no, procedure, ot_id, scheduled_time, current_phase, operating_theatres(code))',
    )
    .order('checked_at', { ascending: true })
  if (error) throw error
  return data || []
}

// ------------------------------------------------------------------
// Derived views (same shapes mockData produced)
// ------------------------------------------------------------------

const causeColors = {
  'Patient Transfer': 'bg-rose-500',
  'Pre-Anesthesia Pending': 'bg-amber-500',
  'Consent Pending': 'bg-sky-500',
  'CSSD Not Ready': 'bg-amber-500',
  Staffing: 'bg-violet-500',
}

export function deriveRootCauses(delayEvents) {
  const totals = {}
  let sum = 0
  for (const d of delayEvents || []) {
    totals[d.delay_type] = (totals[d.delay_type] || 0) + d.delay_minutes
    sum += d.delay_minutes
  }
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .map(([cause, value]) => ({
      cause,
      value: sum ? Math.round((value / sum) * 100) : 0,
      color: causeColors[cause] || 'bg-slate-400',
    }))
}

export function deriveKpis(surgeries, theatres) {
  const total = surgeries.length
  const onTime = surgeries.filter((s) => s.status === 'on_track').length
  const inProgress = surgeries.filter(
    (s) => s.status !== 'scheduled' && s.status !== 'completed',
  ).length
  const avgDelay = total
    ? Math.round(surgeries.reduce((acc, s) => acc + s.delayMinutes, 0) / total)
    : 0
  const worst = surgeries.slice().sort((a, b) => b.delayMinutes - a.delayMinutes)[0]
  const utilization = theatres.length
    ? Math.round(theatres.reduce((acc, t) => acc + t.utilization, 0) / theatres.length)
    : 0
  return [
    {
      label: 'Surgeries Today',
      value: String(total),
      sub: `${inProgress} in progress`,
      trend: '+2 vs plan',
      icon: 'calendar',
      tone: 'neutral',
    },
    {
      label: 'Started On Time',
      value: `${total ? Math.round((onTime / total) * 100) : 0}%`,
      sub: `${onTime} of ${total} on time`,
      trend: '-4% vs week',
      icon: 'activity',
      tone: 'warn',
    },
    {
      label: 'Avg Start Delay',
      value: `${avgDelay} min`,
      sub: `worst case: ${worst && worst.delayMinutes ? worst.id : '—'}`,
      trend: '+6 min',
      icon: 'clock',
      tone: 'bad',
    },
    {
      label: 'OT Utilization',
      value: `${utilization}%`,
      sub: 'peak at 11:00',
      trend: 'healthy',
      icon: 'gauge',
      tone: 'good',
    },
  ]
}

// ------------------------------------------------------------------
// Combined loaders (used by pages). Fall back to mock data if the
// database is unreachable, so the UI never breaks.
// ------------------------------------------------------------------

const mockFallback = {
  surgeries: mock.surgeries,
  alerts: mock.alerts,
  theatres: mock.otUtilization,
  delayEvents: [],
  kpis: mock.kpis,
  otUtilization: mock.otUtilization,
  rootCauses: mock.rootCauses,
  live: false,
}

export async function loadControlTower() {
  try {
    const [surgeries, theatres, alerts, delayEvents] = await Promise.all([
      fetchSurgeries(),
      fetchTheatres(),
      fetchAlerts(),
      fetchDelayEvents(),
    ])
    return {
      surgeries,
      theatres,
      alerts,
      delayEvents,
      kpis: deriveKpis(surgeries, theatres),
      otUtilization: theatres,
      rootCauses: deriveRootCauses(delayEvents),
      live: true,
    }
  } catch (error) {
    return { ...mockFallback, error: error.message }
  }
}

export async function loadAlerts() {
  try {
    const alerts = await fetchAlerts()
    return { alerts, live: true }
  } catch (error) {
    return { alerts: mock.alerts, live: false, error: error.message }
  }
}

export async function loadReadiness() {
  try {
    const readiness = await fetchReadiness()
    const rows = readiness.map((r) => ({
      surgeryId: r.surgeries?.id ?? null,
      readinessId: r.id,
      patientId: r.patient_id,
      id: r.surgeries?.surgery_no || r.patients?.patient_code || '—',
      patient: r.patients?.name || 'Unknown',
      age: r.patients?.age,
      procedure: r.surgeries?.procedure || '—',
      otRoom: r.surgeries?.operating_theatres?.code || '—',
      time: fmtTime(r.surgeries?.scheduled_time),
      phase: r.surgeries?.current_phase || '—',
      responsible: r.checked_by || '—',
      readiness: readinessStatus(r),
      fields: {
        consent_signed: r.consent_signed,
        pre_anesthesia_cleared: r.pre_anesthesia_cleared,
        in_preop: r.in_preop,
        vitals_documented: r.vitals_documented,
        arrived_at_ot: r.arrived_at_ot,
      },
      status: r.status,
      checked_by: r.checked_by,
      ts: {
        consent_signed_at: r.consent_signed_at,
        pre_anesthesia_cleared_at: r.pre_anesthesia_cleared_at,
        arrived_at_ot_at: r.arrived_at_ot_at,
      },
    }))
    return { rows, live: true }
  } catch (error) {
    const mockRows = mock.surgeries.map((s) => ({
      surgeryId: null,
      id: s.id,
      patient: s.patient,
      age: s.age,
      procedure: s.procedure,
      otRoom: s.otRoom,
      time: s.time,
      phase: s.phase,
      responsible: s.responsible,
      readiness: readinessStatusFromPhase(s.phase),
    }))
    return { rows: mockRows, live: false, error: error.message }
  }
}

export async function loadFormOptions() {
  try {
    const [patients, theatres, surgeries] = await Promise.all([
      fetchPatients(),
      fetchTheatreOptions(),
      fetchSurgeryOptions(),
    ])
    return { patients, theatres, surgeries, live: true }
  } catch (error) {
    return { patients: [], theatres: [], surgeries: [], live: false, error: error.message }
  }
}

export async function loadCssdInstruments() {
  try {
    const rows = await fetchCssdInstruments()
    return { rows, live: true }
  } catch (error) {
    const mockRows = mock.cssdTrays.map((t) => ({
      id: t.id,
      instrumentSet: t.instrumentSet,
      qty: t.qty,
      caseId: t.caseId,
      procedure: t.procedure,
      lastAction: t.lastAction,
      nextUse: t.nextUse,
      status: t.status === 'delayed' ? 'blocked' : t.status,
    }))
    return { rows: mockRows, live: false, error: error.message }
  }
}

function readinessStatus(r) {
  if (r.status === 'ready') return 'ready'
  if (r.status === 'in_transit') return 'blocked'
  if (r.status === 'blocked') return 'blocked'
  return 'pending'
}

function readinessStatusFromPhase(phase) {
  if (phase === 'Patient Ready' || phase === 'CSSD Ready' || phase === 'Awaiting CSSD')
    return 'ready'
  if (phase === 'Consent Pending' || phase === 'Pre-Anesthesia Pending') return 'blocked'
  return 'pending'
}

// ------------------------------------------------------------------
// Write actions — backed by the RPC functions in the migration so each
// Simulate/Resolve is a single atomic database transaction.
// ------------------------------------------------------------------

export async function simulateDelay(surgeryId) {
  const { data, error } = await supabase.rpc('simulate_delay', {
    p_surgery_id: surgeryId,
  })
  if (error) throw error
  return data
}

export async function resolveLatestDelay() {
  const { data, error } = await supabase.rpc('resolve_delay', {})
  if (error) throw error
  return data
}

// ------------------------------------------------------------------
// CRUD writes — direct table inserts/updates used by the forms.
// ------------------------------------------------------------------

export async function insertPatient(payload) {
  const { data, error } = await supabase
    .from('patients')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  return data
}

export async function insertSurgery(payload) {
  const { data, error } = await supabase
    .from('surgeries')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  return data
}

export async function insertReadiness(payload) {
  const { data, error } = await supabase
    .from('patient_readiness')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  return data
}

export async function updateReadiness(id, payload) {
  const { data, error } = await supabase
    .from('patient_readiness')
    .update(payload)
    .eq('id', id)
    .select('id')
    .single()
  if (error) throw error
  return data
}

export async function insertCssdInstrument(payload) {
  const { data, error } = await supabase
    .from('cssd_instruments')
    .insert(payload)
    .select('id')
    .single()
  if (error) throw error
  return data
}

// ------------------------------------------------------------------
// Realtime — refetch whenever the tracked tables change.
// ------------------------------------------------------------------

export function subscribeToControlTower(onChange) {
  const channel = supabase
    .channel('control-tower-db')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'operating_theatres' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'delay_events' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'surgeries' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

export function subscribeToTable(table, onChange) {
  const channel = supabase
    .channel(`table-${table}`)
    .on('postgres_changes', { event: '*', schema: 'public', table }, onChange)
    .subscribe()
  return () => supabase.removeChannel(channel)
}

// ------------------------------------------------------------------
// Small data hook
// ------------------------------------------------------------------

export function useSupabaseData(loader, deps = []) {
  const [state, setState] = useState({ data: null, loading: true, error: null })
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    let active = true
    setState((s) => ({ ...s, loading: true }))
    loader()
      .then((data) => active && setState({ data, loading: false, error: null }))
      .catch((error) => active && setState({ data: null, loading: false, error }))
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version, ...deps])

  return { ...state, refresh }
}
