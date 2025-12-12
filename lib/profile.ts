"use client";

import { uploadFile, deleteFile, listFiles, getPublicUrl } from "./storage";
import { HomePageData, AboutPageData, Profile, Theme } from "@/types/portfolio";
import { normalizeDomain } from "./utils";

interface ProfileData {
  full_name: string;
  tagline: string;
  home_page_data: HomePageData;
  about_page_data: AboutPageData;
  avatar_url: string | null;
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
export function getDefaultProfileData(email: string, fullName: string = "New User") {
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
export async function getProfileData(domain: string): Promise<ProfileData | null> {
  const normalizedDomain = normalizeDomain(domain);
  try {
    const response = await fetch(`/api/profile/by-domain?domain=${encodeURIComponent(normalizedDomain)}`);
    if (!response.ok) {
      return null;
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching profile data for domain:", normalizedDomain, error);
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
export async function updateCurrentUserProfile(profileData: Partial<Profile>): Promise<Profile> {
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
export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile("profile-images", filePath, buffer, file.type);

  console.log("Generated public URL for profile image:", result.publicUrl);
  return result.publicUrl;
}

/**
 * Get all profile images for a user
 */
export async function getProfileImages(userId: string): Promise<string[]> {
  try {
    const files = await listFiles("profile-images", userId);
    // Return only first 10 images
    return files.slice(0, 10).map((filePath) => {
      const relativePath = filePath.replace("profile-images/", "");
      return getPublicUrl("profile-images", relativePath);
    });
  } catch (error) {
    console.error("Error listing profile images:", error);
    throw error;
  }
}

/**
 * Delete a profile image
 */
export async function deleteProfileImage(userId: string, imageUrl: string): Promise<boolean> {
  const pathSegments = imageUrl.split("/");
  const fileName = pathSegments[pathSegments.length - 1];
  const filePath = `${userId}/${fileName}`;

  try {
    await deleteFile("profile-images", filePath);
    return true;
  } catch (error) {
    console.error("Error deleting profile image:", error);
    throw error;
  }
}

/**
 * Upload a background image
 */
export async function uploadBackgroundImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/background-${Date.now()}.${fileExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile("background-images", filePath, buffer, file.type);

  console.log("Generated public URL for background image:", result.publicUrl);
  return result.publicUrl;
}

/**
 * Delete a background image
 */
export async function deleteBackgroundImage(userId: string, imageUrl: string): Promise<boolean> {
  const pathSegments = imageUrl.split("/");
  const fileName = pathSegments[pathSegments.length - 1];
  const filePath = `${userId}/${fileName}`;

  try {
    await deleteFile("background-images", filePath);
    return true;
  } catch (error) {
    console.error("Error deleting background image:", error);
    throw error;
  }
}

/**
 * Upload a favicon
 */
export async function uploadFavicon(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/favicon-${Date.now()}.${fileExt}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await uploadFile("favicons", filePath, buffer, file.type);

  console.log("Generated public URL for favicon:", result.publicUrl);
  return result.publicUrl;
}

/**
 * Delete a favicon
 */
export async function deleteFavicon(userId: string, imageUrl: string): Promise<boolean> {
  const pathSegments = imageUrl.split("/");
  const fileName = pathSegments[pathSegments.length - 1];
  const filePath = `${userId}/${fileName}`;

  try {
    await deleteFile("favicons", filePath);
    return true;
  } catch (error) {
    console.error("Error deleting favicon:", error);
    throw error;
  }
}
