"use client";

import { WorkExperience } from "@/types/portfolio";
import { normalizeDomain } from "./utils";

/**
 * Get visible work experiences for a domain (public)
 */
export async function getVisibleWorkExperiences(
  domain: string
): Promise<WorkExperience[]> {
  const normalizedDomain = normalizeDomain(domain);
  try {
    const response = await fetch(
      `/api/work-experiences/by-domain?domain=${encodeURIComponent(normalizedDomain)}`
    );
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching visible work experiences:", error);
    return [];
  }
}

/**
 * Get all work experiences for the current user
 */
export async function getWorkExperiencesForCurrentUser(): Promise<
  WorkExperience[]
> {
  try {
    const response = await fetch("/api/work-experiences/me");
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching user work experiences:", error);
    return [];
  }
}

/**
 * Add a new work experience
 */
export async function addWorkExperience(
  experience: Omit<
    WorkExperience,
    "id" | "user_id" | "created_at" | "is_current"
  > & { is_current?: boolean }
): Promise<WorkExperience | null> {
  const response = await fetch("/api/work-experiences/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(experience),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error adding work experience:", error);
    return null;
  }
  return response.json();
}

/**
 * Update a work experience
 */
export async function updateWorkExperience(
  id: string,
  experience: Partial<WorkExperience>
): Promise<WorkExperience | null> {
  const response = await fetch(`/api/work-experiences/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(experience),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error updating work experience:", error);
    return null;
  }
  return response.json();
}

/**
 * Delete a work experience
 */
export async function deleteWorkExperience(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/work-experiences/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting work experience:", error);
    return false;
  }
}

/**
 * Set a work experience as the primary one
 */
export async function setPrimaryWorkExperience(id: string): Promise<boolean> {
  const response = await fetch(`/api/work-experiences/${id}/set-primary`, {
    method: "POST",
  });
  return response.ok;
}

/**
 * Alias for setPrimaryWorkExperience for backward compatibility
 */
export const setAsCurrent = setPrimaryWorkExperience;

/**
 * Get current work experience for a domain (public)
 * Returns the work experience marked as "current" or the most recent one
 */
export async function getCurrentWork(
  domain: string
): Promise<WorkExperience | null> {
  const normalizedDomain = normalizeDomain(domain);
  try {
    const response = await fetch(
      `/api/work-experiences/current?domain=${encodeURIComponent(normalizedDomain)}`
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching current work experience:", error);
    return null;
  }
}
