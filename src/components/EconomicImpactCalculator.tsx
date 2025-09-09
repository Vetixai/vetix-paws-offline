import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Calculator, Target, AlertTriangle } from "lucide-react";
import { useLanguage } from "./LocalLanguageSupport";

interface TreatmentCost {
  immediate: number;
  followUp: number;
  prevention: number;
  lostProductivity: number;
}

interface EconomicAnalysis {
  totalCost: number;
  potentialSavings: number;
  roi: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
  breakdownCosts: TreatmentCost;
  marketImpact: {
    currentValue: number;
    projectedValue: number;
    lossPercentage: number;
  };
}

const TREATMENT_COSTS = {
  cattle: {
    vaccination: { immediate: 200, followUp: 50, prevention: 150 },
    medication: { immediate: 800, followUp: 300, prevention: 400 },
    surgery: { immediate: 5000, followUp: 1000, prevention: 2000 },
    consultation: { immediate: 500, followUp: 200, prevention: 100 }
  },
  goat: {
    vaccination: { immediate: 80, followUp: 20, prevention: 60 },
    medication: { immediate: 300, followUp: 100, prevention: 150 },
    surgery: { immediate: 2000, followUp: 500, prevention: 800 },
    consultation: { immediate: 200, followUp: 100, prevention: 50 }
  },
  sheep: {
    vaccination: { immediate: 80, followUp: 20, prevention: 60 },
    medication: { immediate: 250, followUp: 80, prevention: 120 },
    surgery: { immediate: 1800, followUp: 400, prevention: 700 },
    consultation: { immediate: 200, followUp: 80, prevention: 50 }
  },
  chicken: {
    vaccination: { immediate: 20, followUp: 5, prevention: 15 },
    medication: { immediate: 50, followUp: 20, prevention: 30 },
    surgery: { immediate: 100, followUp: 30, prevention: 50 },
    consultation: { immediate: 50, followUp: 20, prevention: 10 }
  }
};

const MARKET_PRICES = {
  cattle: { healthy: 45000, sick: 25000, dead: 0 },
  goat: { healthy: 8000, sick: 4500, dead: 0 },
  sheep: { healthy: 6000, sick: 3500, dead: 0 },
  chicken: { healthy: 500, sick: 200, dead: 0 }
};

