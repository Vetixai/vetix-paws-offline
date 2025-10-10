-- Add country and region fields to profiles table for better location context
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS region TEXT;

-- Add comment explaining the fields
COMMENT ON COLUMN public.profiles.country IS 'User country for location-specific veterinary advice';
COMMENT ON COLUMN public.profiles.region IS 'User region/county/state for local disease tracking and recommendations';