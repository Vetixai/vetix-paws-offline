import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, MapPin, Activity, Users, FileText, Download, Share } from 'lucide-react';

interface HealthMetrics {
  region: string;
  totalAnimals: number;
  healthyAnimals: number;
  treatedAnimals: number;
  deaths: number;
  vaccinationRate: number;
  economicImpact: number;
  topDiseases: Array<{
    name: string;
    cases: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }>;
}

interface TimeSeriesData {
  month: string;
  healthy: number;
  sick: number;
  treated: number;
  vaccinated: number;
}

interface SpeciesData {
  species: string;
  count: number;
  healthScore: number;
  color: string;
}

const RegionalHealthAnalytics: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<string>('nakuru');
  const [timeRange, setTimeRange] = useState<string>('6months');
  const [metrics, setMetrics] = useState<HealthMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [speciesData, setSpeciesData] = useState<SpeciesData[]>([]);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  useEffect(() => {
    // Simulate loading analytics data
    const mockMetrics: HealthMetrics = {
      region: 'Nakuru County',
      totalAnimals: 45780,
      healthyAnimals: 39234,
      treatedAnimals: 4890,
      deaths: 456,
      vaccinationRate: 78.5,
      economicImpact: 2340000, // KES
      topDiseases: [
        { name: 'Foot and Mouth Disease', cases: 145, trend: 'decreasing' },
        { name: 'East Coast Fever', cases: 89, trend: 'stable' },
        { name: 'Newcastle Disease', cases: 67, trend: 'increasing' },
        { name: 'Mastitis', cases: 45, trend: 'decreasing' }
      ]
    };

    const mockTimeSeries: TimeSeriesData[] = [
      { month: 'Jul', healthy: 38000, sick: 1200, treated: 1100, vaccinated: 30000 },
      { month: 'Aug', healthy: 38500, sick: 1150, treated: 1080, vaccinated: 32000 },
      { month: 'Sep', healthy: 39000, sick: 980, treated: 950, vaccinated: 33500 },
      { month: 'Oct', healthy: 39200, sick: 1100, treated: 1050, vaccinated: 34000 },
      { month: 'Nov', healthy: 39100, sick: 1250, treated: 1200, vaccinated: 35000 },
      { month: 'Dec', healthy: 39234, sick: 1346, treated: 1290, vaccinated: 36000 }
    ];

    const mockSpeciesData: SpeciesData[] = [
      { species: 'Cattle', count: 18500, healthScore: 87, color: '#8B5CF6' },
      { species: 'Goats', count: 12200, healthScore: 82, color: '#06B6D4' },
      { species: 'Sheep', count: 8900, healthScore: 85, color: '#10B981' },
      { species: 'Chickens', count: 6180, healthScore: 79, color: '#F59E0B' }
    ];

    setMetrics(mockMetrics);
    setTimeSeriesData(mockTimeSeries);
    setSpeciesData(mockSpeciesData);
  }, [selectedRegion, timeRange]);

  const generateReport = async () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
      // In real app, this would download a PDF report
    }, 2000);
  };

  const getHealthScore = () => {
    if (!metrics) return 0;
    return Math.round((metrics.healthyAnimals / metrics.totalAnimals) * 100);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return '📈';
      case 'decreasing': return '📉';
      case 'stable': return '➡️';
      default: return '❓';
    }
  };

  if (!metrics) return <div>Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Regional Animal Health Analytics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
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
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3months">3 Months</SelectItem>
                <SelectItem value="6months">6 Months</SelectItem>
                <SelectItem value="1year">1 Year</SelectItem>
                <SelectItem value="2years">2 Years</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={generateReport} disabled={isGeneratingReport}>
              {isGeneratingReport ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Export Report
                </>
              )}
            </Button>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{metrics.totalAnimals.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Animals</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">{getHealthScore()}%</div>
                <div className="text-sm text-muted-foreground">Health Score</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{metrics.vaccinationRate}%</div>
                <div className="text-sm text-muted-foreground">Vaccinated</div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">KES {(metrics.economicImpact / 1000000).toFixed(1)}M</div>
                <div className="text-sm text-muted-foreground">Economic Impact</div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="trends" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="trends">Health Trends</TabsTrigger>
              <TabsTrigger value="species">Species Breakdown</TabsTrigger>
              <TabsTrigger value="diseases">Disease Analysis</TabsTrigger>
              <TabsTrigger value="insights">AI Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Animal Health Trends (Last 6 Months)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="healthy" stroke="#10B981" strokeWidth={2} name="Healthy" />
                    <Line type="monotone" dataKey="sick" stroke="#EF4444" strokeWidth={2} name="Sick" />
                    <Line type="monotone" dataKey="treated" stroke="#8B5CF6" strokeWidth={2} name="Treated" />
                    <Line type="monotone" dataKey="vaccinated" stroke="#06B6D4" strokeWidth={2} name="Vaccinated" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            <TabsContent value="species" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Species Population</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={speciesData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ species, count }) => `${species}: ${count.toLocaleString()}`}
                      >
                        {speciesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </Card>

                <Card className="p-4">
                  <h3 className="text-lg font-semibold mb-4">Health Scores by Species</h3>
                  <div className="space-y-4">
                    {speciesData.map((species, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{species.species}</span>
                          <Badge variant={species.healthScore >= 85 ? 'default' : species.healthScore >= 75 ? 'secondary' : 'destructive'}>
                            {species.healthScore}%
                          </Badge>
                        </div>
                        <Progress value={species.healthScore} className="h-2" />
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="diseases" className="space-y-4">
              <Card className="p-4">
                <h3 className="text-lg font-semibold mb-4">Top Disease Cases</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={metrics.topDiseases}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cases" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>

              <div className="grid md:grid-cols-2 gap-4">
                {metrics.topDiseases.map((disease, idx) => (
                  <Card key={idx} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{disease.name}</h4>
                      <span className="text-2xl">{getTrendIcon(disease.trend)}</span>
                    </div>
                    <div className="text-2xl font-bold text-primary mb-1">{disease.cases}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      Trend: {disease.trend}
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid gap-4">
                <Card className="p-4 bg-success/10 border-success/20">
                  <h4 className="font-semibold text-success mb-2">🎯 Key Success</h4>
                  <p className="text-sm">Vaccination rate has increased by 12% in the last quarter, contributing to reduced disease outbreaks.</p>
                </Card>

                <Card className="p-4 bg-destructive/10 border-destructive/20">
                  <h4 className="font-semibold text-destructive mb-2">⚠️ Areas of Concern</h4>
                  <p className="text-sm">Newcastle Disease cases are increasing among poultry. Recommend enhanced biosecurity measures.</p>
                </Card>

                <Card className="p-4 bg-secondary/10 border-secondary/20">
                  <h4 className="font-semibold text-secondary mb-2">💡 AI Recommendations</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Focus vaccination efforts on cattle (87% health score can reach 95%)</li>
                    <li>• Implement tick control programs before rainy season</li>
                    <li>• Establish poultry biosecurity training programs</li>
                    <li>• Consider mobile vet services for remote areas</li>
                  </ul>
                </Card>

                <Card className="p-4">
                  <h4 className="font-semibold mb-2">📊 Economic Impact Analysis</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Current health initiatives have saved an estimated KES 2.34M in potential losses this quarter.
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Prevention Costs:</span>
                      <span className="font-medium">KES 890K</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avoided Losses:</span>
                      <span className="font-medium text-success">KES 3.23M</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                      <span>Net Benefit:</span>
                      <span className="text-success">KES 2.34M</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button>
              <Share className="w-4 h-4 mr-2" />
              Share with Officials
            </Button>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              View Detailed Report
            </Button>
            <Button variant="outline">
              <MapPin className="w-4 h-4 mr-2" />
              Regional Comparison
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegionalHealthAnalytics;