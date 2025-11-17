import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  ArrowLeft,
  Database,
  Wifi,
  WifiOff,
  Activity,
  HardDrive,
  RefreshCw,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Network,
  Clock,
  Download,
  Upload,
} from 'lucide-react';

interface DBStats {
  totalSize: number;
  syncQueueCount: number;
  syncQueueUnsynced: number;
  diagnosesCount: number;
  diagnosesUnsynced: number;
  lastSync: string | null;
}

interface NetworkMetrics {
  online: boolean;
  effectiveType: string;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

const DB_NAME = 'VetixOfflineDB';

export default function Diagnostics() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dbStats, setDbStats] = useState<DBStats | null>(null);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionTest, setConnectionTest] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    loadDiagnostics();
    updateNetworkMetrics();

    // Update network metrics every 5 seconds
    const interval = setInterval(updateNetworkMetrics, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadDiagnostics = async () => {
    setIsLoading(true);
    try {
      const stats = await getDBStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Error loading diagnostics:', error);
      toast({
        title: 'Error',
        description: 'Failed to load diagnostics data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getDBStats = async (): Promise<DBStats> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = async () => {
        const db = request.result;
        
        try {
          const transaction = db.transaction(['syncQueue', 'diagnoses'], 'readonly');
          const syncStore = transaction.objectStore('syncQueue');
          const diagnosisStore = transaction.objectStore('diagnoses');

          const [syncQueue, diagnoses] = await Promise.all([
            new Promise<any[]>((resolve) => {
              const req = syncStore.getAll();
              req.onsuccess = () => resolve(req.result);
            }),
            new Promise<any[]>((resolve) => {
              const req = diagnosisStore.getAll();
              req.onsuccess = () => resolve(req.result);
            }),
          ]);

          // Calculate approximate size
          const dataSize = JSON.stringify([...syncQueue, ...diagnoses]).length;
          const lastSync = localStorage.getItem('lastSync');

          resolve({
            totalSize: dataSize,
            syncQueueCount: syncQueue.length,
            syncQueueUnsynced: syncQueue.filter(item => !item.synced).length,
            diagnosesCount: diagnoses.length,
            diagnosesUnsynced: diagnoses.filter(item => !item.synced).length,
            lastSync,
          });

          db.close();
        } catch (error) {
          db.close();
          reject(error);
        }
      };
    });
  };

  const updateNetworkMetrics = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    setNetworkMetrics({
      online: navigator.onLine,
      effectiveType: connection?.effectiveType || 'unknown',
      downlink: connection?.downlink || 0,
      rtt: connection?.rtt || 0,
      saveData: connection?.saveData || false,
    });
  };

  const testConnection = async () => {
    setIsTesting(true);
    setConnectionTest('idle');

    try {
      const startTime = Date.now();
      const { error } = await supabase.from('profiles').select('count').limit(1);
      const latency = Date.now() - startTime;

      if (error) throw error;

      setConnectionTest('success');
      toast({
        title: 'Connection Successful',
        description: `Connected to Supabase in ${latency}ms`,
      });
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionTest('error');
      toast({
        title: 'Connection Failed',
        description: 'Could not connect to Supabase',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const clearIndexedDB = async () => {
    try {
      await new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        request.onsuccess = resolve;
        request.onerror = () => reject(request.error);
      });

      toast({
        title: 'IndexedDB Cleared',
        description: 'All offline data has been removed. Refresh the page to reinitialize.',
      });

      // Reload diagnostics after short delay
      setTimeout(loadDiagnostics, 500);
    } catch (error) {
      console.error('Error clearing IndexedDB:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear IndexedDB',
        variant: 'destructive',
      });
    }
  };

  const clearSettings = () => {
    const settingsKeys = [
      'offlineSettings',
      'lastSync',
      'offlineData',
    ];

    settingsKeys.forEach(key => localStorage.removeItem(key));

    toast({
      title: 'Settings Reset',
      description: 'All offline settings have been reset to defaults',
    });
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getConnectionQuality = () => {
    if (!networkMetrics?.online) return { label: 'Offline', color: 'destructive' as const };
    
    const { effectiveType, rtt } = networkMetrics;
    
    if (effectiveType === '4g' && rtt < 100) return { label: 'Excellent', color: 'default' as const };
    if (effectiveType === '4g' || (effectiveType === '3g' && rtt < 200)) return { label: 'Good', color: 'default' as const };
    if (effectiveType === '3g') return { label: 'Fair', color: 'secondary' as const };
    return { label: 'Poor', color: 'secondary' as const };
  };

  const storageQuota = dbStats ? (dbStats.totalSize / (5 * 1024 * 1024)) * 100 : 0; // Estimate 5MB limit

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pt-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Diagnostics</h1>
              <p className="text-muted-foreground">System health and performance metrics</p>
            </div>
          </div>
          <Button variant="outline" size="icon" onClick={loadDiagnostics}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Network Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {networkMetrics?.online ? (
                <Wifi className="h-5 w-5 text-green-500" />
              ) : (
                <WifiOff className="h-5 w-5 text-destructive" />
              )}
              Network Status
            </CardTitle>
            <CardDescription>Current connection quality and metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge variant={networkMetrics?.online ? 'default' : 'destructive'}>
                    {networkMetrics?.online ? 'Online' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Quality</span>
                  <Badge variant={getConnectionQuality().color}>
                    {getConnectionQuality().label}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    Speed
                  </span>
                  <span className="text-sm font-medium">
                    {networkMetrics?.downlink ? `${networkMetrics.downlink} Mbps` : 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Latency
                  </span>
                  <span className="text-sm font-medium">
                    {networkMetrics?.rtt ? `${networkMetrics.rtt}ms` : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection Type</span>
              <Badge variant="outline">
                {networkMetrics?.effectiveType?.toUpperCase() || 'Unknown'}
              </Badge>
            </div>

            {networkMetrics?.saveData && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Data Saver mode enabled</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* IndexedDB Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              IndexedDB Statistics
            </CardTitle>
            <CardDescription>Local storage and sync status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-medium">{formatBytes(dbStats?.totalSize || 0)}</span>
              </div>
              <Progress value={storageQuota} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {storageQuota.toFixed(1)}% of estimated 5MB limit
              </p>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Sync Queue</span>
                </div>
                <div className="pl-6 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{dbStats?.syncQueueCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending</span>
                    <Badge variant={dbStats?.syncQueueUnsynced ? 'secondary' : 'outline'} className="text-xs">
                      {dbStats?.syncQueueUnsynced || 0}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Diagnoses</span>
                </div>
                <div className="pl-6 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium">{dbStats?.diagnosesCount || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Pending</span>
                    <Badge variant={dbStats?.diagnosesUnsynced ? 'secondary' : 'outline'} className="text-xs">
                      {dbStats?.diagnosesUnsynced || 0}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Sync
              </span>
              <span className="font-medium">{formatDate(dbStats?.lastSync || null)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Connection Test Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Connection Test
            </CardTitle>
            <CardDescription>Test connection to Supabase backend</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Button 
                onClick={testConnection} 
                disabled={isTesting}
                variant="outline"
                className="flex-1"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Activity className="mr-2 h-4 w-4" />
                    Run Test
                  </>
                )}
              </Button>

              {connectionTest !== 'idle' && (
                <Badge variant={connectionTest === 'success' ? 'default' : 'destructive'}>
                  {connectionTest === 'success' ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Connected
                    </>
                  ) : (
                    <>
                      <XCircle className="mr-1 h-3 w-3" />
                      Failed
                    </>
                  )}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Tools Card */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Troubleshooting Tools
            </CardTitle>
            <CardDescription>Use with caution - these actions cannot be undone</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={clearSettings}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset Settings to Defaults
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-destructive hover:text-destructive"
              onClick={clearIndexedDB}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All Offline Data
            </Button>

            <p className="text-xs text-muted-foreground">
              Note: Clearing offline data will remove all unsynced diagnoses. Make sure to sync before clearing.
            </p>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-32">
              <div className="space-y-1 text-xs font-mono">
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">User Agent:</span>
                  <span className="truncate">{navigator.userAgent.split(' ')[0]}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Platform:</span>
                  <span>{navigator.platform}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Language:</span>
                  <span>{navigator.language}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">Cookies Enabled:</span>
                  <span>{navigator.cookieEnabled ? 'Yes' : 'No'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <span className="text-muted-foreground">IndexedDB:</span>
                  <span>{indexedDB ? 'Supported' : 'Not Supported'}</span>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="pb-6" />
      </div>
    </div>
  );
}
