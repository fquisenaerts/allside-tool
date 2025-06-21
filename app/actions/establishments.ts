"use server"

import { createServerClient } from "@/lib/supabase"

export interface Establishment {
  id: string
  name: string
  address: string
  phone?: string
  email?: string
  website?: string
  description?: string
  category: string
  rating?: number
  image_url?: string
  created_at: string
  updated_at: string
}

export async function getEstablishmentById(id: string): Promise<Establishment | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("establishments").select("*").eq("id", id).single()

    if (error) {
      console.error("Error fetching establishment:", error)
      return null
    }

    return data as Establishment
  } catch (error) {
    console.error("Error in getEstablishmentById:", error)
    return null
  }
}

export async function getAllEstablishments(): Promise<Establishment[]> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("establishments").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching establishments:", error)
      return []
    }

    return data as Establishment[]
  } catch (error) {
    console.error("Error in getAllEstablishments:", error)
    return []
  }
}

export async function createEstablishment(
  establishment: Omit<Establishment, "id" | "created_at" | "updated_at">,
): Promise<Establishment | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("establishments").insert([establishment]).select().single()

    if (error) {
      console.error("Error creating establishment:", error)
      return null
    }

    return data as Establishment
  } catch (error) {
    console.error("Error in createEstablishment:", error)
    return null
  }
}

export async function updateEstablishment(id: string, updates: Partial<Establishment>): Promise<Establishment | null> {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase.from("establishments").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("Error updating establishment:", error)
      return null
    }

    return data as Establishment
  } catch (error) {
    console.error("Error in updateEstablishment:", error)
    return null
  }
}

export async function deleteEstablishment(id: string): Promise<boolean> {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("establishments").delete().eq("id", id)

    if (error) {
      console.error("Error deleting establishment:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Error in deleteEstablishment:", error)
    return false
  }
}
