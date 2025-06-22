"use server"

import { supabase } from "@/lib/supabase"

export async function setupBackofficeDatabase() {
  try {
    // Check if the backoffice_admins table exists
    const { error: tableCheckError } = await supabase.from("backoffice_admins").select("count").limit(1).single()

    if (tableCheckError && tableCheckError.code === "PGRST116") {
      // Table doesn't exist, create it using SQL
      const { error: createTableError } = await supabase.rpc("exec_sql", {
        sql_query: `
            CREATE TABLE IF NOT EXISTS backoffice_admins (
              id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
              email TEXT UNIQUE NOT NULL,
              password TEXT NOT NULL,
              token TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `,
      })

      if (createTableError) {
        console.error("Error creating table via RPC:", createTableError)

        // Alternative approach: try direct SQL (requires more permissions)
        const { error: directSqlError } = await supabase.auth.admin.createUser({
          email: "temp@example.com",
          password: "tempPassword123",
          email_confirm: true,
          user_metadata: { is_admin: true },
        })

        if (directSqlError) {
          console.error("Error with direct SQL approach:", directSqlError)
          return { success: false, error: "Could not create backoffice_admins table" }
        }
      }

      return { success: true, message: "Backoffice database setup complete" }
    }

    return { success: true, message: "Backoffice database already set up" }
  } catch (error: any) {
    console.error("Error setting up backoffice database:", error)
    return {
      success: false,
      error: "Error setting up backoffice database: " + (error.message || JSON.stringify(error)),
    }
  }
}
