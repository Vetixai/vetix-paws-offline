import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLocalSync } from '@/hooks/useLocalSync';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw, Database, Wifi, WifiOff, CheckCircle, AlertTriangle } from 'lucide-react';

export const SyncManager = () => {
  const { isOnline, syncStatus, pendingCount, triggerSync } = useLocalSync();
  const { toast } = useToast();

  useEffect(() => {
    if (syncStatus === 'error') {
      toast({
        title: "Sync Error",
        description: "Failed to sync some data. Will retry when connection improves.",
        variant: "destructive",
      });
    }
  }, [syncStatus, toast]);

  const getSyncStatusInfo = () => {
    if (!isOnline) {
      return {
        icon: <WifiOff className="w-4 h-4" />,
        text: "Offline Mode",
        color: "muted",
        description: "Data saved locally. Will sync when online."
      };
    }
    
    if (syncStatus === 'syncing') {
      return {
        icon: <RefreshCw className="w-4 h-4 animate-spin" />,
        text: "Syncing...",
        color: "primary",
        description: "Uploading local data to cloud."
      };
    }
    
    if (syncStatus === 'error') {
      return {
        icon: <AlertTriangle className="w-4 h-4" />,
        text: "Sync Error",
        color: "destructive",
        description: "Some data failed to sync. Check connection."
      };
    }
    
    if (pendingCount > 0) {
      return {
        icon: <Database className="w-4 h-4" />,
        text: `${pendingCount} Pending`,
        color: "warning",
        description: "Data waiting to be synced to cloud."
      };
    }
    
    return {
      icon: <CheckCircle className="w-4 h-4" />,
      text: "All Synced",
      color: "success",
      description: "All data is up to date in the cloud."
    };
  };

  const statusInfo = getSyncStatusInfo();

  return (
    <Card className="p-4 border-l-4 border-l-primary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.text}</span>
          </div>
          
          <Badge variant={statusInfo.color as any}>
            {isOnline ? (
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                Online
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                Offline
              </div>
            )}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {pendingCount} items
            </Badge>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={triggerSync}
            disabled={!isOnline || syncStatus === 'syncing'}
          >
            <RefreshCw className={`w-3 h-3 mr-1 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            Sync
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-muted-foreground mt-2">
        {statusInfo.description}
      </p>
    </Card>
  );
};