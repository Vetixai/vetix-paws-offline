import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useLocalSync } from '@/hooks/useLocalSync';
import { 
  ArrowLeft, 
  Database, 
  Trash2, 
  RefreshCw, 
  Clock, 
  HardDrive,
  CheckCircle,
  AlertTriangle,
  Settings as SettingsIcon,
  Download,
  Shield
} from 'lucide-react';

interface OfflineSettings {
  autoSync: boolean;
  syncInterval: number; // in minutes
  dataRetention: number; // in days
  wifiOnly: boolean;
  deleteAfterSync: boolean;
}

const Settings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isOnline, pendingCount, triggerSync } = useLocalSync();
  
  const [settings, setSettings] = useState<OfflineSettings>({
    autoSync: true,
    syncInterval: 30,
    dataRetention: 30,
    wifiOnly: false,
    deleteAfterSync: false,
  });
  
  const [storageInfo, setStorageInfo] = useState({
    used: 0,
    available: 0,
    total: 0,
    percentage: 0,
  });
  
  const [isClearing, setIsClearing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('vetix_offline_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    
    const lastSync = localStorage.getItem('vetix_last_sync');
    if (lastSync) {
      setLastSyncTime(new Date(lastSync));
    }
  }, []);

  // Estimate storage usage
  useEffect(() => {
    const estimateStorage = async () => {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const total = estimate.quota || 0;
        const available = total - used;
        const percentage = total > 0 ? (used / total) * 100 : 0;
        
        setStorageInfo({
          used: Math.round(used / 1024 / 1024), // Convert to MB
          available: Math.round(available / 1024 / 1024),
          total: Math.round(total / 1024 / 1024),
          percentage: Math.round(percentage),
        });
      }
    };
    
    estimateStorage();
  }, []);

  const updateSettings = (newSettings: Partial<OfflineSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    localStorage.setItem('vetix_offline_settings', JSON.stringify(updated));
    
    toast({
      title: "Settings Updated",
      description: "Your offline preferences have been saved.",
    });
  };

  const handleClearOfflineData = async () => {
    if (!confirm('Are you sure you want to clear all offline data? This action cannot be undone.')) {
      return;
    }
    
    setIsClearing(true);
    
    try {
      // Clear IndexedDB
      const DBDeleteRequest = indexedDB.deleteDatabase('VetixOfflineDB');
      
      await new Promise((resolve, reject) => {
        DBDeleteRequest.onsuccess = () => resolve(true);
        DBDeleteRequest.onerror = () => reject(DBDeleteRequest.error);
      });
      
      // Clear localStorage offline data
      localStorage.removeItem('vetix_offline_diagnoses');
      localStorage.removeItem('vetix_last_sync');
      setLastSyncTime(null);
      
      toast({
        title: "Data Cleared",
        description: "All offline data has been removed.",
      });
      
      // Refresh the page to reinitialize
      window.location.reload();
    } catch (error) {
      console.error('Failed to clear data:', error);
      toast({
        title: "Error",
        description: "Failed to clear offline data.",
        variant: "destructive",
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleManualSync = async () => {
    if (!isOnline) {
      toast({
        title: "Offline",
        description: "Cannot sync while offline.",
        variant: "destructive",
      });
      return;
    }
    
    triggerSync();
    const now = new Date();
    setLastSyncTime(now);
    localStorage.setItem('vetix_last_sync', now.toISOString());
    
    toast({
      title: "Syncing...",
      description: "Your offline data is being synchronized.",
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1) return '0 MB';
    return `${bytes} MB`;
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    
    const now = new Date();
    const diff = now.getTime() - lastSyncTime.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-accent/10">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <SettingsIcon className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Settings</h1>
              </div>
            </div>
            
            {user && (
              <Badge variant="outline">
                {user.email}
              </Badge>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Connection Status Alert */}
          <Alert className={isOnline ? 'border-green-500' : 'border-orange-500'}>
            <div className="flex items-center gap-2">
              {isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              )}
              <AlertDescription>
                {isOnline ? (
                  <span>Connected to internet. {pendingCount > 0 ? `${pendingCount} items pending sync.` : 'All data synced.'}</span>
                ) : (
                  <span>You are offline. Data will be saved locally and synced when connection is restored.</span>
                )}
              </AlertDescription>
            </div>
          </Alert>

          {/* Sync Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Sync Settings
              </CardTitle>
              <CardDescription>
                Configure how and when your data is synchronized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-sync">Automatic Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically sync when online
                  </p>
                </div>
                <Switch
                  id="auto-sync"
                  checked={settings.autoSync}
                  onCheckedChange={(checked) => updateSettings({ autoSync: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sync-interval">Sync Interval</Label>
                  <span className="text-sm font-medium">{settings.syncInterval} minutes</span>
                </div>
                <Slider
                  id="sync-interval"
                  min={5}
                  max={120}
                  step={5}
                  value={[settings.syncInterval]}
                  onValueChange={([value]) => updateSettings({ syncInterval: value })}
                  disabled={!settings.autoSync}
                />
                <p className="text-xs text-muted-foreground">
                  How often to check for pending data to sync
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="wifi-only">Wi-Fi Only Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Only sync when connected to Wi-Fi
                  </p>
                </div>
                <Switch
                  id="wifi-only"
                  checked={settings.wifiOnly}
                  onCheckedChange={(checked) => updateSettings({ wifiOnly: checked })}
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Last Sync</Label>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{formatLastSync()}</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleManualSync} 
                  disabled={!isOnline || isClearing}
                  className="w-full"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sync Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Data Retention */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Data Retention
              </CardTitle>
              <CardDescription>
                Manage how long offline data is stored on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="retention">Keep Data For</Label>
                  <Select
                    value={settings.dataRetention.toString()}
                    onValueChange={(value) => updateSettings({ dataRetention: parseInt(value) })}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="0">Keep forever</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-xs text-muted-foreground">
                  {settings.dataRetention > 0 
                    ? `Local data older than ${settings.dataRetention} days will be automatically removed`
                    : 'Local data will be kept indefinitely until manually cleared'
                  }
                </p>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="delete-after-sync">Delete After Sync</Label>
                  <p className="text-sm text-muted-foreground">
                    Remove local copies after successful sync
                  </p>
                </div>
                <Switch
                  id="delete-after-sync"
                  checked={settings.deleteAfterSync}
                  onCheckedChange={(checked) => updateSettings({ deleteAfterSync: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Storage Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Storage Management
              </CardTitle>
              <CardDescription>
                Monitor and manage local storage usage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Used Storage</span>
                  <span className="font-medium">
                    {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
                  </span>
                </div>
                
                <Progress value={storageInfo.percentage} className="h-2" />
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{storageInfo.percentage}% used</span>
                  <span>{formatBytes(storageInfo.available)} available</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pending Items</span>
                  <Badge variant="secondary">{pendingCount}</Badge>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Auto Sync</span>
                  <Badge variant={settings.autoSync ? "default" : "outline"}>
                    {settings.autoSync ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <Button 
                onClick={handleClearOfflineData}
                disabled={isClearing}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {isClearing ? 'Clearing...' : 'Clear All Offline Data'}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                This will permanently delete all locally stored data
              </p>
            </CardContent>
          </Card>

          {/* Security & Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Privacy
              </CardTitle>
              <CardDescription>
                Your data is encrypted and stored securely
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Database className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Local Storage</p>
                  <p className="text-xs text-muted-foreground">
                    Data is stored on your device using IndexedDB
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Secure Sync</p>
                  <p className="text-xs text-muted-foreground">
                    All synced data is encrypted in transit using HTTPS
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Download className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Export Data</p>
                  <p className="text-xs text-muted-foreground">
                    You can export your data at any time from your dashboard
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Back Button */}
          <div className="flex justify-center pt-4">
            <Button onClick={() => navigate('/')} variant="outline" size="lg">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
