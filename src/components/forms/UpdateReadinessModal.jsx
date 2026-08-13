import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { Field, TextInput, Select, CheckRow, FormButtons } from './controls'
import { updateReadiness } from '../../lib/supabaseData'

export default function UpdateReadinessModal({
  open,
  row,
  onClose,
  onUpdated,
  onResult,
}) {
  const [consent, setConsent] = useState(false)
  const [preAnesthesia, setPreAnesthesia] = useState(false)
  const [preop, setPreop] = useState(false)
  const [vitals, setVitals] = useState(false)
  const [arrived, setArrived] = useState(false)
  const [checkedBy, setCheckedBy] = useState('')
  const [status, setStatus] = useState('pending')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open && row) {
      setConsent(!!row.fields?.consent_signed)
      setPreAnesthesia(!!row.fields?.pre_anesthesia_cleared)
      setPreop(!!row.fields?.in_preop)
      setVitals(!!row.fields?.vitals_documented)
      setArrived(!!row.fields?.arrived_at_ot)
      setCheckedBy(row.checked_by || '')
      setStatus(row.status || 'pending')
      setError(null)
    }
  }, [open, row])

  async function submit(e) {
    e.preventDefault()
    if (!checkedBy.trim()) {
      setError('Checked by is required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await updateReadiness(row.readinessId, {
        consent_signed: consent,
        pre_anesthesia_cleared: preAnesthesia,
        in_preop: preop,
        vitals_documented: vitals,
        arrived_at_ot: arrived,
        checked_by: checkedBy.trim(),
        status,
        consent_signed_at: consent
          ? row.ts?.consent_signed_at || new Date().toISOString()
          : null,
        pre_anesthesia_cleared_at: preAnesthesia
          ? row.ts?.pre_anesthesia_cleared_at || new Date().toISOString()
          : null,
        arrived_at_ot_at: arrived
          ? row.ts?.arrived_at_ot_at || new Date().toISOString()
          : null,
        checked_at: new Date().toISOString(),
      })
      onResult('success', `Readiness updated for ${row.id}`)
      onUpdated()
      onClose()
    } catch (err) {
      setError(err.message)
      onResult('error', err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update Readiness"
      subtitle={row ? `${row.id} · ${row.patient} · ${row.procedure}` : ''}
    >
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
        <div className="space-y-2">
          <CheckRow label="Consent signed" checked={consent} onChange={setConsent} />
          <CheckRow
            label="Pre-anesthesia cleared"
            checked={preAnesthesia}
            onChange={setPreAnesthesia}
          />
          <CheckRow label="In pre-op" checked={preop} onChange={setPreop} />
          <CheckRow
            label="Vitals documented"
            checked={vitals}
            onChange={setVitals}
          />
          <CheckRow
            label="Arrived at OT"
            checked={arrived}
            onChange={setArrived}
          />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Checked by" required>
            <TextInput
              value={checkedBy}
              onChange={(e) => setCheckedBy(e.target.value)}
              placeholder="e.g. Nursing · Ward 2A"
            />
          </Field>
          <Field label="Readiness Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">In Prep</option>
              <option value="ready">Ready</option>
              <option value="in_transit">In Transit</option>
              <option value="blocked">Blocked</option>
            </Select>
          </Field>
        </div>
        <FormButtons onCancel={onClose} submitLabel="Save Readiness" busy={busy} />
      </form>
    </Modal>
  )
}
