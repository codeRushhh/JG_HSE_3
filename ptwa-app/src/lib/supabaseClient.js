import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// True only when both env vars are present AND look like real values
// (not empty strings, not left as the .env.example placeholders).
export const isSupabaseConfigured = Boolean(
  url && anonKey &&
  !url.includes('YOUR-PROJECT-REF') &&
  !anonKey.includes('YOUR-ANON-PUBLIC-KEY')
);

// createClient() throws synchronously if the URL is missing/malformed, which
// would otherwise crash the whole React tree to a blank white screen before
// anything can render. Fall back to a harmless placeholder URL instead, and
// gate all real usage behind isSupabaseConfigured (checked in App.jsx) so the
// person always sees a clear "Supabase not connected yet" screen instead.
export const supabase = createClient(
  isSupabaseConfigured ? url : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? anonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// PTWA no longer uses Supabase Auth (that required a matching auth.users
// row to exist in whichever Supabase project is configured, which broke
// every time the app was pointed at a different/shared database). Login is
// now a fixed department password, checked in dataStore.js, same pattern
// as the JGM and JA Installation apps. Data reads/writes use the shared
// anon key like every other app in the portal.
export const HSE_PASSWORD = '2526';
