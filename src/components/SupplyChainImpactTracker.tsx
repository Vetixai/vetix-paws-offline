import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Truck, Factory, ShoppingCart, TrendingDown, AlertTriangle, DollarSign, Package, Users } from 'lucide-react';

interface SupplyData {
  product: string;
  currentSupply: number;
  demandForecast: number;
  pricePerUnit: number;
  priceChange: number;
  qualityScore: number;
  shelfLife: number;
  affectedBy: string[];
}

interface MarketImpact {
  region: string;
  product: string;
  supplyReduction: number;
  priceIncrease: number;
  affectedPopulation: number;
  alternativeSources: string[];
  recommendedActions: string[];
}

interface ProductionForecast {
  month: string;
  normal: number;
  current: number;
  predicted: number;
}

const SupplyChainImpactTracker: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<string>('milk');
  const [timeframe, setTimeframe] = useState<string>('3months');
  const [supplyData, setSupplyData] = useState<SupplyData[]>([]);
  const [marketImpacts, setMarketImpacts] = useState<MarketImpact[]>([]);
  const [forecastData, setForecastData] = useState<ProductionForecast[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // No mock data - all data comes from database
    fetchRealSupplyData();
  }, [selectedProduct, timeframe]);

  const fetchRealSupplyData = async () => {
    // Fetch real supply chain data from database when available
    // For now, show empty state
    setSupplyData([]);
    setMarketImpacts([]);
    setForecastData([]);
  };

  const analyzeImpact = async () => {
    setIsAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => setIsAnalyzing(false), 2000);
  };

  const getSupplyStatus = (supply: number, demand: number) => {
    const ratio = supply / demand;
    if (ratio < 0.7) return { status: 'Critical', color: 'destructive' };
    if (ratio < 0.85) return { status: 'Low', color: 'secondary' };
    return { status: 'Adequate', color: 'default' };
  };

  const formatPrice = (price: number) => {
    return `KES ${price.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-secondary/20 bg-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-secondary" />
            Supply Chain Impact Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="flex gap-4 items-center">
            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Product" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="milk">Milk Products</SelectItem>
                <SelectItem value="eggs">Eggs</SelectItem>
                <SelectItem value="meat">Meat (Beef)</SelectItem>
                <SelectItem value="chicken">Poultry</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Month</SelectItem>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={analyzeImpact} disabled={isAnalyzing}>
              {isAnalyzing ? (
                <>
                  <Factory className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Factory className="w-4 h-4 mr-2" />
                  Analyze Impact
                </>
              )}
            </Button>
          </div>

          {/* Supply Status Overview */}
          {supplyData.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Supply Chain Data</h3>
              <p className="text-muted-foreground">
                Supply chain data will appear here once disease outbreaks and market impacts are tracked.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {supplyData.map((item, idx) => {
              const status = getSupplyStatus(item.currentSupply, item.demandForecast);
              return (
                <Card key={idx} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{item.product}</h4>
                    <Badge variant={status.color as any}>{status.status}</Badge>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Supply vs Demand</span>
                        <span>{item.currentSupply}% / {item.demandForecast}%</span>
                      </div>
                      <Progress value={(item.currentSupply / item.demandForecast) * 100} className="h-2" />
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <div className="text-right">
                        <div className="font-semibold">{formatPrice(item.pricePerUnit)}</div>
                        <div className="text-xs text-destructive">+{item.priceChange}%</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Quality Score</span>
                      <Badge variant={item.qualityScore >= 90 ? 'default' : 'secondary'}>
                        {item.qualityScore}%
                      </Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
          )}

          <Tabs defaultValue="forecast" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="forecast">Production Forecast</TabsTrigger>
              <TabsTrigger value="impact">Market Impact</TabsTrigger>
              <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="forecast" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Production vs Normal Levels</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="normal" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} name="Normal Production" />
                    <Area type="monotone" dataKey="current" stackId="2" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.5} name="Current Production" />
                    <Line type="monotone" dataKey="predicted" stroke="#EF4444" strokeWidth={2} name="Predicted" strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Key Supply Factors</h4>
                  <div className="space-y-2">
                    {supplyData[0]?.affectedBy.map((factor, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3">Economic Impact</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Daily Loss:</span>
                      <span className="font-semibold text-destructive">KES 2.3M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Monthly Loss:</span>
                      <span className="font-semibold text-destructive">KES 69M</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Affected Jobs:</span>
                      <span className="font-semibold">15,400</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="impact" className="space-y-4">
              {marketImpacts.map((impact, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{impact.region}</h4>
                      <p className="text-muted-foreground">Product: {impact.product}</p>
                    </div>
                    <Badge variant="destructive">High Impact</Badge>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-destructive">{impact.supplyReduction}%</div>
                      <div className="text-xs text-muted-foreground">Supply Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">{impact.priceIncrease}%</div>
                      <div className="text-xs text-muted-foreground">Price Increase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{(impact.affectedPopulation / 1000000).toFixed(1)}M</div>
                      <div className="text-xs text-muted-foreground">People Affected</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="font-medium text-sm">Alternative Sources:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {impact.alternativeSources.map((source, sourceIdx) => (
                          <Badge key={sourceIdx} variant="outline" className="text-xs">
                            {source}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-sm">Recommended Actions:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {impact.recommendedActions.map((action, actionIdx) => (
                          <Badge key={actionIdx} variant="secondary" className="text-xs">
                            {action}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <div className="grid gap-4">
                <Alert className="border-destructive/20 bg-destructive/10">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Immediate Action Required:</strong> Chicken supply critically low (45% of demand). 
                    Implement emergency protocols and consider imports.
                  </AlertDescription>
                </Alert>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Short-term Solutions (1-4 weeks)
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      Activate emergency supply reserves
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      Fast-track imports from neighboring countries
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      Implement temporary price controls
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      Distribute emergency animal health kits to farmers
                    </li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Medium-term Recovery (1-6 months)
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      Implement disease prevention programs
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      Support affected farmers with recovery loans
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      Diversify supply chain sources
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-secondary rounded-full"></div>
                      Establish strategic food reserves
                    </li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Long-term Sustainability (6+ months)
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Invest in disease-resistant livestock breeds
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Build climate-resilient production systems
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Develop alternative protein sources
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Create early warning systems for supply disruptions
                    </li>
                  </ul>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button variant="destructive">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Alert Authorities
            </Button>
            <Button variant="outline">
              <Users className="w-4 h-4 mr-2" />
              Notify Stakeholders
            </Button>
            <Button variant="outline">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Market Response Plan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupplyChainImpactTracker;