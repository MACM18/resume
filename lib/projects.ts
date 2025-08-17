"use client";

import { supabase } from './supabase';
import { Project } from '@/types/portfolio';

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*');
  if (error) {
    console.error('Error fetching projects:', error);
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

export async function getFeaturedProjects(): Promise<Project[]> {
    const { data, error } = await supabase.from('projects').select('*').eq('featured', true);
    if (error) {
      console.error('Error fetching featured projects:', error);
      return [];
    }
    return data || [];
}