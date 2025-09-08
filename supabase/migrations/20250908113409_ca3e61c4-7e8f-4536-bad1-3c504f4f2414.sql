-- Create emergency contacts table for storing local emergency contacts
CREATE TABLE public.emergency_contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  relationship TEXT, -- e.g., "Local Vet", "Community Agent", "Emergency Service"
  location TEXT,
  priority INTEGER DEFAULT 1, -- 1 = highest priority
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Create policies for emergency contacts
CREATE POLICY "Users can view their own emergency contacts" 
ON public.emergency_contacts 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL); -- Allow access to public emergency numbers

CREATE POLICY "Users can create their own emergency contacts" 
ON public.emergency_contacts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own emergency contacts" 
ON public.emergency_contacts 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own emergency contacts" 
ON public.emergency_contacts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create table for emergency alerts history
CREATE TABLE public.emergency_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  contact_id UUID REFERENCES public.emergency_contacts(id),
  animal_species TEXT,
  symptoms TEXT,
  location TEXT,
  urgency_level TEXT DEFAULT 'high', -- low, medium, high, critical
  status TEXT DEFAULT 'sent', -- sent, delivered, failed
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  response_received BOOLEAN DEFAULT false,
  response_notes TEXT
);

-- Enable RLS for alerts
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own emergency alerts" 
ON public.emergency_alerts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emergency alerts" 
ON public.emergency_alerts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_emergency_contacts_updated_at
BEFORE UPDATE ON public.emergency_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default emergency contacts (public, no user_id)
INSERT INTO public.emergency_contacts (name, phone_number, relationship, location, priority, user_id) VALUES
('Kenya Veterinary Association', '+254-20-4445988', 'Professional Organization', 'Nairobi', 1, NULL),
('Emergency Vet Hotline', '+254-700-123456', 'Emergency Service', 'National', 1, NULL),
('Animal Care Kenya', '+254-722-111222', 'Animal Welfare', 'Nairobi', 2, NULL);