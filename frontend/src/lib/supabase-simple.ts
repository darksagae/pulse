// Simple Supabase client for testing
// @ts-ignore
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://fqhulfipcitbfyhwypos.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxaHVsZmlwY2l0YmZ5aHd5cG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMjQwNTksImV4cCI6MjA3MjcwMDA1OX0.8LDzhBRJ-CUzIAUImY9XX2pNBm571bkf-0DoaJSGxC4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Simple test function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Supabase error:', error)
      return false
    }
    
    console.log('Supabase connected successfully!', data)
    return true
  } catch (err) {
    console.error('Connection error:', err)
    return false
  }
}
