"use client";

import { supabase } from './supabase';
import { HomePageData, AboutPageData } from '@/types/portfolio';

interface ProfileData {
  full_name: string;
  tagline: string;
  home_page_data: HomePageData;
  about_page_data: AboutPageData;
}

export async function getProfileData(): Promise<ProfileData | null> {
  // For now, this fetches the first profile found.
  // This will be updated later to support multiple users, for example by using subdomains.
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, tagline, home_page_data, about_page_data')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('Error fetching profile data:', error);
    return null;
  }
  
  return data;
}