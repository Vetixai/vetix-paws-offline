import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useConflictResolution } from '@/hooks/useConflictResolution';
import { useLocalSync } from '@/hooks/useLocalSync';
import { ConflictResolutionDialog } from '@/components/ConflictResolutionDialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Database,
  Smartphone,
} from 'lucide-react';

export default function ConflictResolution() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { db } = useLocalSync();
  const {
    conflicts,
    conflictCount,
    isCheckingConflicts,
    checkForConflicts,
    resolveConflict,
    resolveAllAsServer,
    resolveAllAsLocal,
  } = useConflictResolution();
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (db) {
      checkForConflicts(db);
    }
  }, [db, checkForConflicts]);

  const handleScanForConflicts = () => {
    if (db) {
      checkForConflicts(db);
      toast({
        title: 'Scanning for Conflicts',
        description: 'Checking for data conflicts...',
      });
    }
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
              <h1 className="text-3xl font-bold">Conflict Resolution</h1>
              <p className="text-muted-foreground">Manage sync conflicts between device and server</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleScanForConflicts}
            disabled={isCheckingConflicts}
          >
            <RefreshCw className={`h-4 w-4 ${isCheckingConflicts ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {conflictCount > 0 ? (
                <>
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Conflicts Detected
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  No Conflicts
                </>
              )}
            </CardTitle>
            <CardDescription>
              {conflictCount > 0
                ? `${conflictCount} conflict${conflictCount > 1 ? 's' : ''} need${conflictCount === 1 ? 's' : ''} your attention`
                : 'All data is synchronized correctly'}
            </CardDescription>
          </CardHeader>
          {conflictCount > 0 && (
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="font-medium">Action Required</div>
                    <div className="text-sm text-muted-foreground">
                      Choose which version to keep for each conflict
                    </div>
                  </div>
                </div>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {conflictCount}
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => setShowDialog(true)}>
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Resolve Conflicts
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    await resolveAllAsLocal();
                    toast({
                      title: 'All Conflicts Resolved',
                      description: 'Using device versions for all conflicts',
                    });
                  }}
                >
                  <Smartphone className="mr-2 h-4 w-4" />
                  Keep All Device
                </Button>
                <Button
                  variant="outline"
                  onClick={async () => {
                    await resolveAllAsServer();
                    toast({
                      title: 'All Conflicts Resolved',
                      description: 'Using server versions for all conflicts',
                    });
                  }}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Keep All Server
                </Button>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Conflict List */}
        {conflictCount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Conflict Details</CardTitle>
              <CardDescription>Overview of all detected conflicts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {conflicts.map((conflict, index) => (
                <div
                  key={conflict.id}
                  className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{getTypeLabel(conflict.type)}</div>
                      <div className="text-sm text-muted-foreground">
                        Last modified:{' '}
                        {new Date(conflict.localTimestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <AlertTriangle className="mr-1 h-3 w-3" />
                    Conflict
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About Sync Conflicts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Sync conflicts occur when the same data is modified in both your device and the
              server. This can happen when:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>You work offline and changes are made on the server</li>
              <li>Multiple devices sync data to the same account</li>
              <li>Network issues prevent immediate synchronization</li>
            </ul>
            <p className="pt-2">
              To resolve conflicts, you can choose to keep either the device version, the server
              version, or resolve each conflict individually.
            </p>
          </CardContent>
        </Card>

        <div className="pb-6" />
      </div>

      <ConflictResolutionDialog
        conflicts={conflicts}
        open={showDialog}
        onOpenChange={setShowDialog}
        onResolve={resolveConflict}
        onResolveAll={async (resolution) => {
          if (resolution === 'local') {
            await resolveAllAsLocal();
          } else {
            await resolveAllAsServer();
          }
        }}
      />
    </div>
  );
}
