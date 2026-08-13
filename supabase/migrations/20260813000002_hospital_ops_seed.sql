-- ============================================================
-- Hospital Operations Control Tower — demo seed data
-- 10 patients · 4 OTs · 8 surgeries · readiness · 8 CSSD packs
-- 5 alerts · 5 delay events  (+ P001 Patient Transfer scenario)
-- ============================================================

-- ---------- patients ----------
insert into public.patients (id, patient_code, name, age, gender, ward, bed, contact, status) values
  ('10000000-0000-4000-8000-000000000001','P001','Ramesh Kumar',64,'M','Ward 2A','2A-03','+91 98000 10001','admitted'),
  ('10000000-0000-4000-8000-000000000002','P002','Anita Rao',41,'F','Ward 2A','2A-01','+91 98000 10002','admitted'),
  ('10000000-0000-4000-8000-000000000003','P003','Geeta Nair',58,'F','Ward 3A','3A-02','+91 98000 10003','admitted'),
  ('10000000-0000-4000-8000-000000000004','P004','Arjun Khan',29,'M','Ward 3B','3B-01','+91 98000 10004','admitted'),
  ('10000000-0000-4000-8000-000000000005','P005','Suresh Iyer',46,'M','Ward 3B','3B-04','+91 98000 10005','admitted'),
  ('10000000-0000-4000-8000-000000000006','P006','Meena Bose',52,'F','Ward 4A','4A-02','+91 98000 10006','admitted'),
  ('10000000-0000-4000-8000-000000000007','P007','Kavita Das',23,'F','Ward 4A','4A-05','+91 98000 10007','admitted'),
  ('10000000-0000-4000-8000-000000000008','P008','Vijay Anand',61,'M','ICU','ICU-01','+91 98000 10008','admitted'),
  ('10000000-0000-4000-8000-000000000009','P009','Priya Sharma',35,'F','Ward 2B','2B-01','+91 98000 10009','pre_admit'),
  ('10000000-0000-4000-8000-000000000010','P010','Naveen Gupta',50,'M','Ward 3A','3A-06','+91 98000 10010','admitted');

-- ---------- operating_theatres ----------
insert into public.operating_theatres (id, code, name, status, is_delayed, delay_minutes, utilization) values
  ('20000000-0000-4000-8000-000000000001','OT-01','OT 1 · General', 'in_use',  false, 0, 82),
  ('20000000-0000-4000-8000-000000000002','OT-02','OT 2 · Ortho',    'in_use',  false, 0, 74),
  ('20000000-0000-4000-8000-000000000003','OT-03','OT 3 · Robotic',  'delayed', true,  18, 91),
  ('20000000-0000-4000-8000-000000000004','OT-04','OT 4 · Cardiac',  'in_use',  false, 0, 60);

-- ---------- surgeries ----------
insert into public.surgeries
  (id, surgery_no, patient_id, ot_id, procedure, surgeon, scheduled_time, estimated_duration,
   status, current_phase, progress, delay_minutes) values
  ('30000000-0000-4000-8000-000000000001','S-1001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003',
   'Total Knee Replacement','Dr. Mehta','2026-08-13 08:00:00+00',150,'delayed','Patient In Transit',75,18),
  ('30000000-0000-4000-8000-000000000002','S-1002','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001',
   'Laparoscopic Cholecystectomy','Dr. Rao','2026-08-13 08:30:00+00',90,'on_track','Patient Ready',40,0),
  ('30000000-0000-4000-8000-000000000003','S-1003','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004',
   'Cataract Surgery','Dr. Nair','2026-08-13 09:00:00+00',45,'at_risk','Consent Pending',25,12),
  ('30000000-0000-4000-8000-000000000004','S-1004','10000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000001',
   'Appendectomy','Dr. Khan','2026-08-13 10:00:00+00',70,'on_track','In Pre-Op',30,0),
  ('30000000-0000-4000-8000-000000000005','S-1005','10000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000002',
   'ORIF Femur','Dr. Iyer','2026-08-13 10:30:00+00',120,'delayed','Pre-Anesthesia Pending',15,48),
  ('30000000-0000-4000-8000-000000000006','S-1006','10000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000003',
   'Hysterectomy','Dr. Bose','2026-08-13 11:00:00+00',90,'on_track','CSSD Ready',55,0),
  ('30000000-0000-4000-8000-000000000007','S-1007','10000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000002',
   'Tonsillectomy','Dr. Das','2026-08-13 12:00:00+00',45,'on_track','Scheduled',10,0),
  ('30000000-0000-4000-8000-000000000008','S-1008','10000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000004',
   'CABG','Dr. Anand','2026-08-13 13:00:00+00',240,'on_track','Scheduled',5,0);

