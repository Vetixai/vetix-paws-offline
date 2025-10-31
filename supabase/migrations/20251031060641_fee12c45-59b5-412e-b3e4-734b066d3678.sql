-- Fix RLS policies for emergency_contacts table
-- Remove the vulnerable "OR user_id IS NULL" condition

DROP POLICY IF EXISTS "Users can view their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own emergency contacts" ON public.emergency_contacts;
DROP POLICY IF EXISTS "Users can create their own emergency contacts" ON public.emergency_contacts;

-- Create secure policies that only allow users to access their own contacts
CREATE POLICY "Users can view their own emergency contacts"
ON public.emergency_contacts
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emergency contacts"
ON public.emergency_contacts
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own emergency contacts"
ON public.emergency_contacts
FOR UPDATE
USING (auth.uid() = user_id);

-- Fix RLS policy for disease_outbreaks table
-- Replace public access with region-based access control

DROP POLICY IF EXISTS "Users can view all disease outbreaks" ON public.disease_outbreaks;

-- Users can only view outbreaks in their own region or ones they reported
CREATE POLICY "Users can view regional disease outbreaks"
ON public.disease_outbreaks
FOR SELECT
USING (
  auth.uid() = reported_by_user_id
  OR region IN (
    SELECT region FROM public.profiles WHERE user_id = auth.uid()
  )
);