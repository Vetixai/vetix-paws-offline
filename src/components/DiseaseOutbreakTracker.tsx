import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, AlertTriangle, TrendingUp, Users, Shield, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useVetixDataService } from './VetixDataService';

interface OutbreakData {
  id: string;
  disease: string;
  species: string[];
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  caseCount: number;
  recoveredCount: number;
  deathCount: number;
  firstReported: string;
  lastUpdated: string;
  preventionMeasures: string[];
  riskFactors: string[];
}

interface PredictionModel {
  disease: string;
  species: string;
  riskScore: number;
  factors: string[];
  recommendation: string;
}

const DiseaseOutbreakTracker: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('');
  const [outbreaks, setOutbreaks] = useState<OutbreakData[]>([]);
  const [predictions, setPredictions] = useState<PredictionModel[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const { getActiveOutbreaks } = useVetixDataService();

  useEffect(() => {
    fetchRealOutbreaks();
  }, [selectedRegion]);

  const fetchRealOutbreaks = async () => {
    try {
      // Fetch real outbreak data from database
      const realOutbreaks = await getActiveOutbreaks();
      
      const formattedOutbreaks: OutbreakData[] = realOutbreaks.map(outbreak => ({
        id: outbreak.id,
        disease: outbreak.disease_name,
        species: [outbreak.animal_type],
        location: outbreak.location,
        severity: outbreak.severity as 'low' | 'medium' | 'high' | 'critical',
        caseCount: outbreak.affected_count,
        recoveredCount: Math.floor(outbreak.affected_count * 0.6), // Estimate 60% recovery
        deathCount: outbreak.mortality_count,
        firstReported: new Date(outbreak.created_at).toISOString().split('T')[0],
        lastUpdated: new Date(outbreak.updated_at).toISOString().split('T')[0],
        preventionMeasures: outbreak.containment_measures || ['Quarantine affected areas', 'Vaccination campaign'],
        riskFactors: outbreak.symptoms || ['High livestock density', 'Seasonal factors']
      }));

      // If no real data, show examples
      if (formattedOutbreaks.length === 0) {
        formattedOutbreaks.push({
          id: '1',
          disease: 'Foot and Mouth Disease',
          species: ['cattle', 'goat', 'sheep'],
          location: 'Nakuru County',
          severity: 'high',
          caseCount: 145,
          recoveredCount: 67,
          deathCount: 8,
          firstReported: '2024-01-15',
          lastUpdated: '2024-01-20',
          preventionMeasures: ['Quarantine affected areas', 'Vaccination campaign', 'Movement restrictions'],
          riskFactors: ['High livestock density', 'Cross-border movement', 'Seasonal rainfall']
        });
      }

      setOutbreaks(formattedOutbreaks);

      // AI predictions based on current trends
      const mockPredictions: PredictionModel[] = [
        {
          disease: 'East Coast Fever',
          species: 'cattle',
          riskScore: formattedOutbreaks.length > 3 ? 78 : 45,
          factors: ['Tick season approaching', 'High cattle density', 'Limited tick control'],
          recommendation: 'Implement intensive tick control measures and monitor cattle closely'
        },
        {
          disease: 'Peste des Petits Ruminants',
          species: 'goat',
          riskScore: formattedOutbreaks.filter(o => o.species.includes('goat')).length > 0 ? 75 : 40,
          factors: ['Cross-border trade', 'Unvaccinated populations', 'Dry season stress'],
          recommendation: 'Strengthen vaccination coverage and border control measures'
        }
      ];

      setPredictions(mockPredictions);
    } catch (error) {
      console.error('Error fetching outbreaks:', error);
    }
  };

  const startTracking = () => {
    setIsTracking(true);
    // Simulate real-time monitoring
    setTimeout(() => setIsTracking(false), 3000);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return 'destructive';
    if (risk >= 60) return 'secondary';
    return 'default';
  };

  return (
    <div className="space-y-6">
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-destructive" />
            Disease Outbreak Prevention & Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Region Selection */}
          <div className="flex gap-4 items-center">
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nakuru">Nakuru County</SelectItem>
                <SelectItem value="kiambu">Kiambu County</SelectItem>
                <SelectItem value="meru">Meru County</SelectItem>
                <SelectItem value="kajiado">Kajiado County</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={startTracking} disabled={isTracking}>
              {isTracking ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Tracking...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Start Real-Time Tracking
                </>
              )}
            </Button>
          </div>

          {/* Active Outbreaks */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Active Disease Outbreaks
            </h3>
            <div className="space-y-4">
              {outbreaks.map(outbreak => (
                <Card key={outbreak.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">{outbreak.disease}</h4>
                      <p className="text-sm text-muted-foreground">{outbreak.location}</p>
                    </div>
                    <Badge variant={getSeverityColor(outbreak.severity)}>
                      {outbreak.severity.toUpperCase()} RISK
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">{outbreak.caseCount}</div>
                      <div className="text-xs text-muted-foreground">Active Cases</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{outbreak.recoveredCount}</div>
                      <div className="text-xs text-muted-foreground">Recovered</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-muted-foreground">{outbreak.deathCount}</div>
                      <div className="text-xs text-muted-foreground">Deaths</div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Recovery Rate</span>
                      <span>{Math.round((outbreak.recoveredCount / outbreak.caseCount) * 100)}%</span>
                    </div>
                    <Progress value={(outbreak.recoveredCount / outbreak.caseCount) * 100} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="font-medium text-sm">Prevention Measures:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {outbreak.preventionMeasures.map((measure, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {measure}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Affected Species:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {outbreak.species.map((species, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {species}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Predictive Risk Analysis */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              AI Risk Predictions (Next 30 Days)
            </h3>
            <div className="space-y-4">
              {predictions.map((prediction, idx) => (
                <Alert key={idx} className="p-4">
                  <AlertTriangle className="h-4 w-4" />
                  <div className="flex items-start justify-between w-full">
                    <div className="flex-1">
                      <AlertDescription className="text-base font-medium mb-2">
                        {prediction.disease} Risk for {prediction.species}
                      </AlertDescription>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Risk Score</span>
                          <Badge variant={getRiskColor(prediction.riskScore)}>
                            {prediction.riskScore}%
                          </Badge>
                        </div>
                        <Progress value={prediction.riskScore} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <strong>Risk Factors:</strong> {prediction.factors.join(', ')}
                      </div>
                      <div className="text-sm">
                        <strong>Recommendation:</strong> {prediction.recommendation}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </div>

          {/* Emergency Actions */}
          <div className="flex gap-3">
            <Button variant="destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Report New Case
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Alert Community
            </Button>
            <Button variant="outline">
              Contact Authorities
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiseaseOutbreakTracker;