import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { Field, TextInput, Select, FormButtons, readOnlyCls } from './controls'
import { insertCssdInstrument } from '../../lib/supabaseData'

function nextPackCode(rows = []) {
  const max = rows.reduce((m, r) => {
    const n = parseInt(String(r.id || '').match(/^T-(\d+)$/)?.[1], 10)
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return `T-${max + 1}`
}

export default function AddCssdInstrumentModal({
  open,
  onClose,
  onCreated,
  onResult,
  surgeries = [],
  theatres = [],
  rows = [],
}) {
  const [instrumentSet, setInstrumentSet] = useState('')
  const [itemQty, setItemQty] = useState('0')
  const [status, setStatus] = useState('assembling')
  const [surgeryId, setSurgeryId] = useState('')
  const [otId, setOtId] = useState('')
  const [nextUse, setNextUse] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setInstrumentSet('')
      setItemQty('0')
      setStatus('assembling')
      setSurgeryId('')
      setOtId('')
      setNextUse('')
      setError(null)
    }
  }, [open])

  const packCode = nextPackCode(rows)

  async function submit(e) {
    e.preventDefault()
    if (!instrumentSet.trim()) {
      setError('Instrument set is required')
      return
    }
    const qty = Number(itemQty)
    if (!Number.isInteger(qty) || qty < 0) {
      setError('Quantity must be a whole number of 0 or more')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await insertCssdInstrument({
        pack_code: packCode,
        instrument_set: instrumentSet.trim(),
        item_qty: qty,
        status,
        surgery_id: surgeryId || null,
        ot_id: otId || null,
        next_use: nextUse ? new Date(nextUse).toISOString() : null,
        last_action: `Added ${new Date().toLocaleString()}`,
      })
      onResult('success', `Instrument pack ${packCode} added`)
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
    <Modal open={open} onClose={onClose} title="Add CSSD Instrument" subtitle="Creates a new row in the cssd_instruments table">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
        <Field label="Pack Code" hint="Auto-generated, sequential from T-101">
          <input readOnly value={packCode} className={readOnlyCls} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Instrument Set" required>
            <TextInput
              value={instrumentSet}
              onChange={(e) => setInstrumentSet(e.target.value)}
              placeholder="e.g. Ortho Knee Set"
            />
          </Field>
          <Field label="Item Qty" required>
            <TextInput
              type="number"
              min="0"
              value={itemQty}
              onChange={(e) => setItemQty(e.target.value)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="assembling">Assembling</option>
              <option value="sterilizing">Sterilizing</option>
              <option value="released">Released</option>
              <option value="blocked">Blocked</option>
            </Select>
          </Field>
          <Field label="For Case">
            <Select
              value={surgeryId}
              onChange={(e) => setSurgeryId(e.target.value)}
            >
              <option value="">No case assigned</option>
              {surgeries.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.surgery_no} · {s.procedure}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Operating Theatre">
            <Select value={otId} onChange={(e) => setOtId(e.target.value)}>
              <option value="">No theatre assigned</option>
              {theatres.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.code}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Next Use">
            <TextInput
              type="datetime-local"
              value={nextUse}
              onChange={(e) => setNextUse(e.target.value)}
            />
          </Field>
        </div>
        <FormButtons onCancel={onClose} submitLabel="Add Instrument" busy={busy} />
      </form>
    </Modal>
  )
}
