"use client";

import { supabase } from "./supabase";
import { WorkExperience } from "@/types/portfolio";

async function getUserIdByDomain(domain: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("domain", domain)
    .single();
  if (error || !data) {
    console.error("Error fetching user by domain:", error?.message);
    return null;
  }
  return data.id;
}

// Public/domain-scoped: only return visible experiences, newest first
export async function getVisibleWorkExperiences(
  domain: string
): Promise<WorkExperience[]> {
  const userId = await getUserIdByDomain(domain);
  if (!userId) return [];

  const { data, error } = await supabase
    .from("work_experiences")
    .select("*")
    .eq("user_id", userId)
    .eq("visible", true)
    .order("is_current", { ascending: false })
    .order("end_date", { ascending: false, nullsFirst: true })
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching visible work experiences:", error);
    return [];
  }
  return (data as WorkExperience[]) || [];
}

// Admin: list for current user
export async function getWorkExperiencesForCurrentUser(): Promise<
  WorkExperience[]
> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from("work_experiences")
    .select("*")
    .eq("user_id", session.user.id)
    .order("is_current", { ascending: false })
    .order("end_date", { ascending: false, nullsFirst: true })
    .order("start_date", { ascending: false });

  if (error) {
    console.error("Error fetching user work experiences:", error);
    return [];
  }
  return (data as WorkExperience[]) || [];
}

export async function addWorkExperience(
  experience: Omit<
    WorkExperience,
    "id" | "user_id" | "created_at" | "is_current"
  > & { is_current?: boolean }
): Promise<WorkExperience | null> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const payload = {
    ...experience,
    user_id: session.user.id,
    // normalize empty end_date if current
    end_date: experience.is_current ? null : experience.end_date ?? null,
  };

  const { data, error } = await supabase
    .from("work_experiences")
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error("Error adding work experience:", error);
    throw error;
  }
  return data as WorkExperience;
}

export async function updateWorkExperience(
  id: string,
  patch: Partial<WorkExperience>
): Promise<WorkExperience | null> {
  // If toggling is_current to true, end_date should be null
  const normalized = {
    ...patch,
    end_date:
      patch.is_current === true
        ? null
        : patch.end_date === undefined
        ? undefined
        : patch.end_date,
  } as Partial<WorkExperience>;

  const { data, error } = await supabase
    .from("work_experiences")
    .update(normalized)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating work experience:", error);
    throw error;
  }
  return data as WorkExperience;
}

export async function deleteWorkExperience(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("work_experiences")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting work experience:", error);
    throw error;
  }
  return true;
}

export async function getCurrentWork(
  domain: string
): Promise<WorkExperience | null> {
  const list = await getVisibleWorkExperiences(domain);
  // Prefer current; otherwise latest by end_date/start_date
  return list.find((w) => w.is_current) || list[0] || null;
}
