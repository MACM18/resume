"use client";

import { supabase } from './supabase';
import { Resume } from '@/types/portfolio';

export async function getResumes(username: string): Promise<Resume[]> {
  const { data: profile, error: profileError } = await supabase.from('profiles').select('id').eq('username', username).single();
  if (profileError || !profile) {
    console.error('Error fetching user by username:', profileError?.message);
    return [];
  }

  const { data, error } = await supabase.from('resumes').select('*').eq('user_id', profile.id);
  if (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
  return data || [];
}