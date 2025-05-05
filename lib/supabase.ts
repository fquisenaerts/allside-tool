import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a Supabase client with the public anon key
export const supabase = createSupabaseClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

// Create a Supabase admin client with the service role key (for server-side operations)
export function createClient(supabaseUrl: string, supabaseKey: string, options?: any) {
  return createSupabaseClient(supabaseUrl, supabaseKey, options)
}
