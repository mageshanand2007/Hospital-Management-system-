-- ============================================================
-- Hospital Operations Control Tower — CRUD support
-- Adds the RLS INSERT policies the dashboard forms need, plus an
-- automatic alert trigger so every delay_events row raises an alert.
-- ============================================================

-- ---------- Realtime: publish the CRUD tables too ----------
alter table public.patients replica identity full;
alter table public.surgeries replica identity full;
alter table public.patient_readiness replica identity full;
alter table public.cssd_instruments replica identity full;

alter publication supabase_realtime add table public.patients;
alter publication supabase_realtime add table public.surgeries;
alter publication supabase_realtime add table public.patient_readiness;
alter publication supabase_realtime add table public.cssd_instruments;

-- ---------- RLS: let the forms INSERT new rows ----------
create policy "demo_insert_patients" on public.patients for insert to anon with check (true);
create policy "demo_insert_patients_auth" on public.patients for insert to authenticated with check (true);

create policy "demo_insert_surgeries" on public.surgeries for insert to anon with check (true);
create policy "demo_insert_surgeries_auth" on public.surgeries for insert to authenticated with check (true);

create policy "demo_insert_readiness" on public.patient_readiness for insert to anon with check (true);
create policy "demo_insert_readiness_auth" on public.patient_readiness for insert to authenticated with check (true);

create policy "demo_insert_cssd" on public.cssd_instruments for insert to anon with check (true);
create policy "demo_insert_cssd_auth" on public.cssd_instruments for insert to authenticated with check (true);

-- ---------- Automatic alert whenever a delay is detected ----------
create or replace function public.alert_on_delay_event()
returns trigger
language plpgsql security definer
as $$
declare
  v_surgery_no   text;
  v_patient_name text;
  v_patient_code text;
  v_ot_code      text;
  v_alert_no     text;
begin
  if exists (
    select 1 from public.alerts
     where surgery_id is not distinct from new.surgery_id
       and type = new.delay_type
       and status = 'active'
  ) then
    return new;
  end if;

  select s.surgery_no, p.name, p.patient_code, ot.code
    into v_surgery_no, v_patient_name, v_patient_code, v_ot_code
    from public.surgeries s
    left join public.patients p on p.id = s.patient_id
    left join public.operating_theatres ot on ot.id = s.ot_id
   where s.id = new.surgery_id;

  v_alert_no := 'A-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.alerts
    (alert_no, severity, type, surgery_id, patient_id, ot_id, message, responsible_role, status, root_cause)
  values (
    v_alert_no,
    'critical',
    new.delay_type,
    new.surgery_id,
    (select patient_id from public.surgeries where id = new.surgery_id),
    new.ot_id,
    coalesce(v_patient_name || ' (' || v_patient_code || ') ', '')
      || 'is delayed for ' || coalesce(v_surgery_no, 'case') || ' at '
      || coalesce(v_ot_code, 'OT') || '. ' || coalesce(new.cause, new.delay_type) || '.',
    coalesce(new.responsible, 'Ward Transport Coordinator'),
    'active',
    new.delay_type
  );

  return new;
end;
$$;

drop trigger if exists trg_delay_event_alert on public.delay_events;
create trigger trg_delay_event_alert
  after insert on public.delay_events
  for each row execute function public.alert_on_delay_event();

-- ---------- simulate_delay: the trigger now owns alert creation,
-- so a simulated delay produces exactly one alert ----------
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
  v_event_no text;
begin
  select * into v_surgery from public.surgeries where id = p_surgery_id;
  if not found then
    raise exception 'surgery % not found', p_surgery_id;
  end if;

  v_event_no := 'D-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6));

  insert into public.delay_events (event_no, surgery_id, ot_id, delay_type, delay_minutes, cause, responsible, status)
  values (v_event_no, v_surgery.id, v_surgery.ot_id, p_delay_type, p_minutes, p_cause, p_responsible, 'pending');

  update public.surgeries
     set status = 'delayed', delay_minutes = p_minutes, current_phase = 'Patient In Transit', progress = greatest(progress, 75)
   where id = v_surgery.id;

  update public.operating_theatres
     set status = 'delayed', is_delayed = true, delay_minutes = p_minutes
   where id = v_surgery.ot_id;

  return jsonb_build_object('ok', true, 'event_no', v_event_no, 'surgery_no', v_surgery.surgery_no);
end;
$$;