import SectionCard from './SectionCard'

const statusStyles = {
  admitted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  pre_admit: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  discharged: 'bg-slate-100 text-slate-500 ring-slate-500/20',
  cancelled: 'bg-rose-50 text-rose-700 ring-rose-600/20',
}

const statusLabels = {
  admitted: 'Admitted',
  pre_admit: 'Pre-Admit',
  discharged: 'Discharged',
  cancelled: 'Cancelled',
}

function PatientStatusPill({ status }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusStyles[status] || statusStyles.pre_admit}`}
    >
      {statusLabels[status] || status}
    </span>
  )
}

export default function PatientsPanel({ patients = [] }) {
  return (
    <SectionCard
      title="Patient Registry"
      subtitle={`${patients.length} patient${patients.length === 1 ? '' : 's'} on file`}
    >
      <ul className="divide-y divide-slate-100">
        {patients.map((p) => (
          <li key={p.id} className="flex items-center gap-3 py-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-600">
              {String(p.age ?? '—')}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-700">
                {p.name}
              </p>
              <p className="text-xs text-slate-500">
                {p.patient_code} · {p.ward || 'No ward'}
                {p.bed ? ` · ${p.bed}` : ''}
              </p>
            </div>
            <PatientStatusPill status={p.status} />
          </li>
        ))}
        {patients.length === 0 && (
          <li className="py-6 text-center text-sm text-slate-400">
            No patients yet.
          </li>
        )}
      </ul>
    </SectionCard>
  )
}
