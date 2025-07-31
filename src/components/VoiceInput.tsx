import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Extend the Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface VoiceInputProps {
  onTranscription: (text: string) => void;
  language?: string;
}

export const VoiceInput = ({ onTranscription, language = "sw-KE" }: VoiceInputProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
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

  return (
    <Card className="p-4 bg-primary/5 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-foreground">Sauti ya Mkulima (Voice Assistant)</h3>
          <div className="flex gap-2">
            <Button
              variant={isListening ? "destructive" : "default"}
              size="sm"
              onClick={isListening ? stopListening : startListening}
              className="gap-2"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? "Acha" : "Ongea"}
            </Button>
            
            {transcript && (
              <Button
                variant="outline"
                size="sm"
                onClick={isSpeaking ? stopSpeaking : () => speakText(transcript)}
                className="gap-2"
              >
                {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                {isSpeaking ? "Kimya" : "Sikia"}
              </Button>
            )}
          </div>
        </div>

        {transcript && (
          <div className="p-3 bg-background rounded-md border">
            <p className="text-sm text-muted-foreground mb-1">Ulisema:</p>
            <p className="text-foreground">{transcript}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>🗣️ Ongea kwa Kiswahili au Kingereza</p>
          <p>🎯 Eleza dalili za mnyama wako</p>
          <p>📱 Bonyeza kitufe cha "Ongea" ili kuanza</p>
        </div>
      </div>
    </Card>
  );
};