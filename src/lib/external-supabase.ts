import { createClient } from '@supabase/supabase-js';

// External Supabase project (bypasses Lovable Cloud)
const EXTERNAL_SUPABASE_URL = 'https://ksgxmwptdupqkokevhhr.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtzZ3htd3B0ZHVwcWtva2V2aGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYwNDE3NDQsImV4cCI6MjA5MTYxNzc0NH0.dAs3v0FoO-ciT3MbjA2ldEtDbhD6aFQpuZ1mDsAjDKw';

// Debug: confirm which Supabase project is being used
const maskedUrl = EXTERNAL_SUPABASE_URL.replace(/(https:\/\/).{4}(.{4}).*(.supabase\.co)/, '$1****$2****$3');
console.log('[Supabase Client] Type: CUSTOM/EXTERNAL | URL:', maskedUrl);

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
