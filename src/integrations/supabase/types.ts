export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      animals: {
        Row: {
          acquisition_date: string | null
          age_months: number | null
          animal_type: Database["public"]["Enums"]["animal_type"]
          breed: string | null
          created_at: string | null
          gender: string | null
          id: string
          identification_number: string | null
          is_active: boolean | null
          location: string | null
          name: string | null
          notes: string | null
          updated_at: string | null
          user_id: string
          weight_kg: number | null
        }
        Insert: {
          acquisition_date?: string | null
          age_months?: number | null
          animal_type: Database["public"]["Enums"]["animal_type"]
          breed?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          identification_number?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
          weight_kg?: number | null
        }
        Update: {
          acquisition_date?: string | null
          age_months?: number | null
          animal_type?: Database["public"]["Enums"]["animal_type"]
          breed?: string | null
          created_at?: string | null
          gender?: string | null
          id?: string
          identification_number?: string | null
          is_active?: boolean | null
          location?: string | null
          name?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      diagnoses: {
        Row: {
          animal_id: string | null
          confidence_score: number | null
          created_at: string | null
          diagnosis_result: string
          follow_up_date: string | null
          id: string
          is_emergency: boolean | null
          language: Database["public"]["Enums"]["user_language"] | null
          location: string | null
          recommended_actions: string[] | null
          species: string
          symptoms: string
          treatment_cost_estimate: number | null
          updated_at: string | null
          urgency_level: Database["public"]["Enums"]["urgency_level"] | null
          user_id: string
        }
        Insert: {
          animal_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          diagnosis_result: string
          follow_up_date?: string | null
          id?: string
          is_emergency?: boolean | null
          language?: Database["public"]["Enums"]["user_language"] | null
          location?: string | null
          recommended_actions?: string[] | null
          species: string
          symptoms: string
          treatment_cost_estimate?: number | null
          updated_at?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
          user_id: string
        }
        Update: {
          animal_id?: string | null
          confidence_score?: number | null
          created_at?: string | null
          diagnosis_result?: string
          follow_up_date?: string | null
          id?: string
          is_emergency?: boolean | null
          language?: Database["public"]["Enums"]["user_language"] | null
          location?: string | null
          recommended_actions?: string[] | null
          species?: string
          symptoms?: string
          treatment_cost_estimate?: number | null
          updated_at?: string | null
          urgency_level?: Database["public"]["Enums"]["urgency_level"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnoses_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      disease_knowledge: {
        Row: {
          animal_types: string[]
          causes: string
          common_symptoms: string[]
          created_at: string | null
          diagnostic_tests: string[] | null
          differential_diagnoses: string[] | null
          disease_name: string
          economic_impact: string | null
          id: string
          incubation_period: string | null
          last_updated: string | null
          mortality_rate: string | null
          prevention_measures: string[]
          regional_prevalence: Json | null
          reportable: boolean | null
          seasonal_pattern: string | null
          severity: string
          source_url: string | null
          transmission_method: string | null
          treatment_protocol: string
          vaccination_available: boolean | null
          zoonotic: boolean | null
        }
        Insert: {
          animal_types: string[]
          causes: string
          common_symptoms: string[]
          created_at?: string | null
          diagnostic_tests?: string[] | null
          differential_diagnoses?: string[] | null
          disease_name: string
          economic_impact?: string | null
          id?: string
          incubation_period?: string | null
          last_updated?: string | null
          mortality_rate?: string | null
          prevention_measures: string[]
          regional_prevalence?: Json | null
          reportable?: boolean | null
          seasonal_pattern?: string | null
          severity: string
          source_url?: string | null
          transmission_method?: string | null
          treatment_protocol: string
          vaccination_available?: boolean | null
          zoonotic?: boolean | null
        }
        Update: {
          animal_types?: string[]
          causes?: string
          common_symptoms?: string[]
          created_at?: string | null
          diagnostic_tests?: string[] | null
          differential_diagnoses?: string[] | null
          disease_name?: string
          economic_impact?: string | null
          id?: string
          incubation_period?: string | null
          last_updated?: string | null
          mortality_rate?: string | null
          prevention_measures?: string[]
          regional_prevalence?: Json | null
          reportable?: boolean | null
          seasonal_pattern?: string | null
          severity?: string
          source_url?: string | null
          transmission_method?: string | null
          treatment_protocol?: string
          vaccination_available?: boolean | null
          zoonotic?: boolean | null
        }
        Relationships: []
      }
      disease_outbreaks: {
        Row: {
          affected_count: number | null
          animal_type: Database["public"]["Enums"]["animal_type"]
          containment_measures: string[] | null
          coordinates: unknown
          created_at: string | null
          description: string | null
          disease_name: string
          id: string
          location: string
          mortality_count: number | null
          region: string | null
          reported_by_user_id: string
          severity: Database["public"]["Enums"]["urgency_level"] | null
          status: string | null
          symptoms: string[] | null
          updated_at: string | null
          verified: boolean | null
          verified_by: string | null
        }
        Insert: {
          affected_count?: number | null
          animal_type: Database["public"]["Enums"]["animal_type"]
          containment_measures?: string[] | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          disease_name: string
          id?: string
          location: string
          mortality_count?: number | null
          region?: string | null
          reported_by_user_id: string
          severity?: Database["public"]["Enums"]["urgency_level"] | null
          status?: string | null
          symptoms?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Update: {
          affected_count?: number | null
          animal_type?: Database["public"]["Enums"]["animal_type"]
          containment_measures?: string[] | null
          coordinates?: unknown
          created_at?: string | null
          description?: string | null
          disease_name?: string
          id?: string
          location?: string
          mortality_count?: number | null
          region?: string | null
          reported_by_user_id?: string
          severity?: Database["public"]["Enums"]["urgency_level"] | null
          status?: string | null
          symptoms?: string[] | null
          updated_at?: string | null
          verified?: boolean | null
          verified_by?: string | null
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          animal_species: string | null
          contact_id: string | null
          id: string
          location: string | null
          response_notes: string | null
          response_received: boolean | null
          sent_at: string
          status: string | null
          symptoms: string | null
          urgency_level: string | null
          user_id: string | null
        }
        Insert: {
          animal_species?: string | null
          contact_id?: string | null
          id?: string
          location?: string | null
          response_notes?: string | null
          response_received?: boolean | null
          sent_at?: string
          status?: string | null
          symptoms?: string | null
          urgency_level?: string | null
          user_id?: string | null
        }
        Update: {
          animal_species?: string | null
          contact_id?: string | null
          id?: string
          location?: string | null
          response_notes?: string | null
          response_received?: boolean | null
          sent_at?: string
          status?: string | null
          symptoms?: string | null
          urgency_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alerts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "emergency_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          phone_number: string
          priority: number | null
          relationship: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          phone_number: string
          priority?: number | null
          relationship?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          phone_number?: string
          priority?: number | null
          relationship?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      emergency_procedures: {
        Row: {
          animal_types: string[]
          call_vet_immediately: boolean | null
          created_at: string | null
          do_not_do: string[] | null
          emergency_type: string
          id: string
          immediate_actions: string[]
          immediate_signs: string[]
          prevention_tips: string[] | null
          source_url: string | null
          step_by_step_guide: string[] | null
          supplies_needed: string[] | null
          time_sensitive_minutes: number | null
          when_critical: boolean | null
        }
        Insert: {
          animal_types: string[]
          call_vet_immediately?: boolean | null
          created_at?: string | null
          do_not_do?: string[] | null
          emergency_type: string
          id?: string
          immediate_actions: string[]
          immediate_signs: string[]
          prevention_tips?: string[] | null
          source_url?: string | null
          step_by_step_guide?: string[] | null
          supplies_needed?: string[] | null
          time_sensitive_minutes?: number | null
          when_critical?: boolean | null
        }
        Update: {
          animal_types?: string[]
          call_vet_immediately?: boolean | null
          created_at?: string | null
          do_not_do?: string[] | null
          emergency_type?: string
          id?: string
          immediate_actions?: string[]
          immediate_signs?: string[]
          prevention_tips?: string[] | null
          source_url?: string | null
          step_by_step_guide?: string[] | null
          supplies_needed?: string[] | null
          time_sensitive_minutes?: number | null
          when_critical?: boolean | null
        }
        Relationships: []
      }
      farming_best_practices: {
        Row: {
          animal_types: string[]
          benefits: string[] | null
          category: string
          climate_considerations: string[] | null
          common_mistakes: string[] | null
          cost_implication: string | null
          created_at: string | null
          description: string
          id: string
          implementation_steps: string[] | null
          practice_title: string
          regional_adaptations: Json | null
          roi_timeframe: string | null
          source_url: string | null
          success_stories: string | null
          suitable_for_smallholder: boolean | null
        }
        Insert: {
          animal_types: string[]
          benefits?: string[] | null
          category: string
          climate_considerations?: string[] | null
          common_mistakes?: string[] | null
          cost_implication?: string | null
          created_at?: string | null
          description: string
          id?: string
          implementation_steps?: string[] | null
          practice_title: string
          regional_adaptations?: Json | null
          roi_timeframe?: string | null
          source_url?: string | null
          success_stories?: string | null
          suitable_for_smallholder?: boolean | null
        }
        Update: {
          animal_types?: string[]
          benefits?: string[] | null
          category?: string
          climate_considerations?: string[] | null
          common_mistakes?: string[] | null
          cost_implication?: string | null
          created_at?: string | null
          description?: string
          id?: string
          implementation_steps?: string[] | null
          practice_title?: string
          regional_adaptations?: Json | null
          roi_timeframe?: string | null
          source_url?: string | null
          success_stories?: string | null
          suitable_for_smallholder?: boolean | null
        }
        Relationships: []
      }
      health_reports: {
        Row: {
          animal_counts: Json | null
          created_at: string | null
          disease_incidents: number | null
          economic_impact: number | null
          generated_by_ai: boolean | null
          health_metrics: Json | null
          id: string
          mortality_rate: number | null
          recommendations: string[] | null
          region: string
          report_period_end: string | null
          report_period_start: string | null
          report_type: string | null
          updated_at: string | null
          user_id: string
          vaccination_coverage: number | null
        }
        Insert: {
          animal_counts?: Json | null
          created_at?: string | null
          disease_incidents?: number | null
          economic_impact?: number | null
          generated_by_ai?: boolean | null
          health_metrics?: Json | null
          id?: string
          mortality_rate?: number | null
          recommendations?: string[] | null
          region: string
          report_period_end?: string | null
          report_period_start?: string | null
          report_type?: string | null
          updated_at?: string | null
          user_id: string
          vaccination_coverage?: number | null
        }
        Update: {
          animal_counts?: Json | null
          created_at?: string | null
          disease_incidents?: number | null
          economic_impact?: number | null
          generated_by_ai?: boolean | null
          health_metrics?: Json | null
          id?: string
          mortality_rate?: number | null
          recommendations?: string[] | null
          region?: string
          report_period_end?: string | null
          report_period_start?: string | null
          report_type?: string | null
          updated_at?: string | null
          user_id?: string
          vaccination_coverage?: number | null
        }
        Relationships: []
      }
      medication_knowledge: {
        Row: {
          administration_route: string
          approximate_cost_ksh: string | null
          available_in_kenya: boolean | null
          contraindications: string[] | null
          created_at: string | null
          dosage_formula: string
          drug_class: string
          duration: string | null
          frequency: string
          generic_name: string | null
          id: string
          medication_name: string
          prescription_required: boolean | null
          side_effects: string[] | null
          source_url: string | null
          storage_conditions: string | null
          target_animals: string[]
          target_conditions: string[]
          updated_at: string | null
          warnings: string[] | null
          withdrawal_period_meat: string | null
          withdrawal_period_milk: string | null
        }
        Insert: {
          administration_route: string
          approximate_cost_ksh?: string | null
          available_in_kenya?: boolean | null
          contraindications?: string[] | null
          created_at?: string | null
          dosage_formula: string
          drug_class: string
          duration?: string | null
          frequency: string
          generic_name?: string | null
          id?: string
          medication_name: string
          prescription_required?: boolean | null
          side_effects?: string[] | null
          source_url?: string | null
          storage_conditions?: string | null
          target_animals: string[]
          target_conditions: string[]
          updated_at?: string | null
          warnings?: string[] | null
          withdrawal_period_meat?: string | null
          withdrawal_period_milk?: string | null
        }
        Update: {
          administration_route?: string
          approximate_cost_ksh?: string | null
          available_in_kenya?: boolean | null
          contraindications?: string[] | null
          created_at?: string | null
          dosage_formula?: string
          drug_class?: string
          duration?: string | null
          frequency?: string
          generic_name?: string | null
          id?: string
          medication_name?: string
          prescription_required?: boolean | null
          side_effects?: string[] | null
          source_url?: string | null
          storage_conditions?: string | null
          target_animals?: string[]
          target_conditions?: string[]
          updated_at?: string | null
          warnings?: string[] | null
          withdrawal_period_meat?: string | null
          withdrawal_period_milk?: string | null
        }
        Relationships: []
      }
      photo_analyses: {
        Row: {
          ai_analysis: string | null
          confidence_score: number | null
          created_at: string | null
          detected_conditions: string[] | null
          diagnosis_id: string | null
          id: string
          image_metadata: Json | null
          image_url: string
          is_processed: boolean | null
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          confidence_score?: number | null
          created_at?: string | null
          detected_conditions?: string[] | null
          diagnosis_id?: string | null
          id?: string
          image_metadata?: Json | null
          image_url: string
          is_processed?: boolean | null
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          confidence_score?: number | null
          created_at?: string | null
          detected_conditions?: string[] | null
          diagnosis_id?: string | null
          id?: string
          image_metadata?: Json | null
          image_url?: string
          is_processed?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "photo_analyses_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          country: string | null
          created_at: string
          full_name: string | null
          id: string
          is_verified: boolean | null
          language: Database["public"]["Enums"]["user_language"] | null
          location: string | null
          phone_number: string | null
          region: string | null
          timezone: string | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          language?: Database["public"]["Enums"]["user_language"] | null
          location?: string | null
          phone_number?: string | null
          region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          country?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          language?: Database["public"]["Enums"]["user_language"] | null
          location?: string | null
          phone_number?: string | null
          region?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      regional_disease_alerts: {
        Row: {
          affected_regions: string[]
          alert_level: string
          animal_types: string[]
          case_count: number | null
          control_measures: string[] | null
          created_at: string | null
          disease_name: string
          farmer_recommendations: string[] | null
          id: string
          last_updated: string | null
          mortality_count: number | null
          official_source: string | null
          reported_date: string
          source_url: string | null
          status: string
        }
        Insert: {
          affected_regions: string[]
          alert_level: string
          animal_types: string[]
          case_count?: number | null
          control_measures?: string[] | null
          created_at?: string | null
          disease_name: string
          farmer_recommendations?: string[] | null
          id?: string
          last_updated?: string | null
          mortality_count?: number | null
          official_source?: string | null
          reported_date: string
          source_url?: string | null
          status?: string
        }
        Update: {
          affected_regions?: string[]
          alert_level?: string
          animal_types?: string[]
          case_count?: number | null
          control_measures?: string[] | null
          created_at?: string | null
          disease_name?: string
          farmer_recommendations?: string[] | null
          id?: string
          last_updated?: string | null
          mortality_count?: number | null
          official_source?: string | null
          reported_date?: string
          source_url?: string | null
          status?: string
        }
        Relationships: []
      }
      treatment_protocols: {
        Row: {
          animal_types: string[]
          complications_to_watch: string[] | null
          condition_treated: string
          cost_estimate_ksh: string | null
          created_at: string | null
          estimated_duration: string | null
          follow_up_care: string[] | null
          id: string
          medications_needed: string[] | null
          protocol_name: string
          required_materials: string[] | null
          skill_level_required: string | null
          source_url: string | null
          step_by_step_procedure: string[]
          success_rate: string | null
          updated_at: string | null
          urgency_level: string
          video_url: string | null
          when_to_call_vet: string[] | null
        }
        Insert: {
          animal_types: string[]
          complications_to_watch?: string[] | null
          condition_treated: string
          cost_estimate_ksh?: string | null
          created_at?: string | null
          estimated_duration?: string | null
          follow_up_care?: string[] | null
          id?: string
          medications_needed?: string[] | null
          protocol_name: string
          required_materials?: string[] | null
          skill_level_required?: string | null
          source_url?: string | null
          step_by_step_procedure: string[]
          success_rate?: string | null
          updated_at?: string | null
          urgency_level: string
          video_url?: string | null
          when_to_call_vet?: string[] | null
        }
        Update: {
          animal_types?: string[]
          complications_to_watch?: string[] | null
          condition_treated?: string
          cost_estimate_ksh?: string | null
          created_at?: string | null
          estimated_duration?: string | null
          follow_up_care?: string[] | null
          id?: string
          medications_needed?: string[] | null
          protocol_name?: string
          required_materials?: string[] | null
          skill_level_required?: string | null
          source_url?: string | null
          step_by_step_procedure?: string[]
          success_rate?: string | null
          updated_at?: string | null
          urgency_level?: string
          video_url?: string | null
          when_to_call_vet?: string[] | null
        }
        Relationships: []
      }
      treatments: {
        Row: {
          administered_by: string | null
          animal_id: string | null
          cost: number | null
          created_at: string | null
          diagnosis_id: string | null
          dosage: string | null
          duration_days: number | null
          end_date: string | null
          frequency: string | null
          id: string
          is_completed: boolean | null
          medication: string | null
          notes: string | null
          start_date: string | null
          treatment_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          administered_by?: string | null
          animal_id?: string | null
          cost?: number | null
          created_at?: string | null
          diagnosis_id?: string | null
          dosage?: string | null
          duration_days?: number | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_completed?: boolean | null
          medication?: string | null
          notes?: string | null
          start_date?: string | null
          treatment_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          administered_by?: string | null
          animal_id?: string | null
          cost?: number | null
          created_at?: string | null
          diagnosis_id?: string | null
          dosage?: string | null
          duration_days?: number | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_completed?: boolean | null
          medication?: string | null
          notes?: string | null
          start_date?: string | null
          treatment_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "treatments_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "treatments_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccination_schedules: {
        Row: {
          administration_method: string | null
          age_at_first_dose: string
          animal_type: string
          booster_frequency: string | null
          cost_range_ksh: string | null
          created_at: string | null
          critical_priority: string
          disease_prevention: string
          id: string
          interval_between_doses: string | null
          notes: string | null
          number_of_doses: number
          regional_requirement: string | null
          season_recommended: string[] | null
          source_url: string | null
          storage_temperature: string | null
          updated_at: string | null
          vaccine_name: string
        }
        Insert: {
          administration_method?: string | null
          age_at_first_dose: string
          animal_type: string
          booster_frequency?: string | null
          cost_range_ksh?: string | null
          created_at?: string | null
          critical_priority: string
          disease_prevention: string
          id?: string
          interval_between_doses?: string | null
          notes?: string | null
          number_of_doses?: number
          regional_requirement?: string | null
          season_recommended?: string[] | null
          source_url?: string | null
          storage_temperature?: string | null
          updated_at?: string | null
          vaccine_name: string
        }
        Update: {
          administration_method?: string | null
          age_at_first_dose?: string
          animal_type?: string
          booster_frequency?: string | null
          cost_range_ksh?: string | null
          created_at?: string | null
          critical_priority?: string
          disease_prevention?: string
          id?: string
          interval_between_doses?: string | null
          notes?: string | null
          number_of_doses?: number
          regional_requirement?: string | null
          season_recommended?: string[] | null
          source_url?: string | null
          storage_temperature?: string | null
          updated_at?: string | null
          vaccine_name?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          administered_by: string | null
          administered_date: string | null
          animal_id: string | null
          batch_number: string | null
          cost: number | null
          created_at: string | null
          disease_prevention: string
          id: string
          location: string | null
          next_due_date: string | null
          notes: string | null
          updated_at: string | null
          user_id: string
          vaccine_name: string
        }
        Insert: {
          administered_by?: string | null
          administered_date?: string | null
          animal_id?: string | null
          batch_number?: string | null
          cost?: number | null
          created_at?: string | null
          disease_prevention: string
          id?: string
          location?: string | null
          next_due_date?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id: string
          vaccine_name: string
        }
        Update: {
          administered_by?: string | null
          administered_date?: string | null
          animal_id?: string | null
          batch_number?: string | null
          cost?: number | null
          created_at?: string | null
          disease_prevention?: string
          id?: string
          location?: string | null
          next_due_date?: string | null
          notes?: string | null
          updated_at?: string | null
          user_id?: string
          vaccine_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_recordings: {
        Row: {
          audio_url: string | null
          confidence_score: number | null
          created_at: string | null
          diagnosis_id: string | null
          duration_seconds: number | null
          file_size_bytes: number | null
          id: string
          is_processed: boolean | null
          language: Database["public"]["Enums"]["user_language"] | null
          transcription: string | null
          user_id: string
        }
        Insert: {
          audio_url?: string | null
          confidence_score?: number | null
          created_at?: string | null
          diagnosis_id?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          is_processed?: boolean | null
          language?: Database["public"]["Enums"]["user_language"] | null
          transcription?: string | null
          user_id: string
        }
        Update: {
          audio_url?: string | null
          confidence_score?: number | null
          created_at?: string | null
          diagnosis_id?: string | null
          duration_seconds?: number | null
          file_size_bytes?: number | null
          id?: string
          is_processed?: boolean | null
          language?: Database["public"]["Enums"]["user_language"] | null
          transcription?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_recordings_diagnosis_id_fkey"
            columns: ["diagnosis_id"]
            isOneToOne: false
            referencedRelation: "diagnoses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      animal_type:
        | "cattle"
        | "goat"
        | "sheep"
        | "chicken"
        | "pig"
        | "horse"
        | "donkey"
        | "cat"
        | "dog"
        | "rabbit"
        | "duck"
        | "turkey"
        | "fish"
        | "other"
      app_role: "farmer" | "agent" | "veterinarian" | "admin"
      urgency_level: "low" | "medium" | "high" | "critical"
      user_language: "sw-KE" | "sw-TZ" | "en-KE" | "luo" | "kik"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      animal_type: [
        "cattle",
        "goat",
        "sheep",
        "chicken",
        "pig",
        "horse",
        "donkey",
        "cat",
        "dog",
        "rabbit",
        "duck",
        "turkey",
        "fish",
        "other",
      ],
      app_role: ["farmer", "agent", "veterinarian", "admin"],
      urgency_level: ["low", "medium", "high", "critical"],
      user_language: ["sw-KE", "sw-TZ", "en-KE", "luo", "kik"],
    },
  },
} as const
