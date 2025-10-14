import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const SUPABASE_URL = 'https://lctvqkipwdedkcmypstq.supabase.co'
const SUPABASE_PUBLISHABLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjdHZxa2lwd2RlZGtjbXlwc3RxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzYzMDUsImV4cCI6MjA3NjAxMjMwNX0.319o8G9ZXheOtXC3rZmWywOnZmyXgJtVtNY6NfLV4ak'

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
)
