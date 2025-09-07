import { Wifi, WifiOff, Database, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocalSync } from "@/hooks/useLocalSync";
import { Button } from "@/components/ui/button";

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { syncStatus, pendingCount, triggerSync } = useLocalSync();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getStatusDisplay = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: "Offline Mode",
        bgColor: 'bg-muted',
        textColor: 'text-muted-foreground',
        borderColor: 'border-warning',
        showPulse: true
      };
    }
    
    if (syncStatus === 'syncing') {
      return {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        text: "Syncing...",
        bgColor: 'bg-primary',
        textColor: 'text-primary-foreground',
        borderColor: 'border-primary',
        showPulse: false
      };
    }
    
    if (pendingCount > 0) {
      return {
        icon: <Database className="w-4 h-4" />,
        text: `${pendingCount} Pending`,
        bgColor: 'bg-warning',
        textColor: 'text-warning-foreground',
        borderColor: 'border-warning',
        showPulse: false
      };
    }
    
    return {
      icon: <Wifi className="w-4 h-4" />,
      text: "Online",
      bgColor: 'bg-success',
      textColor: 'text-success-foreground',
      borderColor: 'border-success',
      showPulse: false
    };
  };

  const status = getStatusDisplay();

  return (
    <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg shadow-soft transition-all duration-300 ${
      status.showPulse ? 'animate-pulse' : ''
    }`}>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 ${status.bgColor} ${status.textColor} ${status.borderColor}`}>
        {status.icon}
        <span className="text-sm font-medium">{status.text}</span>
      </div>
      
      {isOnline && pendingCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={triggerSync}
          disabled={syncStatus === 'syncing'}
          className="h-8 px-2"
        >
          <RefreshCw className={`w-3 h-3 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
        </Button>
      )}
    </div>
  );
};