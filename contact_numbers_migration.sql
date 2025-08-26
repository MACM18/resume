-- SQL to add contact_numbers field to profiles table
-- Run this in your Supabase SQL editor

-- Add contact_numbers column to profiles table
ALTER TABLE profiles 
ADD COLUMN contact_numbers JSONB DEFAULT '[]'::jsonb;

-- Optional: Add a comment to document the structure
COMMENT ON COLUMN profiles.contact_numbers IS 'Array of contact numbers with structure: [{"id": "uuid", "number": "+1234567890", "label": "Mobile", "isActive": true, "isPrimary": false}]';

-- Optional: Create an index for better performance when querying active numbers
CREATE INDEX idx_profiles_contact_numbers_active 
ON profiles USING GIN ((contact_numbers)) 
WHERE (contact_numbers::jsonb @> '[{"isActive": true}]'::jsonb);
