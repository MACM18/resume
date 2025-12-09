"use client";

import { supabase } from './supabase';
import { HomePageData, AboutPageData, Profile } from '@/types/portfolio';
import { normalizeDomain } from './utils';

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
function getDefaultProfileData(email: string, fullName: string = "New User") {
  return {
    full_name: fullName,
    tagline: "Welcome to my portfolio",
    home_page_data: {
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
    },
    about_page_data: {
      title: "About Me",
      subtitle: "My Journey",
      story: ["Tell your story here..."],
      skills: [],
      callToAction: {
        title: "Get in Touch",
        description: "Let's work together!",
        email: email,
      },
    },
    theme: {
      primary: "221 83% 53%",
      "primary-glow": "221 83% 63%",
      "primary-muted": "221 83% 23%",
      "primary-foreground": "0 0% 100%",
      accent: "280 80% 50%",
      "accent-glow": "280 80% 60%",
    },
  };
}

/**
 * Ensures authenticated user has a profile record.
 * Creates one if it doesn't exist.
 * Call this after login/signup or in AuthProvider.
 */
export async function ensureUserProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const userId = session.user.id;
  const email = session.user.email || "";
  const fullName = session.user.user_metadata?.full_name || "New User";

  // Check if profile exists
  const { data: existingProfile, error: fetchError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  // Profile exists, return it
  if (existingProfile) {
    return existingProfile;
  }

  // PGRST116 means no rows found - this is expected for new users
  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error("Error checking for existing profile:", fetchError);
    return null;
  }

  // Create new profile
  const defaultData = getDefaultProfileData(email, fullName);
  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert([{
      user_id: userId,
      ...defaultData,
    }])
    .select()
    .single();

  if (insertError) {
    console.error("Error creating profile:", insertError);
    return null;
  }

  console.log("Created new profile for user:", userId);
  return newProfile;
}

export async function getProfileData(domain: string): Promise<ProfileData | null> {
  const normalizedDomain = normalizeDomain(domain);
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, tagline, home_page_data, about_page_data, avatar_url, background_image_url, contact_numbers')
    .eq('domain', normalizedDomain)
    .single();

  if (error) {
    // PGRST116 means no rows found - this is expected for unclaimed domains
    if (error.code !== 'PGRST116') {
      console.error('Error fetching profile data for domain:', normalizedDomain, error);
    }
    return null;
  }
  
  return data;
}

export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', session.user.id)
    .single();
  
  if (error) {
    // If no profile found, try to create one
    if (error.code === 'PGRST116') {
      return ensureUserProfile();
    }
    console.error("Error fetching current user profile:", error);
    return null;
  }
  return data;
}

export async function updateCurrentUserProfile(profileData: Partial<Profile>) {
    const { data: { session } = { session: null } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    // Remove id and user_id from update payload (they shouldn't be changed)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, user_id: _userId, ...updateData } = profileData;

    const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', session.user.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
    return data;
}

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
  // Verify user is authenticated before uploading
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to upload an image.');
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`; // Store in user-specific folder

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading profile image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('profile-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function getProfileImages(userId: string): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from('profile-images')
    .list(userId, {
      limit: 10, // Enforce max 10 images
      sortBy: { column: 'created_at', order: 'desc' },
    });

  if (error) {
    console.error('Error listing profile images:', error);
    throw error;
  }

  return data.map(file => supabase.storage.from('profile-images').getPublicUrl(`${userId}/${file.name}`).data.publicUrl);
}

export async function deleteProfileImage(userId: string, imageUrl: string): Promise<boolean> {
  const pathSegments = imageUrl.split('/');
  const fileName = pathSegments[pathSegments.length - 1];
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from('profile-images')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting profile image:', error);
    throw error;
  }
  return true;
}

export async function uploadBackgroundImage(file: File, userId: string): Promise<string> {
  // Verify user is authenticated before uploading
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to upload an image.');
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${userId}/background-${Date.now()}.${fileExt}`; // Store in user-specific folder

  const { error: uploadError } = await supabase.storage
    .from('background-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading background image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('background-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteBackgroundImage(userId: string, imageUrl: string): Promise<boolean> {
  const pathSegments = imageUrl.split('/');
  const fileName = pathSegments[pathSegments.length - 1];
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from('background-images')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting background image:', error);
    throw error;
  }
  return true;
}

export async function uploadFavicon(file: File, userId: string): Promise<string> {
  // Verify user is authenticated before uploading
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to upload a favicon.');
  }

  const fileExt = file.name.split('.').pop();
  // Preserve .ico extension if provided
  const filePath = `${userId}/favicon-${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('favicons')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading favicon:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('favicons')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteFavicon(userId: string, imageUrl: string): Promise<boolean> {
  const pathSegments = imageUrl.split('/');
  const fileName = pathSegments[pathSegments.length - 1];
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from('favicons')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting favicon:', error);
    throw error;
  }
  return true;
}