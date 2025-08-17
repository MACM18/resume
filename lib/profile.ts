"use client";

import { supabase } from './supabase';
import { HomePageData, AboutPageData } from '@/types/portfolio';

interface ProfileData {
  full_name: string;
  tagline: string;
  home_page_data: HomePageData;
  about_page_data: AboutPageData;
}

export async function getProfileData(username: string): Promise<ProfileData | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, tagline, home_page_data, about_page_data')
    .eq('username', username)
    .single();

  if (error) {
    console.error('Error fetching profile data:', error.message);
    return null;
  }
  
  return data;
}