import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Bot, User, Mic, Image, Brain, Sparkles, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'image' | 'voice' | 'diagnosis';
  metadata?: {
    confidence?: number;
    animalType?: string;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface QuickSuggestion {
  id: string;
  text: string;
  category: 'symptoms' | 'general' | 'emergency';
  icon: string;
}

export const AIChatAssistant = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your AI Veterinary Assistant. I can help you with animal health questions, symptoms analysis, treatment advice, and more. What animal would you like to discuss today?",
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedAnimalType, setSelectedAnimalType] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const quickSuggestions: QuickSuggestion[] = [
    { id: '1', text: "My cow is not eating", category: 'symptoms', icon: '🐄' },
    { id: '2', text: "Chicken laying problems", category: 'symptoms', icon: '🐔' },
    { id: '3', text: "Goat breathing difficulties", category: 'emergency', icon: '🐐' },
    { id: '4', text: "Vaccination schedule", category: 'general', icon: '💉' },
    { id: '5', text: "Pregnancy signs in animals", category: 'general', icon: '🤱' },
    { id: '6', text: "Emergency first aid", category: 'emergency', icon: '🚨' },
  ];

  const animalTypes = [
    { value: 'cattle', label: 'Cattle/Cows', icon: '🐄' },
    { value: 'goats', label: 'Goats', icon: '🐐' },
    { value: 'sheep', label: 'Sheep', icon: '🐑' },
    { value: 'poultry', label: 'Chickens/Poultry', icon: '🐔' },
    { value: 'pigs', label: 'Pigs', icon: '🐷' },
    { value: 'other', label: 'Other', icon: '🐾' },
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: content,
          animalType: selectedAnimalType,
          chatHistory: messages.slice(-5), // Last 5 messages for context
          context: 'veterinary_consultation'
        }
      });

      if (error) throw error;

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "I apologize, but I'm having trouble processing your request right now. Please try again.",
        timestamp: new Date(),
        type: 'text',
        metadata: {
          confidence: data.confidence,
          animalType: selectedAnimalType,
          urgency: data.urgency
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Show urgency alert if high priority
      if (data.urgency === 'critical' || data.urgency === 'high') {
        toast({
          title: "⚠️ Urgent Attention Needed",
          description: "Consider consulting a veterinarian immediately",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('AI Chat error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again or contact a veterinarian directly if this is urgent.",
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Unable to reach AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: QuickSuggestion) => {
    sendMessage(suggestion.text);
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support voice input",
        variant: "destructive",
      });
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      toast({
        title: "Listening...",
        description: "Speak your question about animal health",
      });
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      toast({
        title: "Voice Error",
        description: "Could not capture voice. Please try again.",
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Veterinary Assistant
            <Badge variant="secondary" className="ml-2">
              <Sparkles className="w-3 h-3 mr-1" />
              Smart Chat
            </Badge>
          </CardTitle>
          
          {/* Animal Type Selector */}
          <select
            value={selectedAnimalType}
            onChange={(e) => setSelectedAnimalType(e.target.value)}
            className="px-3 py-1 text-sm border rounded-md bg-background"
          >
            <option value="">Select Animal</option>
            {animalTypes.map((animal) => (
              <option key={animal.value} value={animal.value}>
                {animal.icon} {animal.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-0">
        {/* Quick Suggestions */}
        <div className="px-4">
          <p className="text-sm text-muted-foreground mb-2">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs"
              >
                {suggestion.icon} {suggestion.text}
              </Button>
            ))}
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 px-4">
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="w-8 h-8 bg-primary/10">
                    <AvatarFallback>
                      <Bot className="w-4 h-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={`max-w-[80%] ${message.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`rounded-lg p-3 ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-muted'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
                    {message.metadata && (
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-opacity-20">
                        {message.metadata.confidence && (
                          <Badge variant="outline" className="text-xs">
                            <Brain className="w-3 h-3 mr-1" />
                            {Math.round(message.metadata.confidence * 100)}%
                          </Badge>
                        )}
                        {message.metadata.urgency && (
                          <Badge variant={getUrgencyColor(message.metadata.urgency)} className="text-xs">
                            {message.metadata.urgency}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>

                {message.role === 'user' && (
                  <Avatar className="w-8 h-8 bg-secondary">
                    <AvatarFallback>
                      <User className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <Avatar className="w-8 h-8 bg-primary/10">
                  <AvatarFallback>
                    <Bot className="w-4 h-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="px-4 pb-4">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask about ${selectedAnimalType || 'animal'} health...`}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(inputMessage);
                  }
                }}
                className="pr-10"
                disabled={isTyping}
              />
              <Button
                size="sm"
                variant="ghost"
                className="absolute right-1 top-1 h-8 w-8 p-0"
                onClick={startVoiceInput}
                disabled={isListening || isTyping}
              >
                <Mic className={`w-4 h-4 ${isListening ? 'text-red-500 animate-pulse' : ''}`} />
              </Button>
            </div>
            
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isTyping}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            🤖 AI Assistant powered by veterinary knowledge • Always consult a professional for emergencies
          </p>
        </div>
      </CardContent>
    </Card>
  );
};