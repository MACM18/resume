"use client";

// Storage operations are performed on the server via API endpoints.
import { AboutPageData, HomePageData, Profile, Theme } from "@/types/portfolio";
import { normalizeDomain } from "./utils";

interface ProfileData {
  full_name: string;
  tagline: string;
  home_page_data: HomePageData;
  about_page_data: AboutPageData;
  avatar_url: string | null;
  avatar_position?: { x: number; y: number };
  avatar_zoom?: number;
  avatar_size?: number;
  background_image_url: string | null;
  favicon_url?: string | null;
  contact_numbers?: {
    id: string;
    number: string;
    label: string;
    isActive: boolean;
    isPrimary: boolean;
  }[];
}

/**
 * Default profile data for new users
 */
export function getDefaultProfileData(
  email: string,
  fullName: string = "New User",
) {
  return {
    fullName,
    tagline: "Welcome to my portfolio",
    homePageData: {
      name: fullName,
      tagline: "Welcome to my portfolio",
      socialLinks: [],
      experienceHighlights: [],
      technicalExpertise: [],
      achievements: [],
      callToAction: {
        title: "Let's Connect",
        description: "I'm always open to discussing new opportunities.",
        email: email,
      },
    } as HomePageData,
    aboutPageData: {
      title: "About Me",
      subtitle: "My Journey",
      story: ["Tell your story here..."],
      skills: [],
      callToAction: {
        title: "Get in Touch",
        description: "Let's work together!",
        email: email,
      },
    } as AboutPageData,
    theme: {
      primary: "221 83% 53%",
      "primary-glow": "221 83% 63%",
      "primary-muted": "221 83% 23%",
      "primary-foreground": "0 0% 100%",
      accent: "280 80% 50%",
      "accent-glow": "280 80% 60%",
    } as Theme,
  };
}

/**
 * Ensures authenticated user has a profile record.
 * This is now handled server-side via API route.
 * Call POST /api/profile/ensure to create profile if needed.
 */
export async function ensureUserProfile(): Promise<Profile | null> {
  try {
    const response = await fetch("/api/profile/ensure", {
      method: "POST",
    });
    if (!response.ok) {
      console.error("Failed to ensure user profile");
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error ensuring user profile:", error);
    return null;
  }
}

/**
 * Get profile data by domain (client-side)
 */
export async function getProfileData(
  domain: string,
): Promise<ProfileData | null> {
  const normalizedDomain = normalizeDomain(domain);
  try {
    const response = await fetch(
      `/api/profile/by-domain?domain=${encodeURIComponent(normalizedDomain)}`,
    );
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error(
      "Error fetching profile data for domain:",
      normalizedDomain,
      error,
    );
    return null;
  }
}

/**
 * Get current authenticated user's profile
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const response = await fetch("/api/profile/me");
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching current user profile:", error);
    return null;
  }
}

/**
 * Update current user's profile
 */
export async function updateCurrentUserProfile(
  profileData: Partial<Profile>,
): Promise<Profile> {
  // Remove id and user_id from update payload (they shouldn't be changed)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, user_id: _userId, ...updateData } = profileData;

  const response = await fetch("/api/profile/me", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update profile");
  }

  return response.json();
}

/**
 * Upload a profile image
 */
export async function uploadProfileImage(file: File): Promise<string> {
  // Upload via server endpoint to avoid exposing SDK/credentials to client
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/profile/images", {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload image");
  }

  const data = await res.json();
  return data.publicUrl;
}

/**
 * Get all profile images for a user
 */
export async function getProfileImages(): Promise<string[]> {
  try {
    const res = await fetch(`/api/profile/images`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch images");
    }
    return res.json();
  } catch (error) {
    console.error("Error listing profile images:", error);
    throw error;
  }
}

/**
 * Get all background images for a user
 */
export async function getBackgroundImages(): Promise<string[]> {
  try {
    const res = await fetch(`/api/profile/images?bucket=background-images`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch background images");
    }
    return res.json();
  } catch (error) {
    console.error("Error listing background images:", error);
    throw error;
  }
}

