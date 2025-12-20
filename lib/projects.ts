"use client";

import { deleteFile } from "./storage";
import { Project } from "@/types/portfolio";
import { normalizeDomain } from "./utils";

/**
 * Upload a project image (optimized server-side)
 */
export async function uploadProjectImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/projects/upload-image", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload project image");
  }

  const data = await res.json();
  return data.publicUrl;
}

/**
 * Delete a project image
 */
export async function deleteProjectImage(userId: string, imageUrl: string): Promise<boolean> {
  const pathSegments = imageUrl.split("/");
  const fileName = pathSegments[pathSegments.length - 1];
  const filePath = `${userId}/${fileName}`;

  try {
    await deleteFile("project-images", filePath);
    return true;
  } catch (error) {
    console.error("Error deleting project image:", error);
    throw error;
  }
}

/**
 * Get projects for a domain (public, published only)
 */
export async function getProjects(domain: string): Promise<Project[]> {
  const normalizedDomain = normalizeDomain(domain);
  try {
    const response = await fetch(`/api/projects/by-domain?domain=${encodeURIComponent(normalizedDomain)}`);
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

/**
 * Get all projects for the current authenticated user
 */
export async function getProjectsForCurrentUser(): Promise<Project[]> {
  try {
    const response = await fetch("/api/projects/me");
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching user projects:", error);
    return [];
  }
}

/**
 * Get a single project by ID (public, published only)
 */
export async function getProjectById(id: string, domain: string): Promise<Project | null> {
  const normalizedDomain = normalizeDomain(domain);
  try {
    const response = await fetch(
      `/api/projects/${id}?domain=${encodeURIComponent(normalizedDomain)}`
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching project by id:", error);
    return null;
  }
}

/**
 * Get featured projects for a domain
 */
export async function getFeaturedProjects(domain: string): Promise<Project[]> {
  const normalizedDomain = normalizeDomain(domain);
  try {
    const response = await fetch(
      `/api/projects/by-domain?domain=${encodeURIComponent(normalizedDomain)}&featured=true`
    );
    if (!response.ok) {
      return [];
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching featured projects:", error);
    return [];
  }
}

/**
 * Add a new project
 */
export async function addProject(
  project: Omit<Project, "id" | "created_at" | "user_id">
): Promise<Project | null> {
  const response = await fetch("/api/projects/me", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...project,
      image: project.image || "/placeholder.svg",
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to add project");
  }

  return response.json();
}

/**
 * Update an existing project
 */
export async function updateProject(
  id: string,
  project: Partial<Project>
): Promise<Project | null> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(project),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update project");
  }

  return response.json();
}

/**
 * Delete a project
 */
export async function deleteProject(id: string): Promise<boolean> {
  const response = await fetch(`/api/projects/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to delete project");
  }

  return true;
}
