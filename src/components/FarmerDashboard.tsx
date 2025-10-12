import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  Heart, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle, 
  Calendar,
  DollarSign,
  Activity,
  ChevronRight,
  BarChart3
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalAnimals: number;
  healthyAnimals: number;
  upcomingVaccinations: number;
  activeOutbreaks: number;
  recentDiagnoses: number;
  totalCosts: number;
  healthTrend: 'up' | 'down' | 'stable';
}

interface RecentActivity {
  id: string;
  type: 'diagnosis' | 'vaccination' | 'treatment';
  animal: string;
  date: string;
  description: string;
  urgency?: string;
}

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalAnimals: 0,
    healthyAnimals: 0,
    upcomingVaccinations: 0,
    activeOutbreaks: 0,
    recentDiagnoses: 0,
    totalCosts: 0,
    healthTrend: 'stable'
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [upcomingCare, setUpcomingCare] = useState<any[]>([]);
  const [regionalAlerts, setRegionalAlerts] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Get user profile for region
      const { data: profile } = await supabase
        .from('profiles')
        .select('country, region')
        .eq('user_id', user?.id)
        .single();

      // Fetch animals
      const { data: animals } = await supabase
        .from('animals')
        .select('*')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      // Fetch recent diagnoses (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: diagnoses } = await supabase
        .from('diagnoses')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch upcoming vaccinations
      const today = new Date().toISOString().split('T')[0];
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
      
      const { data: vaccinations } = await supabase
        .from('vaccinations')
        .select('*, animals(name, animal_type)')
        .eq('user_id', user?.id)
        .gte('next_due_date', today)
        .lte('next_due_date', thirtyDaysLater.toISOString().split('T')[0])
        .order('next_due_date', { ascending: true });

      // Fetch active treatments
      const { data: treatments } = await supabase
        .from('treatments')
        .select('*, animals(name, animal_type)')
        .eq('user_id', user?.id)
        .eq('is_completed', false)
        .order('start_date', { ascending: false })
        .limit(3);

      // Fetch regional disease outbreaks
      const { data: outbreaks } = await supabase
        .from('disease_outbreaks')
        .select('*')
        .eq('status', 'active')
        .eq('region', profile?.region || '')
        .order('created_at', { ascending: false })
        .limit(3);

      // Calculate stats
      const totalAnimals = animals?.length || 0;
      const healthyAnimals = totalAnimals; // Simplified - would need health status logic
      const upcomingVaccinations = vaccinations?.length || 0;
      const activeOutbreaks = outbreaks?.length || 0;
      const recentDiagnosesCount = diagnoses?.length || 0;

      // Calculate total costs
      const vaccinationCosts = vaccinations?.reduce((sum, v) => sum + (Number(v.cost) || 0), 0) || 0;
      const treatmentCosts = treatments?.reduce((sum, t) => sum + (Number(t.cost) || 0), 0) || 0;
      const totalCosts = vaccinationCosts + treatmentCosts;

      // Determine health trend (simplified logic)
      const emergencyDiagnoses = diagnoses?.filter(d => d.is_emergency).length || 0;
      const healthTrend = emergencyDiagnoses > 2 ? 'down' : emergencyDiagnoses > 0 ? 'stable' : 'up';

      setStats({
        totalAnimals,
        healthyAnimals,
        upcomingVaccinations,
        activeOutbreaks,
        recentDiagnoses: recentDiagnosesCount,
        totalCosts,
        healthTrend
      });

      // Build recent activities
      const activities: RecentActivity[] = [];
      
      diagnoses?.forEach(d => {
        activities.push({
          id: d.id,
          type: 'diagnosis',
          animal: d.species,
          date: new Date(d.created_at).toLocaleDateString(),
          description: d.diagnosis_result.substring(0, 100) + '...',
          urgency: d.urgency_level
        });
      });

      setRecentActivities(activities.slice(0, 5));
      setUpcomingCare(vaccinations || []);
      setRegionalAlerts(outbreaks || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid md:grid-cols-3 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your Farm Dashboard</h1>
          <p className="text-muted-foreground">Overview of your livestock health and operations</p>
        </div>
        <Button variant="outline" onClick={fetchDashboardData}>
          <Activity className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Animals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.totalAnimals}</span>
              <Heart className="w-8 h-8 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.healthyAnimals} healthy
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Health Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold capitalize">{stats.healthTrend}</span>
              {stats.healthTrend === 'up' && <TrendingUp className="w-8 h-8 text-green-500" />}
              {stats.healthTrend === 'down' && <TrendingDown className="w-8 h-8 text-red-500" />}
              {stats.healthTrend === 'stable' && <Activity className="w-8 h-8 text-yellow-500" />}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Upcoming Care</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.upcomingVaccinations}</span>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Next 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regional Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-3xl font-bold">{stats.activeOutbreaks}</span>
              <AlertTriangle className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Active outbreaks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Recent Activity</span>
              <Badge variant="outline">{stats.recentDiagnoses} diagnoses</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No recent activity. Start by adding animals or recording diagnoses.
              </p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium capitalize">{activity.type}</span>
                        <Badge variant={getUrgencyColor(activity.urgency)} className="text-xs">
                          {activity.urgency || 'normal'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {activity.animal} • {activity.date}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {activity.description}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Care Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upcoming Care</span>
              <Calendar className="w-5 h-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingCare.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No upcoming vaccinations scheduled. Keep your animals healthy with regular care.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingCare.map(vaccination => (
                  <div key={vaccination.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div>
                      <p className="font-medium">{vaccination.vaccine_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {vaccination.animals?.name} ({vaccination.animals?.animal_type})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Due: {new Date(vaccination.next_due_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="ml-2">
                      ${vaccination.cost || 0}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regional Disease Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Regional Alerts</span>
              <AlertTriangle className="w-5 h-5 text-orange-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {regionalAlerts.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-8">
                No active disease outbreaks in your region. Stay vigilant!
              </p>
            ) : (
              <div className="space-y-3">
                {regionalAlerts.map(outbreak => (
                  <div key={outbreak.id} className="p-3 rounded-lg border border-orange-200 bg-orange-50/50">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-orange-900">{outbreak.disease_name}</h4>
                      <Badge variant={getSeverityColor(outbreak.severity)}>
                        {outbreak.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {outbreak.location} • {outbreak.animal_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {outbreak.affected_count} cases reported
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Economic Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Cost Summary</span>
              <DollarSign className="w-5 h-5 text-green-500" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5">
                <div>
                  <p className="text-sm text-muted-foreground">Total Healthcare Costs</p>
                  <p className="text-2xl font-bold">${stats.totalCosts.toFixed(2)}</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Cost per Animal</p>
                  <p className="text-lg font-semibold">
                    ${stats.totalAnimals > 0 ? (stats.totalCosts / stats.totalAnimals).toFixed(2) : '0.00'}
                  </p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs text-muted-foreground mb-1">Active Treatments</p>
                  <p className="text-lg font-semibold">{recentActivities.filter(a => a.type === 'treatment').length}</p>
                </div>
              </div>

              <Button variant="outline" className="w-full">
                <BarChart3 className="w-4 h-4 mr-2" />
                View Detailed Analytics
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Heart className="w-6 h-6" />
              <span className="text-sm">New Diagnosis</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <Calendar className="w-6 h-6" />
              <span className="text-sm">Schedule Care</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <AlertTriangle className="w-6 h-6" />
              <span className="text-sm">Report Outbreak</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col gap-2 py-4">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
