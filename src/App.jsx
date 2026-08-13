import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import PatientReadiness from './pages/PatientReadiness'
import CssdInstruments from './pages/CssdInstruments'
import Alerts from './pages/Alerts'
import Analytics from './pages/Analytics'
import SurgeryTimeline from './pages/SurgeryTimeline'

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 lg:flex">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/readiness" element={<PatientReadiness />} />
          <Route path="/cssd" element={<CssdInstruments />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/timeline" element={<SurgeryTimeline />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
    </div>
  )
}
