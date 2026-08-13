# 🏥 Surgical Operations Control Tower

A real-time command center for hospitals to monitor, coordinate, and optimize the entire surgical workflow — from patient readiness to OT turnover — with intelligent, root-cause-aware delay detection.

---

## 📌 The Problem

Hospitals today lack a **centralized, real-time view** of:
- Patient readiness (consent, pre-op, vitals, arrival)
- OT (Operation Theatre) readiness and availability
- CSSD (Central Sterile Services Department) instrument status
- Surgery schedules across departments
- Where and why delays are happening

This fragmentation leads to **surgery delays, idle OTs, miscommunication between departments, and poor visibility for hospital administrators**.

## 💡 The Solution

**Surgical Operations Control Tower** — a single dashboard that monitors the complete surgical workflow in real time, automatically **detects delays**, **identifies their root cause**, and **raises intelligent alerts** so hospital staff can take corrective action before delays cascade.

---

## 🔄 Surgical Workflow

```
Patient → Readiness → OT → CSSD → Transfer → Surgery → Completion → OT Turnover
```

**Delay Handling Loop:**

```
Detect Delay → Identify Root Cause → Generate Alert → Take Action → Resolve Delay
```

---

## 🧩 Core Modules

| Module | Description |
|---|---|
| **Control Tower** | Unified real-time dashboard — the single source of truth for all surgical operations |
| **Patient Management** | Central patient records and surgery case tracking |
| **Surgery Scheduling** | Create, assign, and manage OT schedules |
| **Patient Readiness** | Track consent, pre-op checklist, vitals, and patient arrival status |
| **CSSD Instruments** | Track sterilized instrument availability, status, and readiness for each case |
| **Intelligent Alerts** | Auto-generated, root-cause-tagged alerts for any workflow delay |
| **Delay Analytics** | KPIs, trends, and historical insights into delay patterns |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS + JavaScript |
| Backend / DB | Supabase (PostgreSQL) |
| Realtime | Supabase Realtime (WebSocket subscriptions) |
| Business Logic | Supabase RPC (Postgres Functions) |
| Hosting (suggested) | Vercel / Netlify (frontend) + Supabase Cloud (backend) |

---

## 👥 Team & Roles

### 1. Magesh Anand — Backend & Database
- Supabase/PostgreSQL project setup
- Database schema design (tables & relationships)
- CRUD operations for all modules
- Supabase Realtime integration (live data sync)
- RPC (Postgres) functions for business logic
- Delay detection engine & resolution logic
- Intelligent alert generation (backend logic)

### 2. Naveena — Frontend & Control Tower
- Main Control Tower dashboard
- OT monitoring UI
- Surgery scheduling interface
- KPI cards & analytics visualizations
- Alerts panel & delay visualization
- Overall UI/UX and responsive design system

### 3. Komugi — Patient Readiness & CSSD
- Patient Readiness module (consent, pre-op, vitals, arrival tracking)
- CSSD Instrument module (availability & sterilization status)
- Form design, validation, and input handling
- Data entry UX for clinical staff

---

## 🗄️ Suggested Database Schema

> Designed for PostgreSQL via Supabase. Adjust field types/constraints as needed.

```
patients
├── id (uuid, pk)
├── name
├── age
├── gender
├── mrn (medical record number)
├── created_at

surgeries
├── id (uuid, pk)
├── patient_id (fk → patients.id)
├── surgery_type
├── surgeon_name
├── scheduled_time
├── ot_id (fk → operation_theatres.id)
├── status (scheduled | in_progress | completed | cancelled)
├── created_at

operation_theatres
├── id (uuid, pk)
├── name
├── status (available | occupied | cleaning | maintenance)
├── current_surgery_id (fk → surgeries.id, nullable)

patient_readiness
├── id (uuid, pk)
├── surgery_id (fk → surgeries.id)
├── consent_status (pending | completed)
├── preop_checklist_status (pending | completed)
├── vitals_status (pending | completed)
├── arrival_status (not_arrived | arrived)
├── updated_at

cssd_instruments
├── id (uuid, pk)
├── surgery_id (fk → surgeries.id)
├── instrument_set_name
├── status (pending | sterilizing | ready | dispatched)
├── updated_at

workflow_stages
├── id (uuid, pk)
├── surgery_id (fk → surgeries.id)
├── stage (readiness | ot | cssd | transfer | surgery | completion | turnover)
├── status (pending | in_progress | completed | delayed)
├── started_at
├── completed_at
├── expected_duration_minutes

delay_alerts
├── id (uuid, pk)
├── surgery_id (fk → surgeries.id)
├── stage
├── root_cause (text)
├── severity (low | medium | high | critical)
├── status (open | acknowledged | resolved)
├── created_at
├── resolved_at
```

### Suggested RPC Functions
- `detect_delays()` — scans active workflow stages against expected durations
- `generate_alert(surgery_id, stage, root_cause, severity)` — inserts intelligent alert
- `resolve_alert(alert_id)` — marks alert resolved and logs resolution time
- `get_ot_status_summary()` — returns real-time OT occupancy stats
- `get_delay_analytics(date_range)` — aggregated KPIs for the analytics module

---

## 📁 Suggested Project Structure

```
surgical-control-tower/
├── src/
│   ├── components/
│   │   ├── ControlTower/
│   │   ├── PatientManagement/
│   │   ├── SurgeryScheduling/
│   │   ├── PatientReadiness/
│   │   ├── CSSDInstruments/
│   │   ├── Alerts/
│   │   └── Analytics/
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── hooks/
│   │   └── useRealtimeSubscription.js
│   ├── pages/
│   ├── App.jsx
│   └── main.jsx
├── supabase/
│   ├── schema.sql
│   └── functions/
├── .env.example
├── tailwind.config.js
├── vite.config.js
└── package.json
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project (free tier works)

### Installation

```bash
git clone <repo-url>
cd surgical-control-tower
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Database Setup
1. Open your Supabase project → SQL Editor
2. Run `supabase/schema.sql` to create tables and relationships
3. Deploy RPC functions from `supabase/functions/`
4. Enable Realtime on relevant tables (`surgeries`, `workflow_stages`, `delay_alerts`)

### Run Locally

```bash
npm run dev
```

App will be available at `http://localhost:5173`

---

## ✨ Key Features

- 📡 **Real-time sync** across all modules via Supabase Realtime
- 🚨 **Automatic delay detection** with root-cause tagging
- 🎯 **Actionable alerts** — not just notifications, but next-step guidance
- 📊 **Live KPIs** — OT utilization, average delay time, on-time surgery rate
- ✅ **Simple, form-driven readiness tracking** for clinical staff
- 🧼 **CSSD visibility** to prevent instrument-related surgery delays
- 📱 **Responsive design** — usable on ward tablets, nursing stations, and admin desktops

---

## 🎯 Hackathon Pitch (Elevator Summary)

> Surgical delays rarely have one cause — they cascade silently across patient prep, OT availability, and instrument sterilization. Our Control Tower brings every stage of the surgical journey into one real-time view, automatically flags where and why things are slowing down, and gives hospital teams the clarity to act before a 10-minute delay becomes a 2-hour backlog.

---

## 📄 License

This project was built for hackathon/demo purposes. Add a license of your choice before production use.