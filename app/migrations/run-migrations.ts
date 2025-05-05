import { supabase } from "@/lib/supabase"
import fs from "fs"
import path from "path"

async function runMigrations() {
  console.log("Running migrations...")

  try {
    // Read migration files
    const migrationsDir = path.join(process.cwd(), "app/migrations")
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort()

    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8")

      // Execute the SQL
      const { error } = await supabase.rpc("exec_sql", { sql })

      if (error) {
        console.error(`Error running migration ${file}:`, error)
      } else {
        console.log(`Migration ${file} completed successfully`)
      }
    }

    console.log("All migrations completed")
  } catch (error) {
    console.error("Error running migrations:", error)
  }
}

// Run the migrations
runMigrations()
