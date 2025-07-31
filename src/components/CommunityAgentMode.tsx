import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, MapPin, Phone, User, CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface CaseRecord {
  id: string;
  farmerName: string;
  location: string;
  animalType: string;
  condition: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed' | 'followup';
  date: string;
}

export const CommunityAgentMode = () => {
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [agentName, setAgentName] = useState("");
  const [currentLocation, setCurrentLocation] = useState("");
  const [cases, setCases] = useState<CaseRecord[]>([
    {
      id: "001",
      farmerName: "Mama Wanjiku",
      location: "Kiambu",
      animalType: "ng'ombe",
      condition: "Haraka ya tumbo",
      urgency: "medium",
      status: "pending",
      date: "2025-01-31"
    },
    {
      id: "002", 
      farmerName: "Mzee Kamau",
      location: "Thika",
      animalType: "mbwa",
      condition: "Jeraha la mguu",
      urgency: "high",
      status: "completed",
      date: "2025-01-30"
    }
  ]);

  const startAgentMode = () => {
    if (!agentName.trim()) return;
    setIsAgentMode(true);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'followup': return <Clock className="w-4 h-4 text-warning" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-destructive" />;
      default: return null;
    }
  };

  if (!isAgentMode) {
    return (
      <Card className="p-6 bg-accent/50">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Users className="w-12 h-12 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">Hali ya Afisa wa Jamii</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Ingia kama afisa wa afya ya wanyamapori wa kijamii ili kusaidia wakulima wengi katika eneo lako
          </p>
          
          <div className="space-y-3 max-w-sm mx-auto">
            <Input
              placeholder="Jina lako (Mfano: Dkt. Sarah)"
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
            />
            <Input
              placeholder="Eneo (Mfano: Kiambu County)"
              value={currentLocation}
              onChange={(e) => setCurrentLocation(e.target.value)}
            />
            <Button 
              onClick={startAgentMode}
              disabled={!agentName.trim()}
              className="w-full"
            >
              Anza Kazi ya Jamii
            </Button>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>👩‍⚕️ Kwa afisa wa afya ya wanyamapori</p>
            <p>📱 Tumia kifaa kimoja kusaidia wakulima wengi</p>
            <p>📊 Fuatilia kesi na takwimu za eneo</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Agent Header */}
      <Card className="p-4 bg-primary/10 border-primary/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">{agentName}</h3>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {currentLocation}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAgentMode(false)}
          >
            Maliza Kipindi
          </Button>
        </div>
      </Card>

      {/* Daily Cases */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Kesi za Leo</h3>
          <Badge variant="outline">{cases.length} kesi</Badge>
        </div>

        <div className="space-y-3">
          {cases.map((case_) => (
            <Card key={case_.id} className="p-4 border-l-4 border-l-primary/50">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{case_.farmerName}</span>
                    <Badge variant={getUrgencyColor(case_.urgency)}>
                      {case_.urgency === 'high' ? 'Haraka' : 
                       case_.urgency === 'medium' ? 'Wastani' : 'Pole'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {case_.location}
                    </p>
                    <p><strong>Mnyama:</strong> {case_.animalType}</p>
                    <p><strong>Hali:</strong> {case_.condition}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getStatusIcon(case_.status)}
                  <Button size="sm" variant="outline">
                    {case_.status === 'pending' ? 'Anza' : 'Angalia'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button className="w-full mt-4">
          <Phone className="w-4 h-4 mr-2" />
          Ongeza Kesi Mpya
        </Button>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success">12</div>
          <div className="text-xs text-muted-foreground">Zimekamilika</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-warning">3</div>
          <div className="text-xs text-muted-foreground">Zinangoja</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">85%</div>
          <div className="text-xs text-muted-foreground">Mafanikio</div>
        </Card>
      </div>
    </div>
  );
};