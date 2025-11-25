import { supabase } from '@/integrations/supabase/client';

interface CachedDiagnosis {
  symptoms: string;
  animalType: string;
  diagnosis: string;
  timestamp: number;
  confidence: number;
}

const CACHE_KEY = 'vetix_diagnosis_cache';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

export class DiagnosisCache {
  private static getCache(): CachedDiagnosis[] {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return [];
      const data = JSON.parse(cached);
      return data.filter((item: CachedDiagnosis) => 
        Date.now() - item.timestamp < CACHE_DURATION
      );
    } catch {
      return [];
    }
  }

  private static saveCache(cache: CachedDiagnosis[]) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('Failed to save cache:', error);
    }
  }

  static async addToCache(symptoms: string, animalType: string, diagnosis: string, confidence: number = 0.85) {
    const cache = this.getCache();
    cache.push({
      symptoms: symptoms.toLowerCase(),
      animalType: animalType.toLowerCase(),
      diagnosis,
      timestamp: Date.now(),
      confidence
    });
    
    // Keep only last 100 entries
    if (cache.length > 100) {
      cache.splice(0, cache.length - 100);
    }
    
    this.saveCache(cache);
  }

  static findSimilar(symptoms: string, animalType: string): CachedDiagnosis | null {
    const cache = this.getCache();
    const normalizedSymptoms = symptoms.toLowerCase();
    const normalizedAnimal = animalType.toLowerCase();

    // Look for exact or very similar matches
    const matches = cache.filter(item => 
      item.animalType === normalizedAnimal &&
      this.calculateSimilarity(item.symptoms, normalizedSymptoms) > 0.7
    );

    if (matches.length > 0) {
      // Return most recent match
      return matches.sort((a, b) => b.timestamp - a.timestamp)[0];
    }

    return null;
  }

  private static calculateSimilarity(str1: string, str2: string): number {
    const words1 = new Set(str1.split(/\s+/));
    const words2 = new Set(str2.split(/\s+/));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    const union = new Set([...words1, ...words2]);
    return intersection.size / union.size;
  }

  static async syncWithServer() {
    try {
      const { data: recentDiagnoses } = await supabase
        .from('diagnoses')
        .select('symptoms, species, diagnosis_result, confidence_score')
        .order('created_at', { ascending: false })
        .limit(50);

      if (recentDiagnoses) {
        recentDiagnoses.forEach(d => {
          this.addToCache(
            d.symptoms,
            d.species,
            d.diagnosis_result,
            d.confidence_score || 0.85
          );
        });
      }
    } catch (error) {
      console.error('Failed to sync cache with server:', error);
    }
  }
}
