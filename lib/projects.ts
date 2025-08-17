"use client";

import { supabase } from './supabase';
import { Project } from '@/types/portfolio';

async function getUserIdByUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase.from('profiles').select('id').eq('username', username).single();
  if (error || !data) {
    console.error('Error fetching user by username:', error?.message);
    return null;
  }
  return data.id;
}

export async function getProjects(username: string): Promise<Project[]> {
  const userId = await getUserIdByUsername(username);
  if (!userId) return [];

  const { data, error } = await supabase.from('projects').select('*').eq('user_id', userId);
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
    const { data, error } = await supabase.from('projects').select('*').eq('id', id).single();
    if (error) {
        console.error('Error fetching project by id:', error);
        return null;
    }
    return data;
}

export async function getFeaturedProjects(username: string): Promise<Project[]> {
    const userId = await getUserIdByUsername(username);
    if (!userId) return [];

    const { data, error } = await supabase.from('projects').select('*').eq('featured', true).eq('user_id', userId);
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

  const { data, error } = await supabase
    .from('projects')
    .insert([{ ...project, user_id: session.user.id }])
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