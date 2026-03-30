import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nppecizkkmuqmkcelsmm.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcGVjaXpra211cW1rY2Vsc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjI3MTEsImV4cCI6MjA5MDMzODcxMX0.2ykqY4RPp8Nyu4ORQ4DCTEVLZSNd1qmsue_dvTuMLnA"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testSupabase() {
  console.log('Inserting default admin...')
  const { data: empData, error: empError } = await supabase
    .from('employees')
    .insert([
      { name: 'System Admin', email: 'admin@medcore.com', role: 'admin', phone: '1234567890' }
    ])

  if (empError) {
    if (empError.code === '23505') console.log('Admin already exists!')
    else console.error('Error inserting admin:', empError)
  } else {
    console.log('Inserted admin user: admin@medcore.com')
  }

  console.log('Inserting default patient...')
  const { data: patData, error: patError } = await supabase
    .from('patients')
    .insert([
      { name: 'John Doe Patient', phone: '9999999999', age: 30, aadhaar: '123412341234', blood_group: 'O+' }
    ])

  if (patError) {
    if (patError.code === '23505') console.log('Patient already exists!')
    else console.error('Error inserting patient:', patError)
  } else {
    console.log('Inserted patient user with phone: 9999999999')
  }
}

testSupabase()
