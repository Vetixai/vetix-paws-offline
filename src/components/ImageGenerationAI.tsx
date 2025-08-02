import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Image, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const ImageGenerationAI = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState('1024x1024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);

  const generateImage = async () => {
    if (!prompt.trim()) {
      toast.error('Tafadhali andika maelezo ya picha / Please describe the image you want');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: {
          prompt: prompt.trim(),
          size
        }
      });

      if (error) throw error;

      setGeneratedImage(data.imageUrl);
      toast.success('Picha imetengenezwa! / Image generated successfully!');
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Hitilafu katika kutengeneza picha / Error generating image');
    } finally {
      setIsGenerating(false);
    }
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
    setPrompt('');
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Image Generation AI / Utengenezaji wa Picha kwa Akili
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Eleza picha unayotaka / Describe the image you want
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Kwa mfano: ng'ombe mwenye afya nzuri akilisha majani / Example: healthy cow grazing in grass"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Ukubwa wa picha / Image size
              </label>
              <Select value={size} onValueChange={setSize}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024x1024">Mraba / Square (1024x1024)</SelectItem>
                  <SelectItem value="1792x1024">Upana / Wide (1792x1024)</SelectItem>
                  <SelectItem value="1024x1792">Urefu / Tall (1024x1792)</SelectItem>
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
                    Inatengeneza... / Generating...
                  </>
                ) : (
                  <>
                    <Image className="h-4 w-4 mr-2" />
                    Tengeneza Picha / Generate Image
                  </>
                )}
              </Button>
              {generatedImage && (
                <Button onClick={clearImage} variant="outline">
                  Futa / Clear
                </Button>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">
                Mifano ya maelezo / Example prompts
              </h4>
              <ul className="text-sm text-green-800 space-y-1">
                <li>• "Ng'ombe mwenye afya nzuri akila majani shambani" / "Healthy cow eating grass in field"</li>
                <li>• "Daktari wa mifugo akimkagua kuku" / "Veterinarian examining a chicken"</li>
                <li>• "Picha ya elimu kuhusu jinsi ya kunyonyesha ng'ombe" / "Educational diagram showing how to milk a cow"</li>
                <li>• "Mazingira mazuri ya kufuga kuku" / "Proper environment for raising chickens"</li>
              </ul>
            </div>
          </div>

          <div>
            {generatedImage ? (
              <div className="space-y-4">
                <div className="relative">
                  <img
                    src={generatedImage}
                    alt="Generated veterinary image"
                    className="w-full rounded-lg border shadow-lg"
                  />
                </div>
                <Button
                  onClick={downloadImage}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Pakua Picha / Download Image
                </Button>
              </div>
            ) : (
              <div className="h-64 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Picha iliyotengenezwa itaonekana hapa</p>
                  <p className="text-sm">Generated image will appear here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};