-- ---------- patient_readiness ----------
insert into public.patient_readiness
  (id, patient_id, surgery_id, consent_signed, consent_signed_at, pre_anesthesia_cleared,
   pre_anesthesia_cleared_at, in_preop, vitals_documented, arrived_at_ot, arrived_at_ot_at,
   status, checked_by, checked_at) values
  -- P001: every prep step complete, patient has NOT arrived at OT → transfer delay
  ('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001',
   true,'2026-08-13 06:50:00+00',true,'2026-08-13 07:05:00+00',true,true,false,null,
   'in_transit','Nursing · Ward 2A','2026-08-13 07:42:00+00'),
  ('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002',
   true,'2026-08-13 07:00:00+00',true,'2026-08-13 07:10:00+00',true,true,true,'2026-08-13 08:05:00+00',
   'ready','Ward 2A · Staff Divya','2026-08-13 08:05:00+00'),
  ('40000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000003',
   false,null,true,'2026-08-13 07:30:00+00',false,true,false,null,
   'blocked','Front Desk · Maria','2026-08-13 08:40:00+00'),
  ('40000000-0000-4000-8000-000000000004','10000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000004',
   true,'2026-08-13 08:00:00+00',true,'2026-08-13 08:15:00+00',true,true,false,null,
   'pending','Ward 3A · Nurse Ravi','2026-08-13 09:20:00+00'),
  ('40000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000005','30000000-0000-4000-8000-000000000005',
   true,'2026-08-13 07:45:00+00',false,null,false,true,false,null,
   'blocked','Ward 3B · Nurse Ravi','2026-08-13 09:45:00+00'),
  ('40000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000006','30000000-0000-4000-8000-000000000006',
   true,'2026-08-13 08:20:00+00',true,'2026-08-13 08:35:00+00',false,true,false,null,
   'pending','Ward 4A · Staff Jyoti','2026-08-13 10:10:00+00'),
  ('40000000-0000-4000-8000-000000000007','10000000-0000-4000-8000-000000000007','30000000-0000-4000-8000-000000000007',
   true,'2026-08-13 09:10:00+00',true,'2026-08-13 09:25:00+00',false,true,false,null,
   'pending','Ward 4A · Staff Jyoti','2026-08-13 11:00:00+00'),
  ('40000000-0000-4000-8000-000000000008','10000000-0000-4000-8000-000000000008','30000000-0000-4000-8000-000000000008',
   true,'2026-08-13 10:00:00+00',true,'2026-08-13 10:20:00+00',false,true,false,null,
   'pending','ICU · Dr. Thomas','2026-08-13 11:40:00+00');

-- ---------- cssd_instruments ----------
insert into public.cssd_instruments
  (id, pack_code, instrument_set, surgery_id, ot_id, status, item_qty, last_action, cycle_eta, next_use) values
  ('50000000-0000-4000-8000-000000000001','T-101','Ortho Knee Set','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003',
   'released',64,'Released 07:30 · Ms. Priya',null,'2026-08-13 08:00:00+00'),
  ('50000000-0000-4000-8000-000000000002','T-102','Lap Chole Set','30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001',
   'released',36,'Released 07:55 · Ms. Priya',null,'2026-08-13 08:30:00+00'),
  ('50000000-0000-4000-8000-000000000003','T-103','Ophthalmic Set','30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004',
   'sterilizing',18,'In cycle · ETA 08:50',null,'2026-08-13 09:00:00+00'),
  ('50000000-0000-4000-8000-000000000004','T-104','General Set B','30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000001',
   'sterilizing',31,'In cycle · ETA 09:30',null,'2026-08-13 10:00:00+00'),
  ('50000000-0000-4000-8000-000000000005','T-105','Ortho Trauma Set','30000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000002',
   'assembling',58,'Assembly started · Mr. Ashok',null,'2026-08-13 10:30:00+00'),
  ('50000000-0000-4000-8000-000000000006','T-106','Gyn Basic Set','30000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000003',
   'released',42,'Released 10:20 · Ms. Priya',null,'2026-08-13 11:00:00+00'),
  ('50000000-0000-4000-8000-000000000007','T-107','ENT Micro Set','30000000-0000-4000-8000-000000000007','20000000-0000-4000-8000-000000000002',
   'assembling',18,'Awaiting wrap · Mr. Ashok',null,'2026-08-13 12:00:00+00'),
  ('50000000-0000-4000-8000-000000000008','T-108','Cardio Thoracic Set','30000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000004',
   'released',86,'Released 11:15 · Ms. Priya',null,'2026-08-13 13:00:00+00');

