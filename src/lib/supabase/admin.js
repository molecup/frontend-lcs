import { createClient } from '@supabase/supabase-js';

let cachedClient = null;

export const getSupabaseAdmin = () => {
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error('Supabase env vars missing: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false }
  });

  return cachedClient;
};

