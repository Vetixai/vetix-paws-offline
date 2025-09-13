-- Create comprehensive database schema for real Vetix AI functionality

-- Create animal types enum
CREATE TYPE animal_type AS ENUM (
  'cattle', 'goat', 'sheep', 'chicken', 'pig', 'horse', 'donkey', 
  'cat', 'dog', 'rabbit', 'duck', 'turkey', 'fish', 'other'
);

-- Create diagnosis urgency levels
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');

-- Create user languages enum  
CREATE TYPE user_language AS ENUM ('sw-KE', 'sw-TZ', 'en-KE', 'luo', 'kik');

-- Update profiles table with language support
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS language user_language DEFAULT 'sw-KE',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Africa/Nairobi',
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;

-- Create animals table for livestock management
CREATE TABLE public.animals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  animal_type animal_type NOT NULL,
  breed TEXT,
  age_months INTEGER,
  weight_kg DECIMAL,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  identification_number TEXT,
  acquisition_date DATE,
  location TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create diagnoses table for AI diagnosis results
CREATE TABLE public.diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  species TEXT NOT NULL,
  symptoms TEXT NOT NULL,
  diagnosis_result TEXT NOT NULL,
  confidence_score DECIMAL CHECK (confidence_score BETWEEN 0 AND 1),
  urgency_level urgency_level DEFAULT 'medium',
  recommended_actions TEXT[],
  follow_up_date DATE,
  treatment_cost_estimate DECIMAL,
  is_emergency BOOLEAN DEFAULT FALSE,
  language user_language DEFAULT 'sw-KE',
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create treatments table for tracking medical interventions
CREATE TABLE public.treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  diagnosis_id UUID REFERENCES public.diagnoses(id) ON DELETE SET NULL,
  treatment_name TEXT NOT NULL,
  medication TEXT,
  dosage TEXT,
  frequency TEXT,
  duration_days INTEGER,
  cost DECIMAL,
  administered_by TEXT,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  notes TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create vaccination records
CREATE TABLE public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  animal_id UUID REFERENCES public.animals(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  disease_prevention TEXT NOT NULL,
  administered_date DATE DEFAULT CURRENT_DATE,
  next_due_date DATE,
  batch_number TEXT,
  administered_by TEXT,
  cost DECIMAL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create disease outbreaks table for community tracking
CREATE TABLE public.disease_outbreaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reported_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  disease_name TEXT NOT NULL,
  animal_type animal_type NOT NULL,
  location TEXT NOT NULL,
  affected_count INTEGER DEFAULT 1,
  mortality_count INTEGER DEFAULT 0,
  severity urgency_level DEFAULT 'medium',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'contained', 'resolved')),
  symptoms TEXT[],
  description TEXT,
  containment_measures TEXT[],
  region TEXT,
  coordinates POINT,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create community health reports
CREATE TABLE public.health_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  region TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('weekly', 'monthly', 'outbreak', 'emergency')),
  animal_counts JSONB, -- Store counts per animal type
  health_metrics JSONB, -- Store various health statistics
  disease_incidents INTEGER DEFAULT 0,
  mortality_rate DECIMAL,
  vaccination_coverage DECIMAL,
  economic_impact DECIMAL,
  recommendations TEXT[],
  report_period_start DATE,
  report_period_end DATE,
  generated_by_ai BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create voice recordings table for offline functionality
CREATE TABLE public.voice_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  diagnosis_id UUID REFERENCES public.diagnoses(id) ON DELETE CASCADE,
  audio_url TEXT,
  transcription TEXT,
  language user_language DEFAULT 'sw-KE',
  confidence_score DECIMAL,
  duration_seconds INTEGER,
  file_size_bytes INTEGER,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create photo analysis table
CREATE TABLE public.photo_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  diagnosis_id UUID REFERENCES public.diagnoses(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  ai_analysis TEXT,
  detected_conditions TEXT[],
  confidence_score DECIMAL,
  image_metadata JSONB,
  is_processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create RLS policies for all tables
ALTER TABLE public.animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diagnoses ENABLE ROW LEVEL SECURITY;  
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disease_outbreaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voice_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photo_analyses ENABLE ROW LEVEL SECURITY;

-- RLS policies for animals table
CREATE POLICY "Users can manage their own animals" ON public.animals
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for diagnoses table  
CREATE POLICY "Users can manage their own diagnoses" ON public.diagnoses
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for treatments table
CREATE POLICY "Users can manage their own treatments" ON public.treatments
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for vaccinations table
CREATE POLICY "Users can manage their own vaccinations" ON public.vaccinations
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for disease outbreaks (community visible)
CREATE POLICY "Users can view all disease outbreaks" ON public.disease_outbreaks
  FOR SELECT USING (true);

CREATE POLICY "Users can report disease outbreaks" ON public.disease_outbreaks
  FOR INSERT WITH CHECK (auth.uid() = reported_by_user_id);

CREATE POLICY "Users can update their reported outbreaks" ON public.disease_outbreaks
  FOR UPDATE USING (auth.uid() = reported_by_user_id OR auth.uid() = verified_by);

-- RLS policies for health reports
CREATE POLICY "Users can view health reports for their region" ON public.health_reports
  FOR SELECT USING (true);

CREATE POLICY "Agents can create health reports" ON public.health_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their health reports" ON public.health_reports
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for voice recordings
CREATE POLICY "Users can manage their own voice recordings" ON public.voice_recordings
  FOR ALL USING (auth.uid() = user_id);

-- RLS policies for photo analyses
CREATE POLICY "Users can manage their own photo analyses" ON public.photo_analyses
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_animals_user_id ON public.animals(user_id);
CREATE INDEX idx_animals_type ON public.animals(animal_type);
CREATE INDEX idx_diagnoses_user_id ON public.diagnoses(user_id);
CREATE INDEX idx_diagnoses_urgency ON public.diagnoses(urgency_level);
CREATE INDEX idx_diagnoses_date ON public.diagnoses(created_at);
CREATE INDEX idx_treatments_animal_id ON public.treatments(animal_id);
CREATE INDEX idx_disease_outbreaks_location ON public.disease_outbreaks(location);
CREATE INDEX idx_disease_outbreaks_status ON public.disease_outbreaks(status);
CREATE INDEX idx_health_reports_region ON public.health_reports(region);

-- Create updated_at triggers for all tables
CREATE TRIGGER update_animals_updated_at
  BEFORE UPDATE ON public.animals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_diagnoses_updated_at
  BEFORE UPDATE ON public.diagnoses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON public.vaccinations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_disease_outbreaks_updated_at
  BEFORE UPDATE ON public.disease_outbreaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_health_reports_updated_at
  BEFORE UPDATE ON public.health_reports
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();