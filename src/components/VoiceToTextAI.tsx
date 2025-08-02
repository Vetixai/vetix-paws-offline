import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Square, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export const VoiceToTextAI = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      setAudioChunks([]);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        await processAudio();
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      toast.success('Kurekodi kumeanza / Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Hitilafu katika kurekodi / Error starting recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (audioChunks.length === 0) {
      toast.error('Hakuna data ya sauti / No audio data');
      return;
    }

    setIsProcessing(true);
    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Convert blob to base64
      const arrayBuffer = await audioBlob.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      let binary = '';
      const chunkSize = 0x8000;
      
      for (let i = 0; i < uint8Array.length; i += chunkSize) {
        const chunk = uint8Array.subarray(i, Math.min(i + chunkSize, uint8Array.length));
        binary += String.fromCharCode.apply(null, Array.from(chunk));
      }
      
      const base64Audio = btoa(binary);

      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: {
          audio: base64Audio,
          language: 'sw' // Swahili
        }
      });

      if (error) throw error;

      setTranscription(data.text);
      toast.success('Nakala imepatikana / Transcription complete');
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Hitilafu katika kuchakata sauti / Error processing audio');
    } finally {
      setIsProcessing(false);
      setAudioChunks([]);
    }
  };

  const clearTranscription = () => {
    setTranscription('');
    setAudioChunks([]);
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mic className="h-5 w-5" />
          Voice to Text AI / Sauti kuwa Nakala
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center space-y-4">
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                disabled={isProcessing}
                size="lg"
                className="h-16 w-16 rounded-full"
              >
                <Mic className="h-6 w-6" />
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                variant="destructive"
                size="lg"
                className="h-16 w-16 rounded-full animate-pulse"
              >
                <Square className="h-6 w-6" />
              </Button>
            )}
          </div>

          <div className="text-sm text-muted-foreground">
            {isRecording && (
              <p className="text-red-500 font-medium animate-pulse">
                🔴 Kurekodi... Bonyeza ili kumaliza / Recording... Click to stop
              </p>
            )}
            {isProcessing && (
              <p className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Inachakata sauti... / Processing audio...
              </p>
            )}
            {!isRecording && !isProcessing && (
              <p>
                Bonyeza kipengele cha mikrofoni ili kuanza kurekodi / 
                Click the microphone button to start recording
              </p>
            )}
          </div>
        </div>

        {transcription && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                Nakala / Transcription
              </h3>
              <Button onClick={clearTranscription} variant="outline" size="sm">
                Futa / Clear
              </Button>
            </div>
            <div className="p-4 bg-muted rounded-lg border">
              <p className="text-sm whitespace-pre-wrap">{transcription}</p>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">
            Maelekezo / Instructions
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Ongea kwa uwazi karibu na mikrofoni / Speak clearly near the microphone</li>
            <li>• Inasaidia lugha za Kiswahili na Kiingereza / Supports Swahili and English</li>
            <li>• Bonyeza kumaliza kabla ya kupokea nakala / Click stop before getting transcription</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};