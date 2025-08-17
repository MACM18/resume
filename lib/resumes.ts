"use client";

import { supabase } from './supabase';
import { Resume } from '@/types/portfolio';

async function getUserIdByDomain(domain: string): Promise<string | null> {
  const { data, error } = await supabase.from('profiles').select('id').eq('domain', domain).single();
  if (error || !data) {
    console.error('Error fetching user by domain:', error?.message);
    return null;
  }
  return data.id;
}

export async function getActiveResume(domain: string): Promise<Resume | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, active_resume_role')
    .eq('domain', domain)
    .single();

  if (profileError || !profile || !profile.active_resume_role) {
    console.error('Error fetching profile or no active resume set:', profileError?.message);
    return null;
  }

  const { data: resume, error: resumeError } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', profile.id)
    .eq('role', profile.active_resume_role)
    .single();

  if (resumeError) {
    console.error('Error fetching active resume:', resumeError.message);
    return null;
  }

  return resume;
}


export async function getResumesForCurrentUser(): Promise<Resume[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase.from('resumes').select('*').eq('user_id', session.user.id);
  if (error) {
    console.error('Error fetching current user resumes:', error);
    return [];
  }
  return data || [];
}

export async function addResume(resume: Omit<Resume, 'id' | 'user_id' | 'created_at'>): Promise<Resume | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const { data, error } = await supabase.from('resumes').insert([{ ...resume, user_id: session.user.id }]).select().single();
  if (error) {
    console.error("Error adding resume:", error);
    return null;
  }
  return data;
}

export async function updateResume(id: string, resume: Partial<Resume>): Promise<Resume | null> {
  const { data, error } = await supabase.from('resumes').update(resume).eq('id', id).select().single();
  if (error) {
    console.error("Error updating resume:", error);
    return null;
  }
  return data;
}

export async function deleteResume(id: string): Promise<boolean> {
  const { error } = await supabase.from('resumes').delete().eq('id', id);
  if (error) {
    console.error("Error deleting resume:", error);
    return false;
  }
  return true;
}