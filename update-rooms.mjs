import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nppecizkkmuqmkcelsmm.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcGVjaXpra211cW1rY2Vsc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjI3MTEsImV4cCI6MjA5MDMzODcxMX0.2ykqY4RPp8Nyu4ORQ4DCTEVLZSNd1qmsue_dvTuMLnA"

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupNewRooms() {
  console.log('Clearing old available rooms...')
  // We can only delete rooms that aren't tied to active bookings to avoid foreign key errors. 
  // Let's just insert new ones if they don't exist, or delete all 'available' rooms first.
  
  await supabase.from('rooms').delete().eq('status', 'available')

  console.log('Inserting new room definitions...')
  const newRooms = [
    { name: 'Single Room (Non-AC)', price_per_day: 2000, status: 'available' },
    { name: 'Single Room (AC)', price_per_day: 3000, status: 'available' },
    { name: 'Double Room (Non-AC)', price_per_day: 4000, status: 'available' },
    { name: 'Double Room (AC)', price_per_day: 5000, status: 'available' },
  ]
  
  const { data, error } = await supabase.from('rooms').insert(newRooms).select()
  
  if (error) {
    console.error('Failed to insert rooms:', error)
  } else {
    console.log('Successfully inserted new rooms:', data.length)
  }
}

setupNewRooms()
