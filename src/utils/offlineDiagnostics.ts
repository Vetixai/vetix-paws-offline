import { supabase } from '@/integrations/supabase/client';

interface SymptomMatch {
  disease: string;
  matchScore: number;
  severity: string;
  treatment: string;
  isEmergency: boolean;
}

export class OfflineDiagnostics {
  private static knowledgeBase: any[] = [];
  private static emergencyProcedures: any[] = [];
  private static treatmentProtocols: any[] = [];
  private static lastSync = 0;
  private static readonly SYNC_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

  static async initialize() {
    const now = Date.now();
    if (now - this.lastSync < this.SYNC_INTERVAL && this.knowledgeBase.length > 0) {
      return; // Already initialized recently
    }

    try {
      await Promise.all([
        this.syncKnowledgeBase(),
        this.syncEmergencyProcedures(),
        this.syncTreatmentProtocols()
      ]);
      this.lastSync = now;
    } catch (error) {
      console.error('Failed to initialize offline diagnostics:', error);
    }
  }

  private static async syncKnowledgeBase() {
    try {
      const { data } = await supabase
        .from('disease_knowledge')
        .select('*');
      
      if (data) {
        this.knowledgeBase = data;
        localStorage.setItem('vetix_knowledge_base', JSON.stringify(data));
      }
    } catch {
      // Load from localStorage if available
      const cached = localStorage.getItem('vetix_knowledge_base');
      if (cached) this.knowledgeBase = JSON.parse(cached);
    }
  }

  private static async syncEmergencyProcedures() {
    try {
      const { data } = await supabase
        .from('emergency_procedures')
        .select('*');
      
      if (data) {
        this.emergencyProcedures = data;
        localStorage.setItem('vetix_emergency_procedures', JSON.stringify(data));
      }
    } catch {
      const cached = localStorage.getItem('vetix_emergency_procedures');
      if (cached) this.emergencyProcedures = JSON.parse(cached);
    }
  }

  private static async syncTreatmentProtocols() {
    try {
      const { data } = await supabase
        .from('treatment_protocols')
        .select('*');
      
      if (data) {
        this.treatmentProtocols = data;
        localStorage.setItem('vetix_treatment_protocols', JSON.stringify(data));
      }
    } catch {
      const cached = localStorage.getItem('vetix_treatment_protocols');
      if (cached) this.treatmentProtocols = JSON.parse(cached);
    }
  }

  static async diagnose(symptoms: string, animalType: string): Promise<string> {
    await this.initialize();

    const emergencies = this.checkEmergencies(symptoms, animalType);
    if (emergencies.length > 0) {
      return this.formatEmergencyResponse(emergencies);
    }

    const matches = this.matchSymptoms(symptoms, animalType);
    if (matches.length > 0) {
      return this.formatDiagnosisResponse(matches);
    }

    return this.getGeneralGuidance(animalType);
  }

  private static checkEmergencies(symptoms: string, animalType: string): any[] {
    const symptomsLower = symptoms.toLowerCase();
    
    return this.emergencyProcedures.filter(proc => {
      const matchesAnimal = proc.animal_types.some((type: string) => 
        type.toLowerCase() === animalType.toLowerCase()
      );
      
      const matchesSymptoms = proc.immediate_signs.some((sign: string) =>
        symptomsLower.includes(sign.toLowerCase())
      );

      return matchesAnimal && matchesSymptoms;
    });
  }

  private static matchSymptoms(symptoms: string, animalType: string): SymptomMatch[] {
    const symptomsLower = symptoms.toLowerCase();
    const matches: SymptomMatch[] = [];

    for (const disease of this.knowledgeBase) {
      const matchesAnimal = disease.animal_types.some((type: string) =>
        type.toLowerCase() === animalType.toLowerCase()
      );

      if (!matchesAnimal) continue;

      let matchScore = 0;
      let matchedSymptoms = 0;

      for (const symptom of disease.common_symptoms) {
        if (symptomsLower.includes(symptom.toLowerCase())) {
          matchedSymptoms++;
          matchScore += 1;
        }
      }

      if (matchedSymptoms > 0) {
        matchScore = matchScore / disease.common_symptoms.length;

        const treatment = this.findTreatment(disease.disease_name, animalType);

        matches.push({
          disease: disease.disease_name,
          matchScore,
          severity: disease.severity,
          treatment: treatment || disease.treatment_protocol,
          isEmergency: disease.severity === 'critical' || disease.severity === 'high'
        });
      }
    }

    return matches.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
  }

  private static findTreatment(condition: string, animalType: string): string | null {
    const protocol = this.treatmentProtocols.find(p =>
      p.condition_treated.toLowerCase().includes(condition.toLowerCase()) &&
      p.animal_types.some((type: string) => type.toLowerCase() === animalType.toLowerCase())
    );

    return protocol?.step_by_step_procedure.join('\n') || null;
  }

  private static formatEmergencyResponse(emergencies: any[]): string {
    let response = '🚨 **EMERGENCY SITUATION DETECTED** 🚨\n\n';
    
    for (const emergency of emergencies) {
      response += `**${emergency.emergency_type}**\n\n`;
      response += '**IMMEDIATE ACTIONS:**\n';
      emergency.immediate_actions.forEach((action: string, i: number) => {
        response += `${i + 1}. ${action}\n`;
      });
      
      response += '\n**DO NOT:**\n';
      emergency.do_not_do?.forEach((action: string) => {
        response += `❌ ${action}\n`;
      });

      if (emergency.time_sensitive_minutes) {
        response += `\n⏱️ **TIME CRITICAL:** Act within ${emergency.time_sensitive_minutes} minutes\n`;
      }

      response += '\n📞 **CALL A VETERINARIAN IMMEDIATELY**\n\n';
    }

    return response;
  }

  private static formatDiagnosisResponse(matches: SymptomMatch[]): string {
    let response = '**Offline Diagnostic Analysis**\n\n';
    response += '*Note: This is a rule-based analysis. For accurate diagnosis, consult a veterinarian.*\n\n';

    matches.forEach((match, index) => {
      response += `**${index + 1}. ${match.disease}** (${Math.round(match.matchScore * 100)}% match)\n`;
      response += `Severity: ${match.severity}\n\n`;
      response += `**Recommended Actions:**\n${match.treatment}\n\n`;
      
      if (match.isEmergency) {
        response += '⚠️ **Seek immediate veterinary care**\n\n';
      }
    });

    response += '\n💡 **Recommendation:** Connect to internet for AI-powered analysis with more detailed insights.';
    
    return response;
  }

  private static getGeneralGuidance(animalType: string): string {
    return `**Unable to Match Symptoms**

I couldn't find a specific match in the offline knowledge base for the symptoms you described in ${animalType}.

**What to do:**
1. Monitor the animal closely for any changes
2. Take note of additional symptoms that develop
3. Connect to internet for AI-powered diagnosis
4. Contact a veterinarian if symptoms worsen

**When to seek immediate help:**
- Difficulty breathing
- Severe bleeding
- Inability to stand or walk
- Seizures or convulsions
- Signs of severe pain

Stay connected to get the most accurate AI-powered diagnosis.`;
  }
}
