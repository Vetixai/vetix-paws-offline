import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, CheckCircle2, Clock, Syringe, Heart, Shield } from "lucide-react";
import { useLanguage } from "./LocalLanguageSupport";
import { useToast } from "@/components/ui/use-toast";

interface CareEvent {
  id: string;
  type: 'vaccination' | 'deworming' | 'checkup' | 'breeding' | 'nutrition';
  title: string;
  animal: string;
  dueDate: Date;
  completed: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  cost?: number;
  notes?: string;
}

const CARE_SCHEDULES = {
  cattle: [
    { type: 'vaccination', title: 'FMD Vaccine', interval: 180, priority: 'high' as const },
    { type: 'deworming', title: 'Deworming', interval: 90, priority: 'medium' as const },
    { type: 'checkup', title: 'Health Check', interval: 30, priority: 'low' as const },
    { type: 'vaccination', title: 'Anthrax Vaccine', interval: 365, priority: 'critical' as const },
  ],
  goat: [
    { type: 'vaccination', title: 'PPR Vaccine', interval: 365, priority: 'high' as const },
    { type: 'deworming', title: 'Deworming', interval: 60, priority: 'medium' as const },
    { type: 'checkup', title: 'Health Check', interval: 21, priority: 'low' as const },
  ],
  sheep: [
    { type: 'vaccination', title: 'PPR Vaccine', interval: 365, priority: 'high' as const },
    { type: 'deworming', title: 'Deworming', interval: 60, priority: 'medium' as const },
    { type: 'checkup', title: 'Health Check', interval: 21, priority: 'low' as const },
  ],
  chicken: [
    { type: 'vaccination', title: 'Newcastle Disease', interval: 90, priority: 'critical' as const },
    { type: 'deworming', title: 'Deworming', interval: 45, priority: 'medium' as const },
    { type: 'checkup', title: 'Flock Check', interval: 7, priority: 'low' as const },
  ]
};

export const PreventiveCareCalendar = () => {
  const [careEvents, setCareEvents] = useState<CareEvent[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<string>('cattle');
  const { translate, getAnimalTerm } = useLanguage();
  const { toast } = useToast();

  useEffect(() => {
    generateCareSchedule();
  }, [selectedAnimal]);

  const generateCareSchedule = () => {
    const schedule = CARE_SCHEDULES[selectedAnimal as keyof typeof CARE_SCHEDULES] || [];
    const now = new Date();
    
    const events: CareEvent[] = schedule.flatMap((item, index) => {
      const events = [];
      // Generate next 3 occurrences
      for (let i = 0; i < 3; i++) {
        const dueDate = new Date(now);
        dueDate.setDate(now.getDate() + (item.interval * i));
        
        events.push({
          id: `${selectedAnimal}-${item.type}-${i}`,
          type: item.type,
          title: item.title,
          animal: selectedAnimal,
          dueDate,
          completed: i === 0 && Math.random() > 0.7, // Some events already completed
          priority: item.priority,
          description: `${item.title} for ${getAnimalTerm(selectedAnimal)}`,
          cost: Math.floor(Math.random() * 500) + 100, // Random cost 100-600
        });
      }
      return events;
    });

    setCareEvents(events.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()));
  };

  const markCompleted = (eventId: string) => {
    setCareEvents(prev => 
      prev.map(event => 
        event.id === eventId 
          ? { ...event, completed: true, notes: `Completed on ${new Date().toLocaleDateString()}` }
          : event
      )
    );
    
    toast({
      title: "✅ Umekamilisha!",
      description: "Shughuli ya afya imesajiliwa",
    });
  };

  const getIcon = (type: CareEvent['type']) => {
    switch (type) {
      case 'vaccination': return <Syringe className="w-4 h-4" />;
      case 'deworming': return <Shield className="w-4 h-4" />;
      case 'checkup': return <Heart className="w-4 h-4" />;
      case 'breeding': return <Heart className="w-4 h-4" />;
      case 'nutrition': return <Heart className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: CareEvent['priority']) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getDaysUntilDue = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const upcomingEvents = careEvents.filter(e => !e.completed && getDaysUntilDue(e.dueDate) <= 30);
  const overdueEvents = careEvents.filter(e => !e.completed && getDaysUntilDue(e.dueDate) < 0);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {translate('vaccineSchedule')} - Ratiba ya Kuzuia Magonjwa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Animal Selector */}
          <div className="flex gap-2 flex-wrap">
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

          {/* Overdue Alerts */}
          {overdueEvents.length > 0 && (
            <Card className="border-destructive bg-destructive/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  Zimechelewa! ({overdueEvents.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {overdueEvents.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-2 bg-background rounded">
                      <div className="flex items-center gap-2">
                        {getIcon(event.type)}
                        <span className="text-sm font-medium">{event.title}</span>
                        <Badge variant="destructive" className="text-xs">
                          {Math.abs(getDaysUntilDue(event.dueDate))} siku zimepita
                        </Badge>
                      </div>
                      <Button size="sm" onClick={() => markCompleted(event.id)}>
                        Nimefanya
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Upcoming Schedule */}
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Zinazoland (30 siku zijazo)
            </h4>
            
            <div className="grid gap-3">
              {upcomingEvents.slice(0, 6).map((event) => {
                const daysUntil = getDaysUntilDue(event.dueDate);
                
                return (
                  <Card key={event.id} className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-primary">
                          {getIcon(event.type)}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{event.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {getAnimalTerm(event.animal)} • {event.dueDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(event.priority)} className="text-xs">
                          {daysUntil > 0 ? `${daysUntil} siku` : 'Leo!'}
                        </Badge>
                        
                        {event.cost && (
                          <Badge variant="outline" className="text-xs">
                            KES {event.cost}
                          </Badge>
                        )}
                        
                        {event.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => markCompleted(event.id)}
                          >
                            ✓
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    {event.notes && (
                      <p className="text-xs text-muted-foreground mt-2 pl-7">
                        {event.notes}
                      </p>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold text-success">{careEvents.filter(e => e.completed).length}</p>
              <p className="text-xs text-muted-foreground">Zimekamilika</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-warning">{upcomingEvents.length}</p>
              <p className="text-xs text-muted-foreground">Zinazoland</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-destructive">{overdueEvents.length}</p>
              <p className="text-xs text-muted-foreground">Zimechelewa</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};