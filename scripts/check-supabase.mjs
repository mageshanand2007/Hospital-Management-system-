import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv(file) {
  const vars = {}
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m) vars[m[1]] = m[2]
  }
  return vars
}

const env = loadEnv(new URL('../.env', import.meta.url))
const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('FAIL: missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env')
  process.exit(1)
}

const supabase = createClient(url, key)

const candidates = [
  'surgeries', 'surgery', 'alerts', 'kpis', 'ot_utilization', 'root_causes',
  'cssd_trays', 'patients', 'rooms', 'otel', 'otel_surgery', 'rooms', 'surgeons',
]

async function tryReadTable(table) {
  const { data, error, status } = await supabase.from(table).select('*').limit(2)
  if (error) {
    return { table, status, error: error.message }
  }
  return { table, status, rows: data.length, sample: data[0] }
}

async function main() {
  const introspect = await fetch(`${url}/rest/v1/`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  })
  const body = await introspect.text()
  console.log('OpenAPI introspect:', introspect.status, body.slice(0, 300))

  console.log('Probing candidate tables...')
  let found = false
  for (const table of candidates) {
    const res = await tryReadTable(table)
    if (res.status && res.status < 300 && !res.error) {
      console.log(`FOUND "${table}" -> ${res.rows} row(s). Sample:`)
      console.log(JSON.stringify(res.sample, null, 2))
      found = true
    } else {
      console.log(`skip ${table}: HTTP ${res.status} (${res.error || 'ok'})`)
    }
  }

  if (!found) {
    console.log('No candidate table readable by the anon/publishable key.')
    console.log('This usually means RLS policies / grants are not set for the anon role.')
  }
}

main()