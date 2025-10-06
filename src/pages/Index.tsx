import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SpeciesSelector } from "@/components/SpeciesSelector";
import { EmergencyMode } from "@/components/EmergencyMode";
import { VoiceInput } from "@/components/VoiceInput";
import { PhotoAnalysis } from "@/components/PhotoAnalysis";
import { CommunityAgentMode } from "@/components/CommunityAgentMode";
import { AIChatAssistant } from "@/components/AIChatAssistant";
import { SmartDiagnosis } from "@/components/SmartDiagnosis";
import { VoiceToTextAI } from "@/components/VoiceToTextAI";
import { ImageGenerationAI } from "@/components/ImageGenerationAI";
import { SyncManager } from "@/components/SyncManager";
import { LocalDiagnosisHistory } from "@/components/LocalDiagnosisHistory";
import { LocalLanguageSupport, useLanguage } from "@/components/LocalLanguageSupport";
import { useVetixDataService } from "@/components/VetixDataService";
import { PreventiveCareCalendar } from "@/components/PreventiveCareCalendar";
import { EconomicImpactCalculator } from "@/components/EconomicImpactCalculator";
import DiseaseOutbreakTracker from "@/components/DiseaseOutbreakTracker";
import RegionalHealthAnalytics from "@/components/RegionalHealthAnalytics";
import SupplyChainImpactTracker from "@/components/SupplyChainImpactTracker";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLocalSync } from "@/hooks/useLocalSync";
import { supabase } from "@/integrations/supabase/client";
import { Stethoscope, Camera, MessageSquare, MapPin, Globe, Heart, Mic, Users, LogIn, LogOut, User, Brain, Image, AlertTriangle, TrendingUp, Calendar, Activity, BarChart } from "lucide-react";
import heroImage from "@/assets/vetix-hero.jpg";

