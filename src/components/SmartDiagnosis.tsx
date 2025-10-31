import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, Stethoscope, Loader2, Brain, AlertTriangle, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SpeciesSelector } from './SpeciesSelector';
import { diagnosisSchema } from '@/lib/validation';

interface DiagnosisResult {
  diagnosis: string;
  confidence: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  treatmentPlan: string[];
  followUpSchedule: { task: string; days: number }[];
  costEstimate: { min: number; max: number };
  preventiveMeasures: string[];
}

export const SmartDiagnosis = () => {
  const [symptoms, setSymptoms] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<DiagnosisResult | null>(null);
  const [selectedSpecies, setSelectedSpecies] = useState('ng\'ombe');
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Picha ni kubwa sana. Chagua picha ndogo ya MB 10 / Image too large. Please select an image smaller than 10MB');
        return;
      }
      
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const convertImageToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeDiagnosis = async () => {
    if (!symptoms.trim() && !selectedImage) {
      toast.error('Tafadhali andika dalili au chagua picha / Please describe symptoms or select an image');
      return;
    }

    // Validate symptoms if provided
    if (symptoms.trim()) {
      try {
        diagnosisSchema.parse({
          symptoms: symptoms.trim(),
          species: selectedSpecies
        });
      } catch (error: any) {
        toast.error(error.errors?.[0]?.message || 'Invalid input');
        return;
      }
    }

    setIsAnalyzing(true);
    setAnalysisProgress(0);
    
    try {
      // Progress simulation
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Get user location for context
      let userLocation = { country: '', region: '' };
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('country, region')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          userLocation = { country: profile.country || '', region: profile.region || '' };
        }
      }

      let imageBase64 = null;
      if (selectedImage) {
        imageBase64 = await convertImageToBase64(selectedImage);
      }

      const { data, error } = await supabase.functions.invoke('smart-diagnosis', {
        body: {
          symptoms: symptoms.trim(),
          imageBase64,
          animalType: selectedSpecies,
          location: userLocation,
          includeAdvanced: true // Request advanced analysis
        }
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (error) throw error;

      // Enhanced diagnosis result
      const result: DiagnosisResult = {
        diagnosis: data.diagnosis || data.result,
        confidence: data.confidence || 0.85,
        urgencyLevel: data.urgencyLevel || 'medium',
        treatmentPlan: data.treatmentPlan || [
          'Consult veterinarian for proper diagnosis',
          'Monitor animal condition closely',
          'Provide supportive care'
        ],
        followUpSchedule: data.followUpSchedule || [
          { task: 'Check temperature', days: 1 },
          { task: 'Monitor appetite', days: 2 },
          { task: 'Veterinary follow-up', days: 7 }
        ],
        costEstimate: data.costEstimate || { min: 500, max: 2000 },
        preventiveMeasures: data.prevention || [
          'Maintain proper hygiene',
          'Ensure vaccination schedule',
          'Regular health checks'
        ]
      };

      setDiagnosisResult(result);
      toast.success(`🎯 Analysis complete! ${Math.round(result.confidence * 100)}% confidence`);
      
    } catch (error) {
      console.error('Error analyzing diagnosis:', error);
      toast.error('Hitilafu katika uchambuzi / Error during analysis');
      setAnalysisProgress(0);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearForm = () => {
    setSymptoms('');
    setSelectedImage(null);
    setImagePreview(null);
    setDiagnosisResult(null);
    setAnalysisProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="max-w-6xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          AI Veterinary Diagnosis System
          <Badge variant="secondary" className="ml-auto">
            <Stethoscope className="w-3 h-3 mr-1" />
            Professional Grade
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analysis Progress */}
        {isAnalyzing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Analysis Progress</span>
              <span className="text-sm font-medium">{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-4">
            <SpeciesSelector 
              selectedSpecies={selectedSpecies}
              onSpeciesChange={setSelectedSpecies}
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">
                📝 Describe symptoms in detail / Eleza dalili kwa undani
              </label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Be specific: behavior changes, physical symptoms, duration, severity, eating patterns, temperature, breathing..."
                rows={5}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                📷 Upload image for visual analysis (optional)
              </label>
              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Select High-Quality Image
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
              </div>
            </div>

            {imagePreview && (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected image"
                  className="w-full h-48 object-cover rounded-lg border shadow-sm"
                />
                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                >
                  ×
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={analyzeDiagnosis}
                disabled={isAnalyzing || (!symptoms.trim() && !selectedImage)}
                className="flex-1"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Running AI Analysis...
                  </>
                ) : (
                  <>
                    <Brain className="h-4 w-4 mr-2" />
                    Get Professional Diagnosis
                  </>
                )}
              </Button>
              <Button onClick={clearForm} variant="outline">
                Clear
              </Button>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-4">
            {diagnosisResult ? (
              <div className="space-y-4">
                {/* Main Diagnosis */}
                <Card className="border-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        Diagnosis Result
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant={getUrgencyColor(diagnosisResult.urgencyLevel)}>
                          {diagnosisResult.urgencyLevel.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(diagnosisResult.confidence * 100)}% confident
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{diagnosisResult.diagnosis}</p>
                  </CardContent>
                </Card>

                {/* Treatment Plan */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" />
                      Treatment Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {diagnosisResult.treatmentPlan.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center mt-0.5 font-medium">
                            {index + 1}
                          </span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Follow-up Schedule */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Follow-up Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {diagnosisResult.followUpSchedule.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                          <span>{item.task}</span>
                          <Badge variant="outline">Day {item.days}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Cost Estimate */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">💰 Estimated Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Treatment Range:</span>
                      <span className="font-medium">
                        KES {diagnosisResult.costEstimate.min.toLocaleString()} - {diagnosisResult.costEstimate.max.toLocaleString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Prevention Measures */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Prevention for Future
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1 text-sm">
                      {diagnosisResult.preventiveMeasures.map((measure, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {measure}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Professional AI Analysis</p>
                  <p className="text-sm">Comprehensive diagnosis results will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Muhimu / Important:</strong> Hii ni mshauri wa awali tu. Kwa ugonjwa mkuu, tembelea daktari wa mifugo. / 
            This is preliminary guidance only. For serious conditions, consult a professional veterinarian.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};