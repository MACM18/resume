"use client";

import { supabase } from './supabase';
import { Project } from '@/types/portfolio';

export async function uploadProjectImage(file: File): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to upload an image.');
  }

  const fileExt = file.name.split('.').pop();
  const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('project-images')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('project-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteProjectImage(userId: string, imageUrl: string): Promise<boolean> {
  const pathSegments = imageUrl.split('/');
  const fileName = pathSegments[pathSegments.length - 1];
  const filePath = `${userId}/${fileName}`;

  const { error } = await supabase.storage
    .from('project-images')
    .remove([filePath]);

  if (error) {
    console.error('Error deleting project image:', error);
    throw error;
  }
  return true;
}

async function getUserIdByDomain(domain: string): Promise<string | null> {
  const { data, error } = await supabase.from('profiles').select('id').eq('domain', domain).single();
  if (error || !data) {
    console.error('Error fetching user by domain:', error?.message);
    return null;
  }
  return data.id;
}

export async function getProjects(domain: string): Promise<Project[]> {
  const userId = await getUserIdByDomain(domain);
  if (!userId) return [];

  const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId).eq('published', true);
  if (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
  return data || [];
}

export async function getProjectsForCurrentUser(): Promise<Project[]> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', session.user.id);

  if (error) {
    console.error('Error fetching user projects:', error);
    return [];
  }
  return data || [];
}

export async function getProjectById(id: string, domain: string): Promise<Project | null> {
    const userId = await getUserIdByDomain(domain);
    if (!userId) return null;

    const { data, error } = await supabase.from('projects').select('*').eq('id', id).eq('user_id', userId).eq('published', true).single();
    if (error) {
        console.error('Error fetching project by id:', error);
        return null;
    }
    return data;
}

export async function getFeaturedProjects(domain: string): Promise<Project[]> {
    const userId = await getUserIdByDomain(domain);
    if (!userId) return [];

    const { data, error } = await supabase.from('projects').select('*').eq('featured', true).eq('user_id', userId).eq('published', true);
    if (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }
    return data || [];
}

export async function addProject(project: Omit<Project, 'id' | 'created_at' | 'user_id'>): Promise<Project | null> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw new Error('You must be logged in to add a project.');
  }

  const projectData = {
    ...project,
    user_id: session.user.id,
    image: project.image || '/placeholder.svg' // Provide default image if none is provided
  };

  const { data, error } = await supabase
    .from('projects')
    .insert([projectData])
    .select()
    .single();

  if (error) {
    console.error('Error adding project:', error);
    throw error; // Throw the error to trigger onError in useMutation
  }
  return data;
}

export async function updateProject(id: string, project: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(project)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating project:', error);
    throw error; // Throw the error to trigger onError in useMutation
  }
  return data;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    console.error('Error deleting project:', error);
    throw error; // Throw the error to trigger onError in useMutation
  }
  return true;
}