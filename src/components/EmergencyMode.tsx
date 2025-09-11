import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Phone, MapPin, Clock, Heart, Thermometer, Activity, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface EmergencyAssessment {
  severity: 'critical' | 'urgent' | 'moderate';
  symptoms: string[];
  immediateActions: string[];
  timeToTreat: string;
  nearestVet?: {
    name: string;
    distance: string;
    phone: string;
    available: boolean;
  };
}

export const EmergencyMode = () => {
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);
  const [assessment, setAssessment] = useState<EmergencyAssessment | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [vitalSigns, setVitalSigns] = useState({
    temperature: '',
    heartRate: '',
    breathing: '',
    consciousness: ''
  });
  const { toast } = useToast();

  const emergencySymptoms = [
    { id: 'breathing', label: 'Difficulty breathing/gasping', severity: 'critical' },
    { id: 'collapse', label: 'Collapsed/unable to stand', severity: 'critical' },
    { id: 'bleeding', label: 'Severe bleeding', severity: 'critical' },
    { id: 'seizure', label: 'Seizures/convulsions', severity: 'critical' },
    { id: 'poison', label: 'Suspected poisoning', severity: 'critical' },
    { id: 'bloat', label: 'Severe abdominal swelling', severity: 'urgent' },
    { id: 'temperature', label: 'Very high/low temperature', severity: 'urgent' },
    { id: 'pain', label: 'Extreme pain/distress', severity: 'urgent' },
  ];

  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const activateEmergencyMode = () => {
    setIsEmergencyMode(true);
    toast({
      title: "🚨 EMERGENCY MODE ACTIVATED",
      description: "Prioritizing critical care assessment",
      variant: "destructive",
    });
  };

  const performEmergencyAssessment = async () => {
    setIsAssessing(true);
    
    // Simulate AI emergency assessment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const criticalSymptoms = selectedSymptoms.filter(id => 
      emergencySymptoms.find(s => s.id === id)?.severity === 'critical'
    );
    
    const assessment: EmergencyAssessment = {
      severity: criticalSymptoms.length > 0 ? 'critical' : 
                selectedSymptoms.length > 2 ? 'urgent' : 'moderate',
      symptoms: selectedSymptoms.map(id => 
        emergencySymptoms.find(s => s.id === id)?.label || ''
      ),
      immediateActions: criticalSymptoms.length > 0 ? [
        "Keep animal calm and still",
        "Clear airway if breathing problems",
        "Control bleeding with clean cloth",
        "Contact emergency vet immediately",
        "Prepare for transport"
      ] : [
        "Monitor vital signs closely",
        "Keep animal comfortable",
        "Document symptoms",
        "Contact veterinarian"
      ],
      timeToTreat: criticalSymptoms.length > 0 ? "IMMEDIATE - Within 30 minutes" : 
                   selectedSymptoms.length > 2 ? "Within 2-4 hours" : "Within 24 hours",
      nearestVet: {
        name: "Dr. Mwangi Emergency Veterinary Clinic",
        distance: "2.3 km away",
        phone: "+254-700-123-456",
        available: true
      }
    };
    
    setAssessment(assessment);
    setIsAssessing(false);
    
    if (assessment.severity === 'critical') {
      toast({
        title: "⚠️ CRITICAL EMERGENCY DETECTED",
        description: "Immediate veterinary attention required!",
        variant: "destructive",
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'urgent': return 'destructive';
      case 'moderate': return 'default';
      default: return 'secondary';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <Zap className="w-4 h-4" />;
      case 'urgent': return <AlertTriangle className="w-4 h-4" />;
      default: return <Heart className="w-4 h-4" />;
    }
  };

  if (!isEmergencyMode) {
    return (
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Emergency Veterinary Response
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              For life-threatening animal emergencies requiring immediate attention
            </p>
            <Button 
              onClick={activateEmergencyMode}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
              size="lg"
            >
              <AlertTriangle className="w-5 h-5" />
              ACTIVATE EMERGENCY MODE
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Emergency Header */}
      <Alert className="border-red-500 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800 font-medium">
          🚨 EMERGENCY MODE ACTIVE - Critical animal health assessment in progress
        </AlertDescription>
      </Alert>

      {/* Symptom Selection */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Emergency Symptom Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {emergencySymptoms.map((symptom) => (
              <div
                key={symptom.id}
                className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedSymptoms.includes(symptom.id)
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300'
                }`}
                onClick={() => {
                  setSelectedSymptoms(prev =>
                    prev.includes(symptom.id)
                      ? prev.filter(id => id !== symptom.id)
                      : [...prev, symptom.id]
                  );
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{symptom.label}</span>
                  <Badge 
                    variant={symptom.severity === 'critical' ? 'destructive' : 'default'}
                    className="text-xs"
                  >
                    {symptom.severity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Vital Signs */}
          <Separator />
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Quick Vital Signs (if possible)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Temperature</label>
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4" />
                  <input
                    type="text"
                    placeholder="°C"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    value={vitalSigns.temperature}
                    onChange={(e) => setVitalSigns(prev => ({...prev, temperature: e.target.value}))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Heart Rate</label>
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  <input
                    type="text"
                    placeholder="BPM"
                    className="flex-1 px-2 py-1 border rounded text-sm"
                    value={vitalSigns.heartRate}
                    onChange={(e) => setVitalSigns(prev => ({...prev, heartRate: e.target.value}))}
                  />
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={performEmergencyAssessment}
            disabled={selectedSymptoms.length === 0 || isAssessing}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isAssessing ? (
              <>
                <Activity className="w-4 h-4 mr-2 animate-pulse" />
                Performing Emergency Assessment...
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 mr-2" />
                PERFORM EMERGENCY ASSESSMENT
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Assessment Results */}
      {assessment && (
        <Card className={`border-2 ${assessment.severity === 'critical' ? 'border-red-500 bg-red-50' : 'border-orange-300 bg-orange-50'}`}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {getSeverityIcon(assessment.severity)}
                Emergency Assessment Results
              </span>
              <Badge variant={getSeverityColor(assessment.severity)} className="text-lg px-3 py-1">
                {assessment.severity.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Time Critical */}
            <Alert className={assessment.severity === 'critical' ? 'border-red-500 bg-red-100' : 'border-orange-400 bg-orange-100'}>
              <Clock className="h-4 w-4" />
              <AlertDescription className="font-semibold">
                ⏰ Time to Treatment: {assessment.timeToTreat}
              </AlertDescription>
            </Alert>

            {/* Immediate Actions */}
            <div>
              <h4 className="font-semibold mb-2 text-red-700">🆘 IMMEDIATE ACTIONS REQUIRED:</h4>
              <ul className="space-y-1">
                {assessment.immediateActions.map((action, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <span className="bg-red-100 text-red-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold mt-0.5">
                      {index + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* Nearest Vet */}
            {assessment.nearestVet && (
              <div className="bg-white p-4 rounded-lg border-2 border-green-200">
                <h4 className="font-semibold mb-2 text-green-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Nearest Emergency Veterinarian
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{assessment.nearestVet.name}</span>
                    <Badge variant={assessment.nearestVet.available ? 'default' : 'secondary'}>
                      {assessment.nearestVet.available ? 'Available' : 'Call to confirm'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{assessment.nearestVet.distance}</p>
                  <Button 
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => window.open(`tel:${assessment.nearestVet?.phone}`)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    CALL NOW: {assessment.nearestVet.phone}
                  </Button>
                </div>
              </div>
            )}

            {/* Exit Emergency Mode */}
            <Button 
              variant="outline" 
              onClick={() => {
                setIsEmergencyMode(false);
                setAssessment(null);
                setSelectedSymptoms([]);
              }}
              className="w-full"
            >
              Exit Emergency Mode
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};