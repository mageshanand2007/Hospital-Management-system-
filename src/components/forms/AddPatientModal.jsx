import { useEffect, useState } from 'react'
import Modal from '../Modal'
import { Field, TextInput, Select, FormButtons, readOnlyCls } from './controls'
import { insertPatient } from '../../lib/supabaseData'

function nextPatientCode(patients = []) {
  const max = patients.reduce((m, p) => {
    const n = parseInt(String(p.patient_code || '').match(/^P(\d+)$/)?.[1], 10)
    return Number.isFinite(n) && n > m ? n : m
  }, 0)
  return `P${String(max + 1).padStart(3, '0')}`
}

export default function AddPatientModal({
  open,
  onClose,
  onCreated,
  onResult,
  patients = [],
}) {
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('M')
  const [ward, setWard] = useState('')
  const [bed, setBed] = useState('')
  const [contact, setContact] = useState('')
  const [status, setStatus] = useState('admitted')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (open) {
      setName('')
      setAge('')
      setGender('M')
      setWard('')
      setBed('')
      setContact('')
      setStatus('admitted')
      setError(null)
    }
  }, [open])

  const code = nextPatientCode(patients)

  async function submit(e) {
    e.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('Patient name is required')
      return
    }
    const ageNum = Number(age)
    if (age === '' || !Number.isInteger(ageNum) || ageNum < 0 || ageNum > 130) {
      setError('Age must be a whole number between 0 and 130')
      return
    }
    if (!gender) {
      setError('Gender is required')
      return
    }
    setBusy(true)
    setError(null)
    try {
      await insertPatient({
        patient_code: code,
        name: trimmedName,
        age: ageNum,
        gender,
        ward: ward.trim() || null,
        bed: bed.trim() || null,
        contact: contact.trim() || null,
        status,
      })
      onResult('success', `Patient ${code} (${trimmedName}) added`)
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
    <Modal open={open} onClose={onClose} title="Add Patient" subtitle="Creates a new row in the patients table">
      <form onSubmit={submit} className="space-y-4">
        {error && (
          <p className="rounded-lg bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
        <Field label="Patient Code" hint="Auto-generated, sequential from P001">
          <input readOnly value={code} className={readOnlyCls} />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full Name" required>
            <TextInput
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
            />
          </Field>
          <Field label="Age" required>
            <TextInput
              type="number"
              min="0"
              max="130"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="e.g. 45"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Field label="Gender" required>
            <Select value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </Select>
          </Field>
          <Field label="Ward">
            <TextInput
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              placeholder="e.g. Ward 2A"
            />
          </Field>
          <Field label="Bed">
            <TextInput
              value={bed}
              onChange={(e) => setBed(e.target.value)}
              placeholder="e.g. 2A-04"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Contact">
            <TextInput
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="e.g. +91 98000 12345"
            />
          </Field>
          <Field label="Status">
            <Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="admitted">Admitted</option>
              <option value="pre_admit">Pre-admit</option>
              <option value="discharged">Discharged</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>
        </div>
        <FormButtons onCancel={onClose} submitLabel="Add Patient" busy={busy} />
      </form>
    </Modal>
  )
}
