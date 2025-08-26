"use client";

import { supabase } from './supabase';
import { HomePageData, AboutPageData, Profile } from '@/types/portfolio';

interface ProfileData {
  full_name: string;
  tagline: string;
  home_page_data: HomePageData;
  about_page_data: AboutPageData;
  avatar_url: string | null;
  background_image_url: string | null; // Include background image URL
  contact_numbers?: {
    id: string;
    number: string;
    label: string;
    isActive: boolean;
    isPrimary: boolean;
  }[];
}

export async function getProfileData(domain: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, tagline, home_page_data, about_page_data, avatar_url, background_image_url, contact_numbers')
    .eq('domain', domain)
    .single();

  if (error) { // Log all errors, not just non-PGRST116
    console.error('Error fetching profile data for domain:', domain, 'Error details:', error);
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
    .eq('id', session.user.id)
    .single();
  
  if (error) {
    console.error("Error fetching current user profile:", error);
    return null;
  }
  return data;
}

export async function updateCurrentUserProfile(profileData: Partial<Profile>) {
    const { data: { session } = { session: null } } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', session.user.id)
        .select()
        .single();

    if (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
    return data;
}

export async function uploadProfileImage(file: File, userId: string): Promise<string> {
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