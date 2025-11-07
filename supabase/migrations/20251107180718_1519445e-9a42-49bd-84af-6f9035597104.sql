-- Knowledge Base System for Vetix AI
-- Stores curated veterinary reference data from authoritative sources

-- 1. Disease Knowledge Base
CREATE TABLE IF NOT EXISTS public.disease_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disease_name text NOT NULL,
  animal_types text[] NOT NULL, -- ['cattle', 'sheep', 'goat', 'poultry', 'pig']
  common_symptoms text[] NOT NULL,
  causes text NOT NULL,
  transmission_method text,
  incubation_period text,
  severity text NOT NULL, -- 'low', 'medium', 'high', 'critical'
  mortality_rate text,
  treatment_protocol text NOT NULL,
  prevention_measures text[] NOT NULL,
  vaccination_available boolean DEFAULT false,
  zoonotic boolean DEFAULT false, -- Can transmit to humans
  reportable boolean DEFAULT false, -- Must report to authorities
  regional_prevalence jsonb, -- {'Kenya': 'high', 'Uganda': 'medium'}
  seasonal_pattern text,
  economic_impact text,
  differential_diagnoses text[],
  diagnostic_tests text[],
  source_url text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_disease_animal_types ON public.disease_knowledge USING GIN(animal_types);
CREATE INDEX idx_disease_severity ON public.disease_knowledge(severity);
CREATE INDEX idx_disease_name_search ON public.disease_knowledge USING gin(to_tsvector('english', disease_name));

