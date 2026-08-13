import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { Field, TextInput, Select, FormButtons, readOnlyCls } from './controls'
import { insertSurgery, insertReadiness } from '../../lib/supabaseData'

function nextSurgeryNo(surgeries = []) {
  const max = surgeries.reduce((m, s) => {
    const n = parseInt(String(s.surgery_no || '').match(/^S-(\d+)$/)?.[1], 10)
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return `S-${max + 1}`
}

export default function ScheduleSurgeryModal({
  open,
  onClose,
  onCreated,
  onResult,
  patients = [],
  theatres = [],
  surgeries = [],
}) {
  const [patientId, setPatientId] = useState('')
  const [otId, setOtId] = useState('')
  const [procedure, setProcedure] = useState('')
  const [surgeon, setSurgeon] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [estimatedDuration, setEstimatedDuration] = useState('60')
  const [currentPhase, setCurrentPhase] = useState('Scheduled')
  const [progress, setProgress] = useState('0')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setPatientId('')
      setOtId('')
      setProcedure('')
      setSurgeon('')
      setScheduledTime('')
      setEstimatedDuration('60')
      setCurrentPhase('Scheduled')
      setProgress('0')
      setError(null)
    }
  }, [open])

  const surgeryNo = nextSurgeryNo(surgeries)
  const patientName =
    patients.find((p) => p.id === patientId)?.name || ''

  async function submit(e) {
    e.preventDefault()
    if (!patientId) {
      setError('Please select a patient')
      return
    }
    if (!procedure.trim()) {
      setError('Procedure is required')
      return
    }
    if (!scheduledTime) {
      setError('Scheduled time is required')
      return
    }
    const duration = Number(estimatedDuration)
    if (!Number.isFinite(duration) || duration <= 0) {
      setError('Estimated duration must be a positive number of minutes')
      return
    }
    setBusy(true)
    setError(null)
    try {
      const created = await insertSurgery({
        surgery_no: surgeryNo,
        patient_id: patientId,
        ot_id: otId || null,
        procedure: procedure.trim(),
        surgeon: surgeon.trim() || null,
        scheduled_time: new Date(scheduledTime).toISOString(),
        estimated_duration: Math.round(duration),
        status: 'scheduled',
        current_phase: currentPhase.trim() || 'Scheduled',
        progress: Math.min(Math.max(Number(progress) || 0, 0), 100),
        delay_minutes: 0,
      })
      await insertReadiness({
        patient_id: patientId,
        surgery_id: created.id,
        consent_signed: false,
        pre_anesthesia_cleared: false,
        in_preop: false,
        vitals_documented: false,
        arrived_at_ot: false,
        status: 'pending',
        checked_by: 'Nursing · Ward',
        checked_at: new Date().toISOString(),
      })
      onResult(
        'success',
        `Surgery ${surgeryNo} scheduled for ${patientName || 'patient'}`,
      )
      onCreated()
      onClose()
    } catch (err) {
      setError(err.message)
      onResult('error', err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Schedule Surgery" subtitle="Creates a new row in the surgeries table and a pending readiness record">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
        <Field label="Surgery No." hint="Auto-generated, sequential from S-1001">
          <input readOnly value={surgeryNo} className={readOnlyCls} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Patient" required>
            <Select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            >
              <option value="">Select patient…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.patient_code} · {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Operating Theatre">
            <Select value={otId} onChange={(e) => setOtId(e.target.value)}>
              <option value="">No theatre assigned</option>
              {theatres.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code} {t.status ? `· ${t.status}` : ''}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Procedure" required>
            <TextInput
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="e.g. Total Knee Replacement"
            />
          </Field>
          <Field label="Surgeon">
            <TextInput
              value={surgeon}
              onChange={(e) => setSurgeon(e.target.value)}
              placeholder="e.g. Dr. Mehta"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Scheduled Time" required>
            <TextInput
              type="datetime-local"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
          </Field>
          <Field label="Estimated Duration (min)" required>
            <TextInput
              type="number"
              min="1"
              value={estimatedDuration}
              onChange={(e) => setEstimatedDuration(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Current Phase">
            <TextInput
              value={currentPhase}
              onChange={(e) => setCurrentPhase(e.target.value)}
              placeholder="e.g. Scheduled"
            />
          </Field>
          <Field label="Progress (%)">
            <TextInput
              type="number"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
            />
          </Field>
        </div>
        <FormButtons onCancel={onClose} submitLabel="Schedule Surgery" busy={busy} />
      </form>
    </Modal>
  )
}
