import { supabase } from './supabase';

export async function getProfileDataServer(domain: string) {
  if (!domain) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'full_name, tagline, home_page_data, about_page_data, avatar_url, background_image_url, favicon_url, contact_numbers'
    )
    .eq('domain', domain)
    .single();

  if (error) {
    console.error('Error fetching profile data (server):', error);
    return null;
  }
  return data;
}
