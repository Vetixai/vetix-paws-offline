import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useLocalSync } from '@/hooks/useLocalSync';
import { formatDistance } from 'date-fns';
import { History, Stethoscope, Cloud, Database } from 'lucide-react';

interface DiagnosisRecord {
  id: string;
  species: string;
  symptoms: string;
  diagnosis: string;
  timestamp: number;
  synced: boolean;
}

export const LocalDiagnosisHistory = () => {
  const [records, setRecords] = useState<DiagnosisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { getLocalDiagnoses } = useLocalSync();

  useEffect(() => {
    const loadRecords = async () => {
      try {
        const localRecords = await getLocalDiagnoses();
        setRecords(localRecords);
      } catch (error) {
        console.error('Failed to load local records:', error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadRecords, 30000);
    return () => clearInterval(interval);
  }, [getLocalDiagnoses]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Loading History...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (records.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Diagnosis History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No diagnosis records yet</p>
            <p className="text-sm">Complete a diagnosis to see your history here</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Diagnosis History
          </div>
          <Badge variant="secondary">{records.length} records</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {records.map((record) => (
            <div key={record.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{record.species}</Badge>
                  <Badge variant={record.synced ? "default" : "secondary"} className="text-xs">
                    {record.synced ? (
                      <div className="flex items-center gap-1">
                        <Cloud className="w-3 h-3" />
                        Synced
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        Local
                      </div>
                    )}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistance(new Date(record.timestamp), new Date(), { addSuffix: true })}
                </span>
              </div>
              
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Symptoms:</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{record.symptoms}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Diagnosis:</p>
                  <p className="text-sm text-muted-foreground line-clamp-2">{record.diagnosis}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-4">
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            Refresh History
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};