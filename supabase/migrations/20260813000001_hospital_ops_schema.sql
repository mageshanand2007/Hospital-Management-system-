-- ============================================================
-- Hospital Operations Control Tower — Supabase schema
-- Target: project tbcfekobgdcfehhfkkoz (already connected to app)
-- Applies to: public schema (anon/publishable role reads+writes demo data)
-- ============================================================

-- ------------------------------------------------------------------
-- updated_at trigger helper
-- ------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = coalesce(clock_timestamp(), now());
  return new;
end;
$$;

-- ------------------------------------------------------------------
-- 1. patients
-- ------------------------------------------------------------------
create table if not exists public.patients (
  id              uuid primary key default gen_random_uuid(),
  patient_code    text not null unique,
  name            text not null,
  age             int check (age between 0 and 130),
  gender          text not null default 'O' check (gender in ('M','F','O')),
  ward            text,
  bed             text,
  contact         text,
  status          text not null default 'admitted'
                    check (status in ('admitted','pre_admit','discharged','cancelled')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 2. operating_theatres
-- ------------------------------------------------------------------
create table if not exists public.operating_theatres (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  name          text,
  status        text not null default 'available'
                  check (status in ('available','in_use','delayed','maintenance')),
  is_delayed    boolean not null default false,
  delay_minutes int not null default 0 check (delay_minutes >= 0),
  utilization   numeric(5,1) not null default 0 check (utilization between 0 and 100),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ------------------------------------------------------------------
-- 3. surgeries
-- ------------------------------------------------------------------
create table if not exists public.surgeries (
  id                  uuid primary key default gen_random_uuid(),
  surgery_no          text not null unique,
  patient_id          uuid not null references public.patients(id) on delete cascade,
  ot_id               uuid references public.operating_theatres(id) on delete set null,
  procedure           text not null,
  surgeon             text,
  scheduled_time      timestamptz not null,
  estimated_duration  int not null default 60 check (estimated_duration > 0),
  status              text not null default 'scheduled'
                        check (status in ('scheduled','on_track','at_risk','delayed','completed','cancelled')),
  current_phase       text,
  progress            int not null default 0 check (progress between 0 and 100),
  delay_minutes       int not null default 0 check (delay_minutes >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_surgeries_ot on public.surgeries(ot_id);
create index if not exists idx_surgeries_patient on public.surgeries(patient_id);

-- ------------------------------------------------------------------
-- 4. patient_readiness
-- ------------------------------------------------------------------
create table if not exists public.patient_readiness (
  id                         uuid primary key default gen_random_uuid(),
  patient_id                 uuid not null references public.patients(id) on delete cascade,
  surgery_id                 uuid references public.surgeries(id) on delete set null,
  consent_signed             boolean not null default false,
  consent_signed_at          timestamptz,
  pre_anesthesia_cleared     boolean not null default false,
  pre_anesthesia_cleared_at  timestamptz,
  in_preop                   boolean not null default false,
  vitals_documented          boolean not null default false,
  arrived_at_ot              boolean not null default false,
  arrived_at_ot_at           timestamptz,
  status                     text not null default 'pending'
                               check (status in ('ready','pending','in_transit','blocked')),
  checked_by                 text,
  checked_at                 timestamptz,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  unique (patient_id, surgery_id)
);

-- ------------------------------------------------------------------
-- 5. cssd_instruments
-- ------------------------------------------------------------------
create table if not exists public.cssd_instruments (
  id            uuid primary key default gen_random_uuid(),
  pack_code     text not null unique,
  instrument_set text not null,
  surgery_id    uuid references public.surgeries(id) on delete set null,
  ot_id         uuid references public.operating_theatres(id) on delete set null,
  status        text not null default 'assembling'
                  check (status in ('released','sterilizing','assembling','blocked')),
  item_qty      int not null default 0 check (item_qty >= 0),
  last_action   text,
  cycle_eta     text,
  next_use      timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_cssd_surgery on public.cssd_instruments(surgery_id);

-- ------------------------------------------------------------------
-- 6. alerts
-- ------------------------------------------------------------------
create table if not exists public.alerts (
  id              uuid primary key default gen_random_uuid(),
  alert_no        text not null unique,
  severity        text not null default 'info'
                    check (severity in ('critical','warning','info')),
  type            text not null,
  surgery_id      uuid references public.surgeries(id) on delete set null,
  patient_id      uuid references public.patients(id) on delete set null,
  ot_id           uuid references public.operating_theatres(id) on delete set null,
  message         text not null,
  responsible_role text,
  status          text not null default 'active' check (status in ('active','resolved')),
  root_cause      text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_alerts_status on public.alerts(status);
create index if not exists idx_alerts_surgery on public.alerts(surgery_id);

-- ------------------------------------------------------------------
-- 7. delay_events
-- ------------------------------------------------------------------
create table if not exists public.delay_events (
  id            uuid primary key default gen_random_uuid(),
  event_no      text not null unique,
  surgery_id    uuid references public.surgeries(id) on delete set null,
  ot_id         uuid references public.operating_theatres(id) on delete set null,
  delay_type    text not null,
  delay_minutes int not null check (delay_minutes >= 0),
  cause         text,
  responsible   text,
  status        text not null default 'pending' check (status in ('pending','resolved')),
  resolved_at   timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idx_delay_events_status on public.delay_events(status);

-- updated_at triggers
create trigger trg_patients_updated before update on public.patients
  for each row execute function public.set_updated_at();
create trigger trg_operating_theatres_updated before update on public.operating_theatres
  for each row execute function public.set_updated_at();
create trigger trg_surgeries_updated before update on public.surgeries
  for each row execute function public.set_updated_at();
create trigger trg_readiness_updated before update on public.patient_readiness
  for each row execute function public.set_updated_at();
create trigger trg_cssd_updated before update on public.cssd_instruments
  for each row execute function public.set_updated_at();
create trigger trg_alerts_updated before update on public.alerts
  for each row execute function public.set_updated_at();
create trigger trg_delay_events_updated before update on public.delay_events
  for each row execute function public.set_updated_at();

-- ------------------------------------------------------------------
-- Row Level Security
-- Demo access model: anon/publishable role can SELECT everywhere,
-- and INSERT/UPDATE on the operational tables the dashboard writes to.
-- ------------------------------------------------------------------
alter table public.patients enable row level security;
alter table public.operating_theatres enable row level security;
alter table public.surgeries enable row level security;
alter table public.patient_readiness enable row level security;
alter table public.cssd_instruments enable row level security;
alter table public.alerts enable row level security;
alter table public.delay_events enable row level security;

do $$
declare t text;
begin
  foreach t in array array['patients','operating_theatres','surgeries','patient_readiness','cssd_instruments','alerts','delay_events']
  loop
    execute format('create policy "demo_select_anon" on public.%1$I for select to anon using (true);', t);
    execute format('create policy "demo_select_authenticated" on public.%1$I for select to authenticated using (true);', t);
  end loop;
end $$;

-- Writes the dashboard needs (Simulate / Resolve Delay)
create policy "demo_update_delay_events" on public.delay_events for update to anon using (true) with check (true);
create policy "demo_insert_delay_events" on public.delay_events for insert to anon with check (true);
create policy "demo_update_alerts" on public.alerts for update to anon using (true) with check (true);
create policy "demo_insert_alerts" on public.alerts for insert to anon with check (true);
create policy "demo_update_surgeries" on public.surgeries for update to anon using (true) with check (true);
create policy "demo_update_theatres" on public.operating_theatres for update to anon using (true) with check (true);
create policy "demo_update_readiness" on public.patient_readiness for update to anon using (true) with check (true);

-- ------------------------------------------------------------------
-- RPC functions powering the dashboard "Simulate Delay" / "Resolve Delay"
-- security definer → run as table owner so the anon role only needs EXECUTE
-- ------------------------------------------------------------------
create or replace function public.simulate_delay(
  p_surgery_id uuid,
  p_delay_type text default 'Patient Transfer',
  p_minutes   int  default 18,
  p_cause     text default 'Patient not arrived at OT (simulated).',
  p_responsible text default 'Ward Transport Coordinator'
) returns jsonb
language plpgsql security definer
as $$
declare
  v_surgery public.surgeries%rowtype;
  v_patient public.patients%rowtype;
  v_ot      public.operating_theatres%rowtype;
  v_event_no text;
  v_alert_no text;
begin
  select * into v_surgery from public.surgeries where id = p_surgery_id;
  if not found then
    raise exception 'surgery % not found', p_surgery_id;
  end if;
  select * into v_patient from public.patients where id = v_surgery.patient_id;
  select * into v_ot      from public.operating_theatres where id = v_surgery.ot_id;

  v_event_no := 'D-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));
  v_alert_no := 'A-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.delay_events (event_no, surgery_id, ot_id, delay_type, delay_minutes, cause, responsible, status)
  values (v_event_no, v_surgery.id, v_surgery.ot_id, p_delay_type, p_minutes, p_cause, p_responsible, 'pending');

  insert into public.alerts (alert_no, severity, type, surgery_id, patient_id, ot_id, message, responsible_role, status, root_cause)
  values (
    v_alert_no, 'critical', p_delay_type, v_surgery.id, v_surgery.patient_id, v_surgery.ot_id,
    v_patient.name || ' (' || v_patient.patient_code || ') has not arrived at ' || coalesce(v_ot.code, 'OT') ||
    ' for ' || v_surgery.procedure || '. ' || p_cause,
    p_responsible, 'active', 'Transport'
  );

  update public.surgeries
     set status = 'delayed', delay_minutes = p_minutes, current_phase = 'Patient In Transit', progress = greatest(progress, 75)
   where id = v_surgery.id;

  update public.operating_theatres
     set status = 'delayed', is_delayed = true, delay_minutes = p_minutes
   where id = v_surgery.ot_id;

  return jsonb_build_object('ok', true, 'event_no', v_event_no, 'alert_no', v_alert_no, 'surgery_no', v_surgery.surgery_no);
end;
$$;

create or replace function public.resolve_delay(p_event_id uuid default null)
returns jsonb
language plpgsql security definer
as $$
declare
  v_event   public.delay_events%rowtype;
  v_pending int;
begin
  if p_event_id is null then
    select * into v_event from public.delay_events
     where status = 'pending'
     order by created_at desc
     limit 1;
  else
    select * into v_event from public.delay_events where id = p_event_id;
  end if;

  if not found then
    return jsonb_build_object('ok', false, 'reason', 'no pending delay event');
  end if;

  update public.delay_events
     set status = 'resolved', resolved_at = now()
   where id = v_event.id;

  update public.alerts
     set status = 'resolved'
   where surgery_id = v_event.surgery_id
     and status = 'active'
     and severity = 'critical';

  if v_event.surgery_id is not null then
    select count(*) into v_pending from public.delay_events
     where surgery_id = v_event.surgery_id and status = 'pending';
    update public.surgeries
       set status = case when v_pending > 0 then 'delayed' else 'on_track' end,
           delay_minutes = coalesce((select sum(delay_minutes) from public.delay_events
                                      where surgery_id = v_event.surgery_id and status = 'pending'), 0)
     where id = v_event.surgery_id
       and status in ('delayed', 'at_risk');
  end if;

  if v_event.ot_id is not null then
    select count(*) into v_pending from public.delay_events
     where ot_id = v_event.ot_id and status = 'pending';
    update public.operating_theatres
       set status = case when v_pending > 0 then 'delayed' else 'in_use' end,
           is_delayed = (v_pending > 0),
           delay_minutes = coalesce((select sum(delay_minutes) from public.delay_events
                                      where ot_id = v_event.ot_id and status = 'pending'), 0)
     where id = v_event.ot_id;
  end if;

  return jsonb_build_object('ok', true, 'event_no', v_event.event_no);
end;
$$;

grant execute on function public.simulate_delay(uuid, text, int, text, text) to anon;
grant execute on function public.simulate_delay(uuid, text, int, text, text) to authenticated;
grant execute on function public.resolve_delay(uuid) to anon;
grant execute on function public.resolve_delay(uuid) to authenticated;

-- ------------------------------------------------------------------
-- Realtime
-- ------------------------------------------------------------------
alter table public.operating_theatres replica identity full;
alter table public.alerts replica identity full;
alter table public.delay_events replica identity full;

alter publication supabase_realtime add table public.operating_theatres;
alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.delay_events;