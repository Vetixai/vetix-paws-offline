-- Fix 1: Implement User Roles System
-- Create role enum
CREATE TYPE public.app_role AS ENUM ('farmer', 'agent', 'veterinarian', 'admin');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES auth.users(id),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (auth.uid() = user_id);

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update handle_new_user trigger to assign default farmer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (user_id, full_name, phone_number, country, region, user_type, language)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.raw_user_meta_data ->> 'phone_number',
    NEW.raw_user_meta_data ->> 'country',
    NEW.raw_user_meta_data ->> 'region',
    COALESCE(NEW.raw_user_meta_data ->> 'user_type', 'farmer'),
    COALESCE((NEW.raw_user_meta_data ->> 'language')::public.user_language, 'sw-KE'::public.user_language)
  );
  
  -- Assign default farmer role server-side
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'farmer');
  
  RETURN NEW;
END;
$$;

-- Migrate existing users to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id,
  CASE 
    WHEN user_type = 'agent' THEN 'agent'::public.app_role
    WHEN user_type = 'veterinarian' THEN 'veterinarian'::public.app_role
    WHEN user_type = 'admin' THEN 'admin'::public.app_role
    ELSE 'farmer'::public.app_role
  END
FROM public.profiles
ON CONFLICT (user_id, role) DO NOTHING;

-- Fix 2: Restrict Health Reports Access to User's Region
DROP POLICY IF EXISTS "Users can view health reports for their region" ON public.health_reports;

CREATE POLICY "Users can view health reports for their region"
ON public.health_reports FOR SELECT
USING (
  region IN (
    SELECT region FROM public.profiles WHERE user_id = auth.uid()
  )
);