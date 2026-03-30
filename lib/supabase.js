import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nppecizkkmuqmkcelsmm.supabase.co"
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5wcGVjaXpra211cW1rY2Vsc21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NjI3MTEsImV4cCI6MjA5MDMzODcxMX0.2ykqY4RPp8Nyu4ORQ4DCTEVLZSNd1qmsue_dvTuMLnA"

export const supabase = createClient(supabaseUrl, supabaseKey)
