import { supabase } from './supabase';
import { normalizeDomain } from './utils';

export async function getProfileDataServer(domain?: string) {
  const normalizedDomain = normalizeDomain(domain || "");
  if (!normalizedDomain) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select(
      'full_name, tagline, home_page_data, about_page_data, avatar_url, background_image_url, favicon_url, contact_numbers'
    )
    .eq('domain', normalizedDomain);

  if (error) {
    console.error('Error fetching profile data (server):', error);
    return null;
  }
  if (!data || data.length === 0) {
    return null;
  }
  return data[0];
}
