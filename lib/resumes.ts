"use client";

import { getPublicUrl } from "./storage";
import { Resume, UploadedResume } from "@/types/portfolio";
import { normalizeDomain } from "./utils";

// ========== UPLOADED RESUMES FUNCTIONS ==========

/**
 * Create a record for an uploaded resume file
 */
export async function createUploadedResume(
  file: File,
  userId: string,
  filePath: string,
  publicUrl: string
): Promise<UploadedResume | null> {
  const response = await fetch("/api/resumes/uploaded", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      filePath,
      publicUrl,
      originalFilename: file.name,
      fileSize: file.size,
    }),
  });

  if (!response.ok) {
    console.error("Error creating uploaded resume record");
    return null;
  }
  return response.json();
}

/**
 * Get all uploaded resumes for the current user
 */
export async function getUploadedResumesForCurrentUser(): Promise<UploadedResume[]> {
  try {
    const response = await fetch("/api/resumes/uploaded");
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching uploaded resumes:", error);
    return [];
  }
}

/**
 * Delete an uploaded resume
 */
export async function deleteUploadedResume(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/resumes/uploaded/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting uploaded resume:", error);
    return false;
  }
}

// ========== RESUME PDF UPLOAD ==========

/**
 * Upload a resume PDF file and create a record
 */
export async function uploadResumePdf(
  file: File,
  userId: string,
  role: string
): Promise<UploadedResume | null> {
  // Ensure filename is safe
  const safeRole = role ? role.replace(/[^a-zA-Z0-9-_]/g, "-") : "resume";

  try {
    const form = new FormData();
    form.append("file", file);
    form.append("role", role);

    const res = await fetch("/api/resumes/upload", { method: "POST", body: form });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("Error uploading resume PDF:", err);
      return null;
    }

    const uploaded = await res.json();
    return uploaded as UploadedResume;
  } catch (error) {
    console.error("Error uploading resume PDF:", error);
    return null;
  }
}

/**
 * Get public URL for a resume file
 */
export function getResumePublicUrl(filePath: string): string | null {
  try {
    return getPublicUrl("resumes", filePath);
  } catch {
    return null;
  }
}

// ========== RESUME DATA FUNCTIONS ==========

/**
 * Get the active resume for a domain
 */
export async function getActiveResume(domain: string): Promise<Resume | null> {
  const normalizedDomain = normalizeDomain(domain);
  try {
    const response = await fetch(
      `/api/resumes/active?domain=${encodeURIComponent(normalizedDomain)}`
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching active resume:", error);
    return null;
  }
}

/**
 * Get all resumes for the current user
 */
export async function getResumesForCurrentUser(): Promise<Resume[]> {
  try {
    const response = await fetch("/api/resumes/me");
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching current user resumes:", error);
    return [];
  }
}

/**
 * Add a new resume
 */
export async function addResume(
  resume: Omit<Resume, "id" | "user_id" | "created_at">
): Promise<Resume | null> {
  const response = await fetch("/api/resumes/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resume),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error adding resume:", error);
    return null;
  }
  return response.json();
}

/**
 * Update an existing resume
 */
export async function updateResume(
  id: string,
  resume: Partial<Resume>
): Promise<Resume | null> {
  const response = await fetch(`/api/resumes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(resume),
  });

  if (!response.ok) {
    const error = await response.json();
    console.error("Error updating resume:", error);
    return null;
  }
  return response.json();
}

/**
 * Delete a resume
 */
export async function deleteResume(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/resumes/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting resume:", error);
    return false;
  }
}