/**
 * Delete a profile image
 */
export async function deleteProfileImage(imageUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/profile/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete image");
    }

    return true;
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Gallery helpers (these behave similarly to the profile image helpers above, but
// operate on a separate S3 folder/bucket so that photos can be shown on the
// public gallery page and managed independently in the admin panel.)

export interface GalleryImage {
  id: string;
  url: string;
  albumName?: string | null;
  createdAt: string;
}

/**
 * Upload a gallery photo. Optional albumName may be provided for organization.
 */
export async function uploadGalleryImage(
  file: File,
  albumName?: string,
): Promise<GalleryImage> {
  const form = new FormData();
  form.append("file", file);
  if (albumName) form.append("albumName", albumName);

  const res = await fetch("/api/gallery/images", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload gallery image");
  }
  const data = await res.json();
  // the API returns publicUrl; the calling code will typically refetch the
  // full list to get metadata such as id/createdAt.
  return {
    id: "",
    url: data.publicUrl,
    albumName: albumName || null,
    createdAt: new Date().toISOString(),
  };
}

/**
 * List all gallery photos for the authenticated user.
 */
export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const res = await fetch(`/api/gallery/images`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch gallery images");
    }
    return res.json();
  } catch (error) {
    console.error("Error listing gallery images:", error);
    throw error;
  }
}

/**
 * Delete a gallery photo by URL.
 */
export async function deleteGalleryImage(imageId: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/gallery/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: imageId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete gallery image");
    }

    return true;
  } catch (error) {
    console.error("Error deleting gallery image:", error);
    throw error;
  }
}

/**
 * Fetch gallery images for a specific domain. This is useful for client-side
 * components that want to render someone else's gallery (or the current domain)
 * without requiring a server component.
 */
export async function getGalleryImagesForDomain(
  domain: string,
): Promise<GalleryImage[]> {
  try {
    const res = await fetch(
      `/api/gallery/images?domain=${encodeURIComponent(domain)}`,
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to fetch gallery images");
    }
    return res.json();
  } catch (error) {
    console.error("Error fetching gallery images for domain:", error);
    throw error;
  }
}

/**
 * Update a gallery image's metadata (album name)
 */
export async function updateGalleryImage(
  imageId: string,
  albumName: string | null,
): Promise<boolean> {
  const res = await fetch("/api/gallery/images", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: imageId, albumName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to update gallery image");
  }
  return true;
}

/**
 * Retrieve list of album names for a given domain (or current user if no domain).
 */
export async function getGalleryAlbums(domain?: string): Promise<string[]> {
  const url = domain
    ? `/api/gallery/albums?domain=${encodeURIComponent(domain)}`
    : "/api/gallery/albums";
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch gallery albums");
  }
  return res.json();
}

/**
 * Upload a background image
 */
export async function uploadBackgroundImage(file: File): Promise<string> {
  // Upload via server endpoint
  const form = new FormData();
  form.append("file", file);
  form.append("bucket", "background-images");

  const res = await fetch("/api/profile/images", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload background image");
  }
  const data = await res.json();
  return data.publicUrl;
}

/**
 * Delete a background image
 */
export async function deleteBackgroundImage(
  imageUrl: string,
): Promise<boolean> {
  try {
    const res = await fetch(`/api/profile/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, bucket: "background-images" }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete background image");
    }

    return true;
  } catch (error) {
    console.error("Error deleting background image:", error);
    throw error;
  }
}

/**
 * Upload a favicon
 */
export async function uploadFavicon(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("bucket", "favicons");

  const res = await fetch("/api/profile/images", {
    method: "POST",
    body: form,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to upload favicon");
  }
  const data = await res.json();
  return data.publicUrl;
}

/**
 * Delete a favicon
 */
export async function deleteFavicon(imageUrl: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/profile/images`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl, bucket: "favicons" }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Failed to delete favicon");
    }

    return true;
  } catch (error) {
    console.error("Error deleting favicon:", error);
    throw error;
  }
}
