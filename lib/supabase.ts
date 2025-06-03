import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a single instance of the Supabase client
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null

export const supabase = (() => {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  )

  return supabaseInstance
})()

export default supabase

import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// Create a singleton instance of the Supabase admin client
let adminClient: ReturnType<typeof createSupabaseClient> | null = null

export function createAdminClient() {
  if (adminClient) return adminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables")
  }

  adminClient = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return adminClient
}
