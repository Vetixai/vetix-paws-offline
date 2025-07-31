import { AlertTriangle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmergencyModeProps {
  isEmergency: boolean;
  onToggle: () => void;
}

export const EmergencyMode = ({ isEmergency, onToggle }: EmergencyModeProps) => {
  if (isEmergency) {
    return (
      <Card className="border-destructive bg-destructive/5 p-6 animate-pulse-emergency">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-destructive" />
          <h2 className="text-xl font-bold text-destructive">Emergency Mode Active</h2>
        </div>
        
        <div className="space-y-4">
          <p className="text-foreground">
            Emergency protocols are now active. Please follow these immediate steps:
          </p>
          
          <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
            <li>Ensure animal safety and your own safety first</li>
            <li>If severe bleeding, apply clean pressure to wounds</li>
            <li>Keep animal calm and in safe, comfortable position</li>
            <li>Contact local veterinarian immediately if available</li>
            <li>Document symptoms and provide care as directed below</li>
          </ol>
          
          <div className="flex gap-3">
            <Button variant="emergency" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Emergency Contacts
            </Button>
            <Button variant="outline" onClick={onToggle}>
              Exit Emergency Mode
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Button 
      variant="destructive" 
      onClick={onToggle}
      className="flex items-center gap-2"
    >
      <AlertTriangle className="w-4 h-4" />
      Emergency Mode
    </Button>
  );
};