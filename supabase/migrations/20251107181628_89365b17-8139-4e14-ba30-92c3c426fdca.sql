-- Fix search_path security warning for knowledge base functions
-- The update_knowledge_updated_at function needs proper search_path

DROP TRIGGER IF EXISTS update_medication_knowledge_updated_at ON public.medication_knowledge;
DROP TRIGGER IF EXISTS update_vaccination_schedules_updated_at ON public.vaccination_schedules;
DROP TRIGGER IF EXISTS update_treatment_protocols_updated_at ON public.treatment_protocols;
DROP FUNCTION IF EXISTS update_knowledge_updated_at();

-- Recreate with proper security settings
CREATE OR REPLACE FUNCTION public.update_knowledge_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers
CREATE TRIGGER update_medication_knowledge_updated_at
  BEFORE UPDATE ON public.medication_knowledge
  FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_updated_at();

CREATE TRIGGER update_vaccination_schedules_updated_at
  BEFORE UPDATE ON public.vaccination_schedules
  FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_updated_at();

CREATE TRIGGER update_treatment_protocols_updated_at
  BEFORE UPDATE ON public.treatment_protocols
  FOR EACH ROW EXECUTE FUNCTION public.update_knowledge_updated_at();