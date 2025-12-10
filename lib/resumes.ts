"use client";

import { supabase, getStoragePublicUrl } from './supabase';
import { Resume, UploadedResume } from '@/types/portfolio';
import { normalizeDomain } from './utils';

// ========== UPLOADED RESUMES FUNCTIONS ==========

export async function createUploadedResume(
  file: File, 
  userId: string, 
  filePath: string, 
  publicUrl: string
): Promise<UploadedResume | null> {
  const { data, error } = await supabase
    .from('uploaded_resumes')
    .insert([{
      user_id: userId,
      file_path: filePath,
      public_url: publicUrl,
      original_filename: file.name,
      file_size: file.size
    }])
    .select()
    ;

  if (error) {
    console.error('Error creating uploaded resume record:', error);
    return null;
  }
  return (data && data.length > 0 ? (data[0] as UploadedResume) : null);
}

export async function getUploadedResumesForCurrentUser(): Promise<UploadedResume[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('uploaded_resumes')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching uploaded resumes:', error);
    return [];
  }
  return data || [];
}

export async function deleteUploadedResume(id: string): Promise<boolean> {
  // First get the file_path to delete from storage
  const { data: uploadedResumes, error: fetchError } = await supabase
    .from('uploaded_resumes')
    .select('file_path')
    .eq('id', id)
    ;

  if (fetchError) {
    console.error('Error fetching uploaded resume for deletion:', fetchError);
    return false;
  }

  // Delete from storage
  const filePathToDelete = uploadedResumes && uploadedResumes.length > 0 ? (uploadedResumes[0] as { file_path: string }).file_path : null;
  if (filePathToDelete) {
    const { error: storageError } = await supabase.storage
      .from('resumes')
      .remove([filePathToDelete]);
    
    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with DB deletion even if storage deletion fails
    }
  }

  // Delete from database
  const { error } = await supabase
    .from('uploaded_resumes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting uploaded resume:', error);
    return false;
  }
  return true;
}

// ========== EXISTING FUNCTIONS (updated) ==========

export async function uploadResumePdf(file: File, userId: string, role: string): Promise<UploadedResume | null> {
  // Verify user is authenticated before uploading
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    console.error('User must be logged in to upload a resume.');
    return null;
  }

  // ensure filename is safe
  const safeRole = role ? role.replace(/[^a-zA-Z0-9-_]/g, '-') : 'resume';
  const filePath = `${userId}/${safeRole}-${Date.now()}.pdf`;

  // Check if bucket exists by attempting to list; if bucket missing, throw a clear error
  try {
    const { error: listError } = await supabase.storage.from('resumes').list('', { limit: 1 });
    if (listError) {
      console.error('Bucket "resumes" not accessible:', listError.message || listError);
      throw new Error('Storage bucket "resumes" not found or inaccessible.');
    }
  } catch (err) {
    console.error('Error checking bucket:', err);
    return null;
  }

  const { error: uploadError } = await supabase.storage
    .from('resumes')
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error('Error uploading resume PDF:', uploadError);
    return null;
  }

  // Use our custom getStoragePublicUrl for self-hosted Supabase
  const publicUrl = getStoragePublicUrl('resumes', filePath);
  console.log('Generated public URL for resume:', publicUrl);

  // Create database record
  const uploadedResume = await createUploadedResume(file, userId, filePath, publicUrl);
  return uploadedResume;
}

export async function getResumePublicUrl(filePath: string): Promise<string | null> {
  // Use our custom getStoragePublicUrl for self-hosted Supabase
  return getStoragePublicUrl('resumes', filePath);
}

export async function getActiveResume(domain: string): Promise<Resume | null> {
  const normalizedDomain = normalizeDomain(domain);
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('user_id, active_resume_role')
    .eq('domain', normalizedDomain)
    ;
  const profile = profiles && profiles.length > 0 ? (profiles[0] as { user_id: string; active_resume_role: string | null }) : null;
  if (profileError || !profile || !profile.active_resume_role) {
    console.error('Error fetching profile or no active resume set:', profileError?.message);
    return null;
  }

  const { data: resumes, error: resumeError } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', profile.user_id)
    .eq('role', profile.active_resume_role)
    ;

  if (resumeError) {
    console.error('Error fetching active resume:', resumeError.message);
    return null;
  }

  return (resumes && resumes.length > 0 ? (resumes[0] as Resume) : null);
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

  const { data, error } = await supabase.from('resumes').insert([{ ...resume, user_id: session.user.id }]).select();
  if (error) {
    console.error("Error adding resume:", error);
    return null;
  }
  return (data && data.length > 0 ? (data[0] as Resume) : null);
}

export async function updateResume(id: string, resume: Partial<Resume>): Promise<Resume | null> {
  const { data, error } = await supabase.from('resumes').update(resume).eq('id', id).select();
  if (error) {
    console.error("Error updating resume:", error);
    return null;
  }
  return (data && data.length > 0 ? (data[0] as Resume) : null);
}

export async function deleteResume(id: string): Promise<boolean> {
  const { error } = await supabase.from('resumes').delete().eq('id', id);
  if (error) {
    console.error("Error deleting resume:", error);
    return false;
  }
  return true;
}