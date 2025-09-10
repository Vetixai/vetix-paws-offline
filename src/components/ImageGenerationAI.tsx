import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Image, Download, Loader2, Sparkles, BookOpen, Heart, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const VETERINARY_TEMPLATES = {
  education: [
    "Detailed veterinary diagram showing proper livestock vaccination technique",
    "Step-by-step illustration of cattle health checkup procedure",
    "Educational infographic about chicken disease prevention methods",
    "Visual guide for identifying healthy vs sick animals"
  ],
  treatment: [
    "Professional veterinarian treating a sick cow in rural farm setting",
    "Modern livestock treatment facility with proper equipment",
    "Emergency veterinary care being provided to farm animals",
    "Veterinary medicine storage and organization system"
  ],
  prevention: [
    "Ideal farm hygiene and biosecurity measures illustration",
    "Proper animal housing and ventilation design",
    "Vaccination schedule calendar for different livestock",
    "Nutritional feed preparation and storage techniques"
  ],
  anatomy: [
    "Detailed anatomical diagram of cattle respiratory system",
    "Veterinary anatomy chart showing common disease locations",
    "Educational poster about animal digestive health",
    "Comparative anatomy of different farm animals"
  ]
};

export const ImageGenerationAI = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [category, setCategory] = useState('education');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<{
    prompt: string;
    category: string;
    generatedAt: Date;
    useCase: string;
  } | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Tafadhali andika maelezo ya picha / Please describe the image you want');
      return;
    }

    setIsGenerating(true);
    try {
      // Enhance prompt with veterinary-specific details
      const enhancedPrompt = `Professional veterinary ${category} content: ${prompt.trim()}. High quality, educational, medically accurate, suitable for African farming context.`;
      
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: enhancedPrompt,
          size,
          category
        }
      });

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
      setImageMetadata({
        prompt: prompt.trim(),
        category,
        generatedAt: new Date(),
        useCase: getUseCaseDescription(category)
      });
      
      toast.success('🎨 Professional veterinary image generated!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Hitilafu katika kutengeneza picha / Error generating image');
    } finally {
      setIsGenerating(false);
    }
  };

  const getUseCaseDescription = (cat: string) => {
    switch (cat) {
      case 'education': return 'Educational material for farmer training';
      case 'treatment': return 'Treatment procedure documentation';
      case 'prevention': return 'Disease prevention awareness';
      case 'anatomy': return 'Veterinary anatomy reference';
      default: return 'General veterinary use';
    }
  };

  const useTemplate = (template: string) => {
    setPrompt(template);
    toast.info('Template loaded! Modify as needed.');
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vetix-generated-image-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Picha imepakuliwa / Image downloaded');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Hitilafu katika kupakua picha / Error downloading image');
    }
  };

  const clearImage = () => {
    setGeneratedImage(null);
    setImageMetadata(null);
    setPrompt('');
  };

  return (
    <Card className="max-w-6xl mx-auto bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Professional Veterinary Image Generator
          <Badge variant="secondary" className="ml-auto">
            <Heart className="w-3 h-3 mr-1" />
            AI-Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                📝 Content Category
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="education">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Educational Content
                    </div>
                  </SelectItem>
                  <SelectItem value="treatment">
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4" />
                      Treatment Procedures
                    </div>
                  </SelectItem>
                  <SelectItem value="prevention">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Prevention Methods
                    </div>
                  </SelectItem>
                  <SelectItem value="anatomy">
                    <div className="flex items-center gap-2">
                      <Image className="w-4 h-4" />
                      Anatomy & Diagrams
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                📝 Describe your image / Eleza picha yako
              </label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Be specific about what you need for your veterinary work..."
                rows={4}
                className="resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                📐 Image dimensions
              </label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Square - Social Media (1024×1024)</SelectItem>
                  <SelectItem value="1792x1024">Wide - Presentations (1792×1024)</SelectItem>
                  <SelectItem value="1024x1792">Portrait - Posters (1024×1792)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={generateImage}
                disabled={isGenerating || !prompt.trim()}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Professional Image
                  </>
                )}
              </Button>
              {generatedImage && (
                <Button onClick={clearImage} variant="outline">
                  New
                </Button>
              )}
            </div>
          </div>

          {/* Middle Column - Templates */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Lightbulb className="w-4 h-4" />
              Quick Templates
            </h4>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {Object.entries(VETERINARY_TEMPLATES).map(([cat, templates]) => (
                <div key={cat} className="space-y-2">
                  <Badge variant={category === cat ? "default" : "outline"} className="text-xs">
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </Badge>
                  {templates.map((template, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start text-xs h-auto py-2 px-3"
                      onClick={() => useTemplate(template)}
                    >
                      <span className="line-clamp-2">{template}</span>
                    </Button>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Generated Image & Results */}
          <div className="space-y-4">
            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated veterinary image"
                    className="w-full rounded-lg border shadow-lg"
                  />
                  {imageMetadata && (
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-background/90">
                        {imageMetadata.category}
                      </Badge>
                    </div>
                  )}
                </div>
                
                {imageMetadata && (
                  <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                    <p className="text-sm font-medium">📋 Image Details:</p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Purpose:</strong> {imageMetadata.useCase}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Generated:</strong> {imageMetadata.generatedAt.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Original prompt:</strong> {imageMetadata.prompt}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={downloadImage}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Professional Image
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Professional Image Preview</p>
                  <p className="text-sm">Your generated veterinary content will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};