const IndexContent = () => {
  const { user, signOut, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { translate, currentLanguage } = useLanguage();
  const { createDiagnosis, createAnimal, getUserDiagnoses } = useVetixDataService();
  const { saveDiagnosisLocal, isOnline } = useLocalSync();
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");
  const [symptoms, setSymptoms] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [currentStep, setCurrentStep] = useState<'welcome' | 'species' | 'symptoms' | 'diagnosis' | 'agent' | 'calendar' | 'economics' | 'outbreak' | 'analytics' | 'supply'>('welcome');
  const [showAiFeatures, setShowAiFeatures] = useState(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string>("");

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been logged out.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleStartDiagnosis = () => {
    setCurrentStep('species');
  };

  const handleSpeciesSelect = (species: string) => {
    setSelectedSpecies(species);
    setCurrentStep('symptoms');
  };

  const handleSymptomsSubmit = async () => {
    try {
      // Call AI diagnosis function
      const { data: aiResponse, error: aiError } = await supabase.functions.invoke('smart-diagnosis', {
        body: {
          symptoms: symptoms.trim(),
          animalType: selectedSpecies,
          language: currentLanguage
        }
      });

      if (aiError) throw aiError;

      const aiDiagnosis = aiResponse?.diagnosis || aiResponse?.result || "Unable to generate diagnosis. Please consult a veterinarian.";
      setDiagnosisResult(aiDiagnosis);
      
      // Save to real database if user is authenticated, otherwise save locally
      if (user) {
      try {
        await createDiagnosis({
          species: selectedSpecies,
          symptoms: symptoms,
          diagnosis_result: aiDiagnosis,
          confidence_score: 0.85,
          urgency_level: 'medium',
          is_emergency: isEmergency,
          language: currentLanguage,
          treatment_cost_estimate: 500,
          recommended_actions: [
            'Monitor eating and drinking habits',
            'Check for signs of fever',
            'Ensure clean water supply',
            'Contact vet if symptoms worsen'
          ]
        });
        
        toast({
          title: currentLanguage === 'en-KE' ? "Diagnosis Saved" : "Uchunguzi Umehifadhiwa",
          description: currentLanguage === 'en-KE' ? "Diagnosis saved to your medical records" : "Uchunguzi umehifadhiwa kwenye kumbukumbu zako za matibabu",
        });
      } catch (error) {
        console.error('Failed to save to database, saving locally:', error);
        // Fallback to local storage
        await saveDiagnosisLocal({
          species: selectedSpecies,
          symptoms: symptoms,
          diagnosis: aiDiagnosis
        });
      }
    } else {
      // Save locally if not authenticated
      try {
        await saveDiagnosisLocal({
          species: selectedSpecies,
          symptoms: symptoms,
          diagnosis: aiDiagnosis
        });
        
        toast({
          title: isOnline ? "Saved Locally" : "Saved Offline",
          description: isOnline ? "Sign in to sync with cloud" : "Will sync when online",
        });
      } catch (error) {
        toast({
          title: "Save Failed",
          description: "Could not save diagnosis record",
          variant: "destructive"
        });
      }
    }
    
    setCurrentStep('diagnosis');
    } catch (error) {
      console.error('Error during diagnosis:', error);
      toast({
        title: "Diagnosis Failed",
        description: "Could not complete diagnosis. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleVoiceTranscription = (text: string) => {
    setSymptoms(text);
  };

  const handlePhotoAnalysis = (analysis: string) => {
    setSymptoms(analysis);
    setCurrentStep('diagnosis');
  };

  const features = [
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: "AI Diagnosis",
      description: "Get instant health assessments for your animals using advanced AI",
      action: handleStartDiagnosis
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Works Offline",
      description: "Full functionality without internet connection for remote areas",
      action: () => setShowAiFeatures(true)
    },
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Photo & Voice Analysis", 
      description: "Analyze conditions through photos or speak in Swahili/English",
      action: () => {
        setShowAiFeatures(true);
        setTimeout(() => {
          const tabTrigger = document.querySelector('[value="voice-ai"]');
          if (tabTrigger) (tabTrigger as HTMLElement).click();
        }, 100);
      }
    },
    {
      icon: <Activity className="w-6 h-6" />,
      title: "Disease Tracking",
      description: "Real-time disease monitoring and outbreak prevention",
      action: () => setCurrentStep('outbreak')
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Emergency Care",
      description: "Immediate emergency response and community health support",
      action: () => setIsEmergency(true)
    }
  ];

  const renderWelcomeScreen = () => (
    <div className="space-y-12 animate-fade-in-up">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl">
        <img 
          src={heroImage} 
          alt="Vetix AI in action" 
          className="w-full h-96 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-secondary/80 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h1 className="text-5xl font-bold mb-4">Vetix AI</h1>
            <p className="text-xl mb-6">Smart Offline Veterinary Assistant for Remote Communities</p>
            <Button variant="hero" size="lg" onClick={handleStartDiagnosis}>
              Start Health Check
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
        {features.map((feature, index) => (
          <Card 
            key={index} 
            className="p-6 bg-background border-border hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={feature.action}
          >
            <div className="text-blue-600 mb-3">{feature.icon}</div>
            <h3 className="font-semibold text-lg mb-2 text-blue-600">{feature.title}</h3>
            <p className="text-muted-foreground text-sm">{feature.description}</p>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button 
          variant="default" 
          size="lg" 
          onClick={() => setShowAiFeatures(!showAiFeatures)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          <Brain className="w-4 h-4 mr-2" />
          {showAiFeatures ? 'Hide' : 'Explore'} AI Tools
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => setCurrentStep('outbreak')}
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <Activity className="w-4 h-4 mr-2" />
          Disease Tracker
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => setCurrentStep('analytics')}
          className="border-blue-600 text-blue-600 hover:bg-blue-50"
        >
          <BarChart className="w-4 h-4 mr-2" />
          Analytics
        </Button>
      </div>

      {/* AI Features Section */}
      {showAiFeatures && (
        <Card className="p-6">
          <CardHeader className="px-0 pt-0">
            <CardTitle>AI Features / Vipengele vya Akili</CardTitle>
          </CardHeader>
          <CardContent className="px-0">
            <Tabs defaultValue="smart-diagnosis" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="smart-diagnosis">Diagnosis</TabsTrigger>
                <TabsTrigger value="ai-chat">AI Chat</TabsTrigger>
                <TabsTrigger value="voice-ai">Voice</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="calendar">Calendar</TabsTrigger>
              </TabsList>

              <TabsContent value="smart-diagnosis" className="space-y-4">
                <SmartDiagnosis />
              </TabsContent>

              <TabsContent value="ai-chat" className="space-y-4">
                <AIChatAssistant />
              </TabsContent>

              <TabsContent value="voice-ai" className="space-y-4">
                <VoiceToTextAI />
              </TabsContent>

              <TabsContent value="history" className="space-y-4">
                <LocalDiagnosisHistory />
              </TabsContent>

              <TabsContent value="calendar" className="space-y-4">
                <PreventiveCareCalendar />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderSpeciesSelection = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Select Animal Type</h2>
        <p className="text-muted-foreground">Choose the type of animal you need help with</p>
      </div>
      
      <SpeciesSelector onSelect={handleSpeciesSelect} selectedSpecies={selectedSpecies} />
      
      <div className="flex justify-center">
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          Back to Home
        </Button>
      </div>
    </div>
  );

  const renderSymptomsInput = () => (
    <div className="space-y-6 animate-fade-in-up max-w-2xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">Describe Symptoms</h2>
        <p className="text-muted-foreground">Tell us what you've observed about your {selectedSpecies}</p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          {/* Voice Input for Symptoms */}
          <VoiceInput onTranscription={handleVoiceTranscription} />
          
          <div>
            <label className="block text-sm font-medium mb-2">Animal's Current Condition</label>
            <Textarea
              placeholder="Describe what you've noticed: behavior changes, physical symptoms, eating habits, etc."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-32"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Age (approx.)</label>
              <Input placeholder="e.g., 2 years, young, adult" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <Input placeholder="How long symptoms present?" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleSymptomsSubmit} 
              disabled={!symptoms.trim()}
              className="flex-1"
            >
              Get Diagnosis
            </Button>
            <Button variant="outline" onClick={() => setCurrentStep('species')}>
              Back
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  const renderDiagnosis = () => (
    <div className="space-y-6 animate-fade-in-up max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">AI Assessment Results</h2>
        <p className="text-muted-foreground">Based on the symptoms for your {selectedSpecies}</p>
      </div>

      <Card className="p-6 border-success bg-success/5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-3 h-3 bg-success rounded-full"></div>
          <h3 className="text-lg font-semibold">Likely Condition: Mild Digestive Upset</h3>
          <span className="px-2 py-1 bg-success text-success-foreground text-xs rounded-full">Low Risk</span>
        </div>
        
        <p className="text-muted-foreground mb-4">
          Based on the symptoms described, your animal may be experiencing mild digestive discomfort, 
          possibly due to dietary changes or minor stress.
        </p>

        <div className="mb-4">
          <p className="text-muted-foreground">{diagnosisResult}</p>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Recommended Actions:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Monitor food and water intake closely</li>
              <li>Provide access to fresh, clean water</li>
              <li>Consider fasting for 12-24 hours if symptoms persist</li>
              <li>Gradually reintroduce normal diet</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">When to Seek Help:</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Symptoms worsen or persist beyond 48 hours</li>
              <li>Signs of dehydration appear</li>
              <li>Animal becomes lethargic or stops eating entirely</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="success">Save to Records</Button>
          <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
            New Assessment
          </Button>
        </div>
      </Card>
    </div>
  );

  const renderAgentMode = () => (
    <div className="animate-fade-in-up">
      <CommunityAgentMode />
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          Rudi Nyumbani
        </Button>
      </div>
    </div>
  );

  const renderCalendar = () => (
    <div className="animate-fade-in-up">
      <PreventiveCareCalendar />
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          Back to Home
        </Button>
      </div>
    </div>
  );

  const renderEconomics = () => (
    <div className="animate-fade-in-up">
      <EconomicImpactCalculator />
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          Back to Home
        </Button>
      </div>
    </div>
  );

  const renderOutbreak = () => (
    <div className="animate-fade-in-up">
      <DiseaseOutbreakTracker />
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          Back to Home
        </Button>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="animate-fade-in-up">
      <RegionalHealthAnalytics />
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          Back to Home
        </Button>
      </div>
    </div>
  );

  const renderSupplyChain = () => (
    <div className="animate-fade-in-up">
      <SupplyChainImpactTracker />
      <div className="flex justify-center mt-6">
        <Button variant="outline" onClick={() => setCurrentStep('welcome')}>
          Back to Home
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      
      {/* Header with Authentication */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Vetix AI</span>
            </div>
            
            <div className="flex items-center gap-2">
              {loading ? (
                <div className="h-9 w-20 bg-muted animate-pulse rounded" />
              ) : user ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-1" />
                    Toka
                  </Button>
                </div>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" size="sm">
                    <LogIn className="h-4 w-4 mr-1" />
                    Ingia
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <EmergencyMode />
        </div>

        {currentStep === 'welcome' && renderWelcomeScreen()}
        {currentStep === 'species' && renderSpeciesSelection()}
        {currentStep === 'symptoms' && renderSymptomsInput()}
        {currentStep === 'diagnosis' && renderDiagnosis()}
        {currentStep === 'agent' && renderAgentMode()}
        {currentStep === 'calendar' && renderCalendar()}
        {currentStep === 'economics' && renderEconomics()}
        {currentStep === 'outbreak' && renderOutbreak()}
        {currentStep === 'analytics' && renderAnalytics()}
        {currentStep === 'supply' && renderSupplyChain()}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      <IndexContent />
    </div>
  );
};

export default Index;
