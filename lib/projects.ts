"use client";

import { supabase } from './supabase';
import { Project } from '@/types/portfolio';
import { projects as defaultProjects } from '@/data/portfolio';

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

export async function getProjectById(id: string): Promise<Project | null> {
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).eq('published', true).single();
    
    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching project by id:', error);
    }

    if (data) {
        return data;
    }

    const defaultProject = defaultProjects.find(p => p.id === id);
    if (defaultProject) {
        return { ...defaultProject, user_id: 'default', created_at: new Date().toISOString() };
    }

    return null;
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
    return null;
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
    return null;
  }
  return data;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    console.error('Error deleting project:', error);
    return false;
  }
  return true;
}