export const EconomicImpactCalculator = () => {
  const [selectedAnimal, setSelectedAnimal] = useState('cattle');
  const [treatmentType, setTreatmentType] = useState('medication');
  const [animalCount, setAnimalCount] = useState(1);
  const [severityLevel, setSeverityLevel] = useState(50);
  const [analysis, setAnalysis] = useState<EconomicAnalysis | null>(null);
  const { translate, getAnimalTerm } = useLanguage();

  useEffect(() => {
    calculateEconomicImpact();
  }, [selectedAnimal, treatmentType, animalCount, severityLevel]);

  const calculateEconomicImpact = () => {
    const costs = TREATMENT_COSTS[selectedAnimal as keyof typeof TREATMENT_COSTS];
    const treatmentCosts = costs[treatmentType as keyof typeof costs];
    const marketPrice = MARKET_PRICES[selectedAnimal as keyof typeof MARKET_PRICES];

    // Calculate severity multiplier (1-3x based on severity)
    const severityMultiplier = 1 + (severityLevel / 50);
    
    // Calculate lost productivity based on severity and delay
    const productivityLoss = (marketPrice.healthy * 0.3 * severityMultiplier) / 30; // Daily loss

    const breakdownCosts: TreatmentCost = {
      immediate: treatmentCosts.immediate * severityMultiplier * animalCount,
      followUp: treatmentCosts.followUp * animalCount,
      prevention: treatmentCosts.prevention * animalCount,
      lostProductivity: productivityLoss * 14 * animalCount // 2 weeks of productivity loss
    };

    const totalCost = Object.values(breakdownCosts).reduce((sum, cost) => sum + cost, 0);
    
    // Calculate potential savings vs no treatment
    const noTreatmentLoss = (marketPrice.healthy - marketPrice.sick) * animalCount * (severityLevel / 100);
    const potentialSavings = Math.max(0, noTreatmentLoss - totalCost);
    
    const roi = potentialSavings > 0 ? (potentialSavings / totalCost) * 100 : -50;

    // Risk assessment
    let riskLevel: EconomicAnalysis['riskLevel'] = 'low';
    let recommendation = '';

    if (severityLevel > 80) {
      riskLevel = 'critical';
      recommendation = 'Immediate treatment required. High risk of total loss.';
    } else if (severityLevel > 60) {
      riskLevel = 'high';
      recommendation = 'Treatment recommended within 24 hours to prevent escalation.';
    } else if (severityLevel > 40) {
      riskLevel = 'medium';
      recommendation = 'Monitor closely. Consider preventive treatment.';
    } else {
      riskLevel = 'low';
      recommendation = 'Good opportunity for preventive care investment.';
    }

    const marketImpact = {
      currentValue: marketPrice.healthy * animalCount,
      projectedValue: marketPrice.healthy * animalCount * (1 - severityLevel / 200),
      lossPercentage: severityLevel / 2
    };

    setAnalysis({
      totalCost,
      potentialSavings,
      roi,
      riskLevel,
      recommendation,
      breakdownCosts,
      marketImpact
    });
  };

  const getRiskColor = (risk: EconomicAnalysis['riskLevel']) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Hesabu ya Faida na Hasara - Economic Impact Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Input Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Aina ya Mnyama</label>
              <div className="flex flex-wrap gap-1">
                {['cattle', 'goat', 'sheep', 'chicken'].map((animal) => (
                  <Button
                    key={animal}
                    variant={selectedAnimal === animal ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedAnimal(animal)}
                  >
                    {getAnimalTerm(animal)}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Aina ya Matibabu</label>
              <div className="grid grid-cols-2 gap-1">
                {['vaccination', 'medication', 'surgery', 'consultation'].map((type) => (
                  <Button
                    key={type}
                    variant={treatmentType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTreatmentType(type)}
                    className="text-xs"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Idadi ya Wanyama</label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={animalCount}
                onChange={(e) => setAnimalCount(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Kiwango cha Ugonjwa ({severityLevel}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={severityLevel}
                onChange={(e) => setSeverityLevel(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Haba</span>
                <span>Wastani</span>
                <span>Kali</span>
              </div>
            </div>
          </div>

          {/* Analysis Results */}
          {analysis && (
            <div className="space-y-4 pt-4 border-t">
              {/* Risk Level Alert */}
              <Card className={`border-${getRiskColor(analysis.riskLevel)} bg-${getRiskColor(analysis.riskLevel)}/5`}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5" />
                    <Badge variant={getRiskColor(analysis.riskLevel)}>
                      {analysis.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>
                  <p className="text-sm">{analysis.recommendation}</p>
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-4 h-4 text-destructive" />
                    <h4 className="font-medium">Gharama ya Jumla</h4>
                  </div>
                  <p className="text-2xl font-bold">
                    KES {analysis.totalCost.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Kwa {getAnimalTerm(selectedAnimal)} {animalCount}
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {analysis.roi > 0 ? 
                      <TrendingUp className="w-4 h-4 text-success" /> : 
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    }
                    <h4 className="font-medium">ROI</h4>
                  </div>
                  <p className={`text-2xl font-bold ${analysis.roi > 0 ? 'text-success' : 'text-destructive'}`}>
                    {analysis.roi.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Return on Investment
                  </p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <h4 className="font-medium">Thamani ya Soko</h4>
                  </div>
                  <p className="text-lg font-bold">
                    KES {analysis.marketImpact.projectedValue.toLocaleString()}
                  </p>
                  <Progress 
                    value={100 - analysis.marketImpact.lossPercentage} 
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    -{analysis.marketImpact.lossPercentage.toFixed(1)}% kutoka asili
                  </p>
                </Card>
              </div>

              {/* Cost Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Maelezo ya Gharama</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Matibabu ya haraka:</span>
                        <span className="font-medium">KES {analysis.breakdownCosts.immediate.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ufuatiliaji:</span>
                        <span className="font-medium">KES {analysis.breakdownCosts.followUp.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kuzuia ugonjwa:</span>
                        <span className="font-medium">KES {analysis.breakdownCosts.prevention.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t pt-2">
                        <span>Hasara ya uzalishaji:</span>
                        <span className="font-medium text-destructive">
                          KES {analysis.breakdownCosts.lostProductivity.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h5 className="font-medium">Mipango ya Malipo:</h5>
                      <div className="text-sm space-y-1">
                        <p>• Malipo ya papo hapo: 50%</p>
                        <p>• Malipo baada ya wiki 2: 30%</p>
                        <p>• Malipo ya mwisho: 20%</p>
                      </div>
                      <div className="pt-2 border-t">
                        <Button size="sm" variant="outline" className="w-full">
                          Unda Mpango wa Malipo
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};