-- 2. Medication Database
CREATE TABLE IF NOT EXISTS public.medication_knowledge (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_name text NOT NULL,
  generic_name text,
  drug_class text NOT NULL, -- 'antibiotic', 'antiparasitic', 'anti-inflammatory', etc.
  target_animals text[] NOT NULL,
  target_conditions text[] NOT NULL,
  dosage_formula text NOT NULL, -- e.g., "10 mg/kg body weight"
  administration_route text NOT NULL, -- 'oral', 'injection', 'topical', 'IV'
  frequency text NOT NULL, -- 'once daily', 'twice daily', 'every 12 hours'
  duration text, -- 'single dose', '5-7 days', '10-14 days'
  contraindications text[],
  side_effects text[],
  withdrawal_period_meat text, -- Days before slaughter
  withdrawal_period_milk text, -- Days before milk consumption
  storage_conditions text,
  available_in_kenya boolean DEFAULT true,
  approximate_cost_ksh text,
  prescription_required boolean DEFAULT true,
  warnings text[],
  source_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_medication_drug_class ON public.medication_knowledge(drug_class);
CREATE INDEX idx_medication_animals ON public.medication_knowledge USING GIN(target_animals);
CREATE INDEX idx_medication_search ON public.medication_knowledge USING gin(to_tsvector('english', medication_name || ' ' || generic_name));

-- 3. Vaccination Schedules
CREATE TABLE IF NOT EXISTS public.vaccination_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_type text NOT NULL, -- 'cattle', 'sheep', 'goat', 'poultry', 'pig'
  vaccine_name text NOT NULL,
  disease_prevention text NOT NULL,
  age_at_first_dose text NOT NULL, -- 'birth', '2 weeks', '3 months', etc.
  number_of_doses integer NOT NULL DEFAULT 1,
  interval_between_doses text, -- '21 days', '4 weeks', etc.
  booster_frequency text, -- 'annual', 'every 6 months', 'every 2 years'
  season_recommended text[], -- ['dry season', 'before rainy season']
  critical_priority text NOT NULL, -- 'essential', 'recommended', 'optional'
  cost_range_ksh text,
  administration_method text, -- 'subcutaneous', 'intramuscular', 'oral'
  storage_temperature text,
  regional_requirement text, -- 'mandatory in Kenya', 'recommended for Coast region'
  notes text,
  source_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_vaccination_animal_type ON public.vaccination_schedules(animal_type);
CREATE INDEX idx_vaccination_priority ON public.vaccination_schedules(critical_priority);

-- 4. Treatment Protocols
CREATE TABLE IF NOT EXISTS public.treatment_protocols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  protocol_name text NOT NULL,
  condition_treated text NOT NULL,
  animal_types text[] NOT NULL,
  urgency_level text NOT NULL, -- 'emergency', 'urgent', 'routine'
  step_by_step_procedure text[] NOT NULL,
  required_materials text[],
  medications_needed text[],
  estimated_duration text,
  success_rate text,
  follow_up_care text[],
  when_to_call_vet text[],
  complications_to_watch text[],
  cost_estimate_ksh text,
  skill_level_required text, -- 'farmer', 'trained_worker', 'veterinarian'
  video_url text,
  source_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_protocol_condition ON public.treatment_protocols(condition_treated);
CREATE INDEX idx_protocol_urgency ON public.treatment_protocols(urgency_level);
CREATE INDEX idx_protocol_animals ON public.treatment_protocols USING GIN(animal_types);

-- 5. Emergency Procedures
CREATE TABLE IF NOT EXISTS public.emergency_procedures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_type text NOT NULL,
  animal_types text[] NOT NULL,
  immediate_signs text[] NOT NULL, -- Warning signs to recognize
  immediate_actions text[] NOT NULL, -- What to do in first 5-10 minutes
  do_not_do text[], -- Common mistakes to avoid
  when_critical boolean DEFAULT true,
  call_vet_immediately boolean DEFAULT true,
  time_sensitive_minutes integer, -- How many minutes before permanent damage
  supplies_needed text[],
  step_by_step_guide text[],
  prevention_tips text[],
  source_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_emergency_type ON public.emergency_procedures(emergency_type);
CREATE INDEX idx_emergency_animals ON public.emergency_procedures USING GIN(animal_types);

-- 6. Best Practices & Tips
CREATE TABLE IF NOT EXISTS public.farming_best_practices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL, -- 'nutrition', 'housing', 'breeding', 'disease_prevention', 'welfare'
  animal_types text[] NOT NULL,
  practice_title text NOT NULL,
  description text NOT NULL,
  benefits text[],
  implementation_steps text[],
  cost_implication text, -- 'low cost', 'moderate cost', 'high investment'
  roi_timeframe text, -- 'immediate', '6 months', '1 year'
  suitable_for_smallholder boolean DEFAULT true,
  climate_considerations text[],
  regional_adaptations jsonb, -- Kenya-specific variations
  common_mistakes text[],
  success_stories text,
  source_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_practices_category ON public.farming_best_practices(category);
CREATE INDEX idx_practices_animals ON public.farming_best_practices USING GIN(animal_types);

-- 7. Regional Disease Alerts (curated from WOAH, FAO, local ministries)
CREATE TABLE IF NOT EXISTS public.regional_disease_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_level text NOT NULL, -- 'watch', 'alert', 'warning', 'emergency'
  disease_name text NOT NULL,
  affected_regions text[] NOT NULL, -- ['Rift Valley', 'Coast', 'Western']
  animal_types text[] NOT NULL,
  reported_date date NOT NULL,
  status text NOT NULL DEFAULT 'active', -- 'active', 'contained', 'resolved'
  case_count integer,
  mortality_count integer,
  control_measures text[],
  farmer_recommendations text[],
  official_source text, -- 'Kenya Ministry of Agriculture', 'WOAH', 'FAO'
  source_url text,
  last_updated timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_alerts_level ON public.regional_disease_alerts(alert_level);
CREATE INDEX idx_alerts_status ON public.regional_disease_alerts(status);
CREATE INDEX idx_alerts_regions ON public.regional_disease_alerts USING GIN(affected_regions);
CREATE INDEX idx_alerts_date ON public.regional_disease_alerts(reported_date DESC);

-- Enable RLS on all tables (public read access, admin write access)
ALTER TABLE public.disease_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medication_knowledge ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccination_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farming_best_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regional_disease_alerts ENABLE ROW LEVEL SECURITY;

-- Public read access for all authenticated users
CREATE POLICY "Anyone can view disease knowledge"
  ON public.disease_knowledge FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view medication knowledge"
  ON public.medication_knowledge FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view vaccination schedules"
  ON public.vaccination_schedules FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view treatment protocols"
  ON public.treatment_protocols FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view emergency procedures"
  ON public.emergency_procedures FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view farming best practices"
  ON public.farming_best_practices FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view regional disease alerts"
  ON public.regional_disease_alerts FOR SELECT
  USING (true);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_knowledge_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_medication_knowledge_updated_at
  BEFORE UPDATE ON public.medication_knowledge
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();

CREATE TRIGGER update_vaccination_schedules_updated_at
  BEFORE UPDATE ON public.vaccination_schedules
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();

CREATE TRIGGER update_treatment_protocols_updated_at
  BEFORE UPDATE ON public.treatment_protocols
  FOR EACH ROW EXECUTE FUNCTION update_knowledge_updated_at();