import { NavLink } from 'react-router-dom'
import Icon from './Icon'
import { NAV_ITEMS } from '../nav'

export default function Sidebar() {
  return (
    <aside className="bg-slate-900 text-slate-300 lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:min-h-screen lg:sticky lg:top-0">
      <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500 text-white shadow-lg shadow-teal-500/30">
          <Icon name="activity" className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">
            Hospital Ops
          </p>
          <p className="text-[11px] text-slate-400">Control Tower</p>
        </div>
      </div>

      <nav className="flex flex-1 gap-1 overflow-x-auto p-3 lg:flex-col lg:overflow-visible">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                isActive
                  ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon name={item.icon} className="h-[18px] w-[18px]" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="hidden border-t border-white/10 px-5 py-4 lg:block">
        <p className="text-[11px] text-slate-400">Demo · Mock data</p>
        <p className="mt-1 text-xs text-slate-500">
          React state only, no backend. Built for the hackathon.
        </p>
      </div>
    </aside>
  )
}