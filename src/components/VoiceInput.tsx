import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Volume2, VolumeX, Brain, Sparkles, Languages } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Extend the Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  onDiagnosisGenerated?: (diagnosis: string) => void;
  language?: string;
  animalType?: string;
}

interface VoiceAnalysis {
  transcription: string;
  confidence: number;
  detectedSymptoms: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  suggestedDiagnosis?: string;
}

export const VoiceInput = ({ 
  onTranscription, 
  onDiagnosisGenerated,
  language = "sw-KE",
  animalType = "ng'ombe"
}: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [supportedLanguages] = useState([
    { code: "sw-KE", name: "Kiswahili", flag: "🇰🇪" },
    { code: "en-US", name: "English", flag: "🇺🇸" },
    { code: "rw-RW", name: "Kinyarwanda", flag: "🇷🇼" },
    { code: "am-ET", name: "Amharic", flag: "🇪🇹" },
    { code: "ar-EG", name: "Arabic", flag: "🇪🇬" }
  ]);
  const { toast } = useToast();
  const recognitionRef = useRef<any>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Huduma haipatikani",
        description: "Kivinjari chako hakitumii utambuzi wa sauti. Tumia maandishi badala yake.",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Sikiliza...",
        description: "Sema dalili za mnyama wako kwa Kiswahili au Kingereza",
      });
    };

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = 0; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
      
      if (finalTranscript) {
        onTranscription(finalTranscript);
        setTranscript(finalTranscript);
        analyzeVoiceInput(finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      toast({
        title: "Hitilafu",
        description: "Imeshindwa kusikia. Jaribu tena.",
        variant: "destructive",
      });
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    recognitionRef.current = recognition;
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const speakText = (text: string) => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Huduma haipatikani",
        description: "Kivinjari chako hakitumii usomaji wa maneno",
        variant: "destructive",
      });
      return;
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.8;
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };

    speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const analyzeVoiceInput = async (text: string) => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: {
          text,
          language,
          animalType,
          analysisType: 'veterinary_symptoms'
        }
      });

      if (error) throw error;

      const analysis: VoiceAnalysis = {
        transcription: text,
        confidence: data.confidence || 0.85,
        detectedSymptoms: data.symptoms || [],
        urgencyLevel: data.urgencyLevel || 'medium',
        suggestedDiagnosis: data.diagnosis
      };

      setVoiceAnalysis(analysis);

      if (analysis.suggestedDiagnosis && onDiagnosisGenerated) {
        onDiagnosisGenerated(analysis.suggestedDiagnosis);
      }

      // Provide voice feedback
      const urgencyMessage = analysis.urgencyLevel === 'critical' 
        ? "Hali ya hatari! Piga simu daktari wa mifugo mara moja!" 
        : analysis.urgencyLevel === 'high'
        ? "Hali mbaya. Tafuta msaada wa daktari haraka."
        : "Nimesikia. Hapa kuna mshauri wangu.";
      
      speakText(urgencyMessage);

      toast({
        title: `🎯 Confidence: ${Math.round(analysis.confidence * 100)}%`,
        description: `Detected ${analysis.detectedSymptoms.length} symptoms`,
      });

    } catch (error) {
      console.error('Voice analysis error:', error);
      toast({
        title: "Hitilafu ya uchambuzi",
        description: "Haiwezi kuchambu sauti. Jaribu tena.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          AI Voice Veterinarian
          <Badge variant="secondary" className="ml-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            Smart Analysis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Language Selection */}
        <div className="flex flex-wrap gap-2">
          {supportedLanguages.map((lang) => (
            <Badge
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              className="cursor-pointer text-xs"
              onClick={() => {
                // Language switching would be handled by parent component
                toast({
                  title: `${lang.flag} ${lang.name}`,
                  description: "Language selected",
                });
              }}
            >
              {lang.flag} {lang.name}
            </Badge>
          ))}
        </div>

        {/* Voice Controls */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              className="gap-2"
              disabled={isAnalyzing}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? "Acha" : "🎤 Ongea"}
            </Button>
            
            {transcript && (
              <Button
                variant="outline"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : () => speakText(transcript)}
                className="gap-2"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSpeaking ? "Kimya" : "🔊 Sikia"}
              </Button>
            )}
          </div>

          {isAnalyzing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Brain className="w-4 h-4 animate-pulse" />
              Analyzing symptoms...
            </div>
          )}
        </div>

        {/* Transcription Display */}
        {transcript && (
          <div className="p-3 bg-background rounded-md border">
            <p className="text-sm text-muted-foreground mb-1">🗣️ Ulisema / You said:</p>
            <p className="text-foreground">{transcript}</p>
          </div>
        )}

        {/* AI Analysis Results */}
        {voiceAnalysis && (
          <div className="space-y-3 p-4 bg-gradient-to-r from-background to-muted/50 rounded-lg border">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                AI Analysis
              </h4>
              <div className="flex items-center gap-2">
                <Badge variant={getUrgencyColor(voiceAnalysis.urgencyLevel)}>
                  {voiceAnalysis.urgencyLevel.toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  {Math.round(voiceAnalysis.confidence * 100)}% sure
                </Badge>
              </div>
            </div>

            {voiceAnalysis.detectedSymptoms.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">🎯 Detected Symptoms:</p>
                <div className="flex flex-wrap gap-1">
                  {voiceAnalysis.detectedSymptoms.map((symptom, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {voiceAnalysis.suggestedDiagnosis && (
              <div className="p-3 bg-primary/5 rounded border border-primary/20">
                <p className="text-sm font-medium mb-1">💡 Suggested Diagnosis:</p>
                <p className="text-sm text-muted-foreground">{voiceAnalysis.suggestedDiagnosis}</p>
              </div>
            )}
          </div>
        )}

        {/* Usage Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/30 rounded">
          <p className="flex items-center gap-2">
            <Languages className="w-3 h-3" />
            🌍 Speak in Swahili, English, or other supported languages
          </p>
          <p>🎯 Describe animal symptoms clearly and in detail</p>
          <p>🤖 AI will analyze and provide instant veterinary insights</p>
          <p>⚡ Get urgency levels and confidence scores</p>
        </div>
      </CardContent>
    </Card>
  );
};