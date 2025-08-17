"use client";

import { supabase } from './supabase';
import { HomePageData, AboutPageData, Profile } from '@/types/portfolio';

interface ProfileData {
  full_name: string;
  tagline: string;
  home_page_data: HomePageData;
  about_page_data: AboutPageData;
}

export async function getProfileData(domain: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, tagline, home_page_data, about_page_data')
    .eq('domain', domain)
    .single();

  if (error && error.code !== 'PGRST116') { // Ignore "no rows found" error
    console.error('Error fetching profile data:', error.message);
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
    const { data: { session } } = await supabase.auth.getSession();
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