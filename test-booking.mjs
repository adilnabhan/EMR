import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nppecizkkmuqmkcelsmm.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcGVjaXpra211cW1rY2Vsc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjI3MTEsImV4cCI6MjA5MDMzODcxMX0.2ykqY4RPp8Nyu4ORQ4DCTEVLZSNd1qmsue_dvTuMLnA"

const supabase = createClient(supabaseUrl, supabaseKey)

async function testBooking() {
  const { data: patient } = await supabase.from('patients').select('id').limit(1).single()
  const { data: room } = await supabase.from('rooms').select('id, price_per_day').eq('status', 'available').limit(1).single()

  if (!patient || !room) {
    console.log('Need at least 1 patient and 1 available room'); return;
  }

  const bookingData = { patient_id: patient.id, room_id: room.id, days: 2, advance: 500 }
  const total = bookingData.days * room.price_per_day
  const balance = total - bookingData.advance

  console.log('Attempting insert with:', {
    patient_id: bookingData.patient_id,
    room_id: bookingData.room_id,
    days: bookingData.days,
    total, advance: bookingData.advance, balance, status: 'active',
  })

  const { data, error } = await supabase
    .from('bookings')
    .insert([{
      patient_id: bookingData.patient_id,
      room_id: bookingData.room_id,
      days: bookingData.days,
      total,
      advance: bookingData.advance,
      balance,
      status: 'active',
    }])
    .select()

  if (error) {
    console.error('Supabase Error:', error)
  } else {
    console.log('Success:', data)
  }
}

testBooking()
