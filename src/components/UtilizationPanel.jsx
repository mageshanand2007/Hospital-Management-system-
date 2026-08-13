import SectionCard from './SectionCard'
import { otUtilization as fallback } from '../data/mockData'

export default function UtilizationPanel({ otUtilization = fallback }) {
  const total = otUtilization.reduce((sum, room) => sum + room.utilization, 0)
  const average = otUtilization.length
    ? Math.round(total / otUtilization.length)
    : 0
  return (
    <SectionCard
      title="OT Utilization"
      subtitle={`Average ${average}% today`}
    >
      <ul className="space-y-4">
        {otUtilization.map((room) => (
          <li key={room.room}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{room.room}</span>
              <span className="font-semibold text-slate-900">
                {room.utilization}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full ${room.color}`}
                style={{ width: `${room.utilization}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500">
        Utilization above <span className="font-semibold text-slate-700">85%</span>{' '}
        with recurring delays indicates a scheduling or support bottleneck.
      </p>
    </SectionCard>
  )
}