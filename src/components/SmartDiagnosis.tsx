import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Camera, Upload, Stethoscope, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { SpeciesSelector } from './SpeciesSelector';

export const SmartDiagnosis = () => {
  const [symptoms, setSymptoms] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('ng\'ombe');
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

    setIsAnalyzing(true);
    try {
      let imageBase64 = null;
      if (selectedImage) {
        imageBase64 = await convertImageToBase64(selectedImage);
      }

      const { data, error } = await supabase.functions.invoke('smart-diagnosis', {
        body: {
          symptoms: symptoms.trim(),
          imageBase64,
          animalType: selectedSpecies
        }
      });

      if (error) throw error;

      setDiagnosis(data.diagnosis);
      toast.success('Uchambuzi umekamilika / Analysis complete');
    } catch (error) {
      console.error('Error analyzing diagnosis:', error);
      toast.error('Hitilafu katika uchambuzi / Error during analysis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearForm = () => {
    setSymptoms('');
    setSelectedImage(null);
    setImagePreview(null);
    setDiagnosis('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="h-5 w-5" />
          Smart Diagnosis / Utambuzi wa Akili
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SpeciesSelector 
              selectedSpecies={selectedSpecies}
              onSpeciesChange={setSelectedSpecies}
            />
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Eleza dalili / Describe symptoms
              </label>
              <Textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Kwa mfano: mnyama ana homa, hawali vizuri, ana haraka ya kupumua... / Example: animal has fever, not eating well, rapid breathing..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Chagua picha (hiari) / Upload image (optional)
              </label>
              <div className="space-y-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Chagua Picha / Select Image
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
                  className="w-full h-48 object-cover rounded-lg border"
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
                  Remove
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
                    Inachanganua... / Analyzing...
                  </>
                ) : (
                  <>
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Changanua / Analyze
                  </>
                )}
              </Button>
              <Button onClick={clearForm} variant="outline">
                Futa / Clear
              </Button>
            </div>
          </div>

          <div>
            {diagnosis && (
              <div className="border rounded-lg p-4 bg-muted/50">
                <h3 className="font-semibold mb-2 text-lg">
                  Matokeo ya Uchambuzi / Analysis Results
                </h3>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-background p-3 rounded border">
                    {diagnosis}
                  </pre>
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