-- ---------- alerts ----------
insert into public.alerts
  (id, alert_no, severity, type, surgery_id, patient_id, ot_id, message, responsible_role, status, root_cause, created_at) values
  ('60000000-0000-4000-8000-000000000001','A-101','critical','Patient Transfer',
   '30000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003',
   'Ramesh Kumar (P001) has not arrived at OT-03 for Total Knee Replacement. Transfer from Ward 2A is overdue.',
   'Ward Transport Coordinator','active','Transport', now() - interval '5 minutes'),
  ('60000000-0000-4000-8000-000000000002','A-102','warning','Patient Not Ready',
   '30000000-0000-4000-8000-000000000005','10000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000002',
   'Pre-anesthesia evaluation pending. Patient still in Ward 3B.',
   'Ward 3B · Nurse Ravi','active','Patient', now() - interval '12 minutes'),
  ('60000000-0000-4000-8000-000000000003','A-103','warning','Consent Missing',
   '30000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004',
   'Informed consent form unsigned for Cataract Surgery.',
   'Front Desk · Maria','active','Pre-Op', now() - interval '20 minutes'),
  ('60000000-0000-4000-8000-000000000004','A-104','info','OT Turnover',
   null,null,'20000000-0000-4000-8000-000000000001',
   'Turnover completed ahead of schedule (12 min saved).',
   'Nursing · OT Team','resolved','Staff', now() - interval '38 minutes'),
  ('60000000-0000-4000-8000-000000000005','A-105','info','CSSD Released',
   '30000000-0000-4000-8000-000000000006','10000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000003',
   'Sterile tray T-106 released for Hysterectomy.',
   'CSSD · Ms. Priya','resolved','CSSD', now() - interval '50 minutes');

-- ---------- delay_events ----------
insert into public.delay_events
  (id, event_no, surgery_id, ot_id, delay_type, delay_minutes, cause, responsible, status, resolved_at, created_at) values
  ('70000000-0000-4000-8000-000000000001','D-1001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000003',
   'Patient Transfer',18,'Patient P001 not arrived at OT-03 from Ward 2A. All prep complete.',
   'Ward Transport Coordinator','pending',null, now() - interval '5 minutes'),
  ('70000000-0000-4000-8000-000000000002','D-1002','30000000-0000-4000-8000-000000000005','20000000-0000-4000-8000-000000000002',
   'Pre-Anesthesia Pending',48,'Pre-anesthesia evaluation pending.',
   'Anesthesia · Dr. Thomas','pending',null, now() - interval '12 minutes'),
  ('70000000-0000-4000-8000-000000000003','D-1003','30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000004',
   'Consent Pending',12,'Informed consent form unsigned.',
   'Front Desk · Maria','pending',null, now() - interval '20 minutes'),
  ('70000000-0000-4000-8000-000000000004','D-1004','30000000-0000-4000-8000-000000000006','20000000-0000-4000-8000-000000000003',
   'CSSD Not Ready',20,'Tray T-106 cycle delay, now released.',
   'CSSD · Ms. Priya','resolved', now() - interval '30 minutes', now() - interval '50 minutes'),
  ('70000000-0000-4000-8000-000000000005','D-1005','30000000-0000-4000-8000-000000000008','20000000-0000-4000-8000-000000000004',
   'Staffing',15,'Perfusionist availability, resolved.',
   'ICU · Dr. Thomas','resolved', now() - interval '25 minutes', now() - interval '40 minutes');