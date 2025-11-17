import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Conflict } from '@/hooks/useConflictResolution';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Smartphone,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';

interface ConflictResolutionDialogProps {
  conflicts: Conflict[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolve: (conflictId: string, resolution: 'local' | 'server') => Promise<boolean>;
  onResolveAll: (resolution: 'local' | 'server') => Promise<void>;
}

export function ConflictResolutionDialog({
  conflicts,
  open,
  onOpenChange,
  onResolve,
  onResolveAll,
}: ConflictResolutionDialogProps) {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResolving, setIsResolving] = useState(false);

  const currentConflict = conflicts[currentIndex];

  const handleResolve = async (resolution: 'local' | 'server') => {
    if (!currentConflict) return;

    setIsResolving(true);
    try {
      const success = await onResolve(currentConflict.id, resolution);
      
      if (success) {
        toast({
          title: 'Conflict Resolved',
          description: `Using ${resolution === 'local' ? 'device' : 'server'} version`,
        });

        // Move to next conflict or close if done
        if (currentIndex < conflicts.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          setCurrentIndex(0);
          onOpenChange(false);
        }
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve conflict',
        variant: 'destructive',
      });
    } finally {
      setIsResolving(false);
    }
  };

  const handleResolveAll = async (resolution: 'local' | 'server') => {
    setIsResolving(true);
    try {
      await onResolveAll(resolution);
      toast({
        title: 'All Conflicts Resolved',
        description: `Using ${resolution === 'local' ? 'device' : 'server'} versions for all conflicts`,
      });
      onOpenChange(false);
      setCurrentIndex(0);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to resolve all conflicts',
        variant: 'destructive',
      });
    } finally {
      setIsResolving(false);
    }
  };

  const formatDate = (timestamp: number | string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      diagnosis: 'Diagnosis',
      treatment: 'Treatment',
      vaccination: 'Vaccination',
      animal: 'Animal Record',
    };
    return labels[type] || type;
  };

  const renderDataComparison = (localData: any, serverData: any) => {
    // Get all unique keys from both objects
    const allKeys = new Set([
      ...Object.keys(localData),
      ...Object.keys(serverData),
    ]);

    // Filter out technical fields
    const relevantKeys = Array.from(allKeys).filter(
      key => !['id', 'timestamp', 'synced', 'created_at', 'updated_at', 'user_id'].includes(key)
    );

    return (
      <div className="space-y-2">
        {relevantKeys.map(key => {
          const localValue = localData[key];
          const serverValue = serverData[key];
          const isDifferent = JSON.stringify(localValue) !== JSON.stringify(serverValue);

          return (
            <div
              key={key}
              className={`grid grid-cols-3 gap-2 py-2 px-3 rounded ${
                isDifferent ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-muted/30'
              }`}
            >
              <div className="font-medium text-sm capitalize">
                {key.replace(/_/g, ' ')}
              </div>
              <div className="text-sm truncate">
                {localValue !== null && localValue !== undefined
                  ? Array.isArray(localValue)
                    ? localValue.join(', ')
                    : String(localValue)
                  : '-'}
              </div>
              <div className="text-sm truncate">
                {serverValue !== null && serverValue !== undefined
                  ? Array.isArray(serverValue)
                    ? serverValue.join(', ')
                    : String(serverValue)
                  : '-'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!currentConflict) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <DialogTitle>Sync Conflict Detected</DialogTitle>
          </div>
          <DialogDescription>
            Choose which version to keep. Changes exist in both your device and the server.
          </DialogDescription>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <Badge variant="outline">
            {getTypeLabel(currentConflict.type)}
          </Badge>
          <span>
            Conflict {currentIndex + 1} of {conflicts.length}
          </span>
        </div>

        <ScrollArea className="max-h-[50vh]">
          <div className="space-y-4">
            {/* Header row */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-muted/50 rounded font-semibold text-sm">
              <div>Field</div>
              <div className="flex items-center gap-1">
                <Smartphone className="h-3 w-3" />
                Device Version
              </div>
              <div className="flex items-center gap-1">
                <Database className="h-3 w-3" />
                Server Version
              </div>
            </div>

            {/* Timestamp comparison */}
            <div className="grid grid-cols-3 gap-2 py-2 px-3 bg-muted/30 rounded text-sm">
              <div className="font-medium flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last Modified
              </div>
              <div>{formatDate(currentConflict.localTimestamp)}</div>
              <div>{formatDate(currentConflict.serverTimestamp)}</div>
            </div>

            <Separator />

            {/* Data comparison */}
            {renderDataComparison(currentConflict.localData, currentConflict.serverData)}
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-col gap-2">
          {/* Individual resolution buttons */}
          <div className="flex gap-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleResolve('local')}
              disabled={isResolving}
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Keep Device Version
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleResolve('server')}
              disabled={isResolving}
            >
              <Database className="mr-2 h-4 w-4" />
              Keep Server Version
            </Button>
          </div>

          <Separator />

          {/* Bulk resolution options */}
          {conflicts.length > 1 && (
            <>
              <div className="text-xs text-muted-foreground text-center">
                Or resolve all {conflicts.length} conflicts at once:
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleResolveAll('local')}
                  disabled={isResolving}
                >
                  All Device Versions
                </Button>
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => handleResolveAll('server')}
                  disabled={isResolving}
                >
                  All Server Versions
                </Button>
              </div>
            </>
          )}

          {/* Navigation */}
          {conflicts.length > 1 && (
            <div className="flex items-center justify-center gap-2 w-full">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                disabled={currentIndex === 0 || isResolving}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {conflicts.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentIndex(Math.min(conflicts.length - 1, currentIndex + 1))}
                disabled={currentIndex === conflicts.length - 1 || isResolving}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
