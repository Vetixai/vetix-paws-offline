import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { diagnosisSchema, animalSchema, outbreakSchema } from '@/lib/validation';

export const useVetixDataService = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const createDiagnosis = async (diagnosisData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save diagnoses",
        variant: "destructive"
      });
      return null;
    }

    // Validate input
    try {
      diagnosisSchema.parse({
        symptoms: diagnosisData.symptoms,
        species: diagnosisData.species,
        location: diagnosisData.location,
        urgency_level: diagnosisData.urgency_level
      });
    } catch (error: any) {
      toast({
        title: "Invalid input",
        description: error.errors?.[0]?.message || "Please check your input",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('diagnoses')
        .insert({
          user_id: user.id,
          species: diagnosisData.species || '',
          symptoms: diagnosisData.symptoms || '',
          diagnosis_result: diagnosisData.diagnosis_result || '',
          confidence_score: diagnosisData.confidence_score || 0.8,
          urgency_level: diagnosisData.urgency_level || 'medium',
          recommended_actions: diagnosisData.recommended_actions || [],
          is_emergency: diagnosisData.is_emergency || false,
          language: diagnosisData.language || 'sw-KE',
          location: diagnosisData.location || '',
          treatment_cost_estimate: diagnosisData.treatment_cost_estimate
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Diagnosis saved",
        description: "Your diagnosis has been saved successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating diagnosis:', error);
      toast({
        title: "Failed to save",
        description: "Could not save diagnosis. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const getUserDiagnoses = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching diagnoses:', error);
      return [];
    }
  };

  const createAnimal = async (animalData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add animals",
        variant: "destructive"
      });
      return null;
    }

    // Validate input
    try {
      animalSchema.parse(animalData);
    } catch (error: any) {
      toast({
        title: "Invalid input",
        description: error.errors?.[0]?.message || "Please check your input",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('animals')
        .insert({
          user_id: user.id,
          name: animalData.name || '',
          animal_type: animalData.animal_type || 'cattle',
          breed: animalData.breed || '',
          age_months: animalData.age_months,
          weight_kg: animalData.weight_kg,
          gender: animalData.gender || 'unknown',
          identification_number: animalData.identification_number || '',
          location: animalData.location || '',
          notes: animalData.notes || '',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Animal added",
        description: `${animalData.name || 'Animal'} has been added successfully`,
      });

      return data;
    } catch (error) {
      console.error('Error creating animal:', error);
      toast({
        title: "Failed to add animal",
        description: "Could not add animal. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const getUserAnimals = async () => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching animals:', error);
      return [];
    }
  };

  const reportOutbreak = async (outbreakData: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to report outbreaks",
        variant: "destructive"
      });
      return null;
    }

    // Validate input
    try {
      outbreakSchema.parse({
        disease_name: outbreakData.disease_name,
        animal_type: outbreakData.animal_type,
        location: outbreakData.location,
        region: outbreakData.region,
        affected_count: outbreakData.affected_count,
        mortality_count: outbreakData.mortality_count,
        severity: outbreakData.severity,
        symptoms: outbreakData.symptoms,
        description: outbreakData.description
      });
    } catch (error: any) {
      toast({
        title: "Invalid input",
        description: error.errors?.[0]?.message || "Please check your input",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('disease_outbreaks')
        .insert({
          reported_by_user_id: user.id,
          disease_name: outbreakData.disease_name || '',
          animal_type: outbreakData.animal_type || 'cattle',
          location: outbreakData.location || '',
          affected_count: outbreakData.affected_count || 1,
          mortality_count: outbreakData.mortality_count || 0,
          severity: outbreakData.severity || 'medium',
          symptoms: outbreakData.symptoms || [],
          description: outbreakData.description || '',
          region: outbreakData.region || '',
          status: 'active'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Outbreak reported",
        description: "Disease outbreak has been reported to the community",
      });

      return data;
    } catch (error) {
      console.error('Error reporting outbreak:', error);
      toast({
        title: "Failed to report",
        description: "Could not report outbreak. Please try again.",
        variant: "destructive"
      });
      return null;
    }
  };

  const getActiveOutbreaks = async () => {
    try {
      const { data, error } = await supabase
        .from('disease_outbreaks')
        .select('*')
        .in('status', ['active', 'contained'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching outbreaks:', error);
      return [];
    }
  };

  return {
    createDiagnosis,
    getUserDiagnoses,
    createAnimal,
    getUserAnimals,
    reportOutbreak,
    getActiveOutbreaks
  };
};