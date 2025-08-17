import { createClient } from '@supabase/supabase-js'

// These are your Supabase credentials
const supabaseUrl = 'https://dxahjapyammwtsdmoeah.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4YWhqYXB5YW1td3RzZG1vZWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzOTUxOTIsImV4cCI6MjA3MDk3MTE5Mn0.YOQo_BMjNFCHzAu_15foSa_c2J423fZTa0c4r3yzMTk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)