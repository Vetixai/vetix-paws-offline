import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { WifiOff, Wifi, Download, Upload, Database, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface OfflineData {
  diagnoses: number;
  images: number;
  voiceRecordings: number;
  treatments: number;
  lastSync: Date | null;
}

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineData, setOfflineData] = useState<OfflineData>({
    diagnoses: 0,
    images: 0,
    voiceRecordings: 0,
    treatments: 0,
    lastSync: null
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "🌐 Back Online",
        description: "Internet connection restored. You can now sync your data.",
      });
      loadOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "📱 Offline Mode",
        description: "Working offline. Your data will be saved locally and synced when connection returns.",
        variant: "destructive",
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Load offline data on component mount
    loadOfflineData();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const loadOfflineData = () => {
    // Simulate loading offline data from localStorage
    const storedDiagnoses = localStorage.getItem('offline_diagnoses');
    const storedImages = localStorage.getItem('offline_images');
    const storedVoice = localStorage.getItem('offline_voice');
    const storedTreatments = localStorage.getItem('offline_treatments');
    const lastSyncStr = localStorage.getItem('last_sync');

    setOfflineData({
      diagnoses: storedDiagnoses ? JSON.parse(storedDiagnoses).length : 0,
      images: storedImages ? JSON.parse(storedImages).length : 0,
      voiceRecordings: storedVoice ? JSON.parse(storedVoice).length : 0,
      treatments: storedTreatments ? JSON.parse(storedTreatments).length : 0,
      lastSync: lastSyncStr ? new Date(lastSyncStr) : null
    });
  };

  const syncOfflineData = async () => {
    if (!isOnline) {
      toast({
        title: "No Internet Connection",
        description: "Please check your connection and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncing(true);

    try {
      // Simulate syncing process
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Clear offline data after successful sync
      localStorage.removeItem('offline_diagnoses');
      localStorage.removeItem('offline_images');
      localStorage.removeItem('offline_voice');
      localStorage.removeItem('offline_treatments');
      localStorage.setItem('last_sync', new Date().toISOString());

      setOfflineData({
        diagnoses: 0,
        images: 0,
        voiceRecordings: 0,
        treatments: 0,
        lastSync: new Date()
      });

      toast({
        title: "✅ Sync Complete",
        description: "All offline data has been successfully synced to the cloud.",
      });

    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Could not sync offline data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const getTotalOfflineItems = () => {
    return offlineData.diagnoses + offlineData.images + offlineData.voiceRecordings + offlineData.treatments;
  };

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className={`border-2 ${isOnline ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isOnline ? (
                <Wifi className="w-5 h-5 text-green-600" />
              ) : (
                <WifiOff className="w-5 h-5 text-orange-600" />
              )}
              <div>
                <h4 className="font-semibold">
                  {isOnline ? 'Online' : 'Offline Mode'}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {isOnline 
                    ? 'Connected to internet • Data syncing available' 
                    : 'Working offline • Data saved locally'
                  }
                </p>
              </div>
            </div>
            
            <Badge variant={isOnline ? 'default' : 'secondary'}>
              {isOnline ? 'Connected' : 'Offline'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Offline Data Summary */}
      {(!isOnline || getTotalOfflineItems() > 0) && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Offline Data Storage
                </h4>
                <Badge variant="outline">
                  {getTotalOfflineItems()} items
                </Badge>
              </div>

              {getTotalOfflineItems() > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <p className="text-2xl font-bold text-primary">{offlineData.diagnoses}</p>
                      <p className="text-xs text-muted-foreground">Diagnoses</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <p className="text-2xl font-bold text-primary">{offlineData.images}</p>
                      <p className="text-xs text-muted-foreground">Images</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <p className="text-2xl font-bold text-primary">{offlineData.voiceRecordings}</p>
                      <p className="text-xs text-muted-foreground">Voice Notes</p>
                    </div>
                    <div className="text-center p-3 bg-muted/50 rounded">
                      <p className="text-2xl font-bold text-primary">{offlineData.treatments}</p>
                      <p className="text-xs text-muted-foreground">Treatments</p>
                    </div>
                  </div>

                  {isOnline && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        You have {getTotalOfflineItems()} items stored offline. Sync them to the cloud to free up local storage and access them from other devices.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  <p>Last sync: {formatLastSync(offlineData.lastSync)}</p>
                </div>
                
                {isOnline && getTotalOfflineItems() > 0 && (
                  <Button
                    onClick={syncOfflineData}
                    disabled={isSyncing}
                    size="sm"
                    className="gap-2"
                  >
                    {isSyncing ? (
                      <>
                        <Upload className="w-4 h-4 animate-pulse" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Sync Now
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Capabilities */}
      {!isOnline && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-blue-600" />
              Available Offline Features
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>✅ Photo analysis using local AI models</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>✅ Voice recording and transcription</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>✅ Basic symptom assessment</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>✅ Treatment recommendations from cached data</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>✅ Livestock identification and records</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>⏳ Advanced AI chat (requires connection)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>⏳ Community features (requires connection)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};