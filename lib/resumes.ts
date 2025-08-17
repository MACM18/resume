"use client";

import { supabase } from './supabase';
import { Resume } from '@/types/portfolio';

export async function getResumes(): Promise<Resume[]> {
  const { data, error } = await supabase.from('resumes').select('*');
  if (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
  return data || [];
}