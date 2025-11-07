import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, BookOpen, Pill, Syringe, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Disease {
  id: string;
  disease_name: string;
  animal_types: string[];
  common_symptoms: string[];
  severity: string;
  treatment_protocol: string;
  prevention_measures: string[];
  vaccination_available: boolean;
  zoonotic: boolean;
  economic_impact: string;
}

interface Medication {
  id: string;
  medication_name: string;
  drug_class: string;
  target_animals: string[];
  dosage_formula: string;
  administration_route: string;
  approximate_cost_ksh: string;
  warnings: string[];
}

interface VaccinationSchedule {
  id: string;
  animal_type: string;
  vaccine_name: string;
  disease_prevention: string;
  age_at_first_dose: string;
  critical_priority: string;
  cost_range_ksh: string;
  booster_frequency: string;
}

interface EmergencyProcedure {
  id: string;
  emergency_type: string;
  animal_types: string[];
  immediate_signs: string[];
  immediate_actions: string[];
  time_sensitive_minutes: number;
}

interface BestPractice {
  id: string;
  category: string;
  practice_title: string;
  description: string;
  benefits: string[];
  cost_implication: string;
  roi_timeframe: string;
}

export const KnowledgeBase = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vaccinations, setVaccinations] = useState<VaccinationSchedule[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyProcedure[]>([]);
  const [practices, setPractices] = useState<BestPractice[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const searchKnowledgeBase = async (category: string) => {
    setLoading(true);
    try {
      if (category === "diseases") {
        const { data, error } = await supabase
          .from("disease_knowledge")
          .select("*")
          .or(`disease_name.ilike.%${searchQuery}%,common_symptoms.cs.{${searchQuery}}`)
          .order("severity", { ascending: false })
          .limit(10);
        
        if (error) throw error;
        setDiseases(data || []);
      } else if (category === "medications") {
        const { data, error } = await supabase
          .from("medication_knowledge")
          .select("*")
          .or(`medication_name.ilike.%${searchQuery}%,target_conditions.cs.{${searchQuery}}`)
          .limit(10);
        
        if (error) throw error;
        setMedications(data || []);
      } else if (category === "vaccinations") {
        const { data, error } = await supabase
          .from("vaccination_schedules")
          .select("*")
          .or(`vaccine_name.ilike.%${searchQuery}%,disease_prevention.ilike.%${searchQuery}%`)
          .order("critical_priority", { ascending: true })
          .limit(10);
        
        if (error) throw error;
        setVaccinations(data || []);
      } else if (category === "emergencies") {
        const { data, error } = await supabase
          .from("emergency_procedures")
          .select("*")
          .ilike("emergency_type", `%${searchQuery}%`)
          .limit(10);
        
        if (error) throw error;
        setEmergencies(data || []);
      } else if (category === "practices") {
        const { data, error } = await supabase
          .from("farming_best_practices")
          .select("*")
          .or(`practice_title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .limit(10);
        
        if (error) throw error;
        setPractices(data || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search failed",
        description: "Could not search knowledge base",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async (category: string) => {
    setSearchQuery("");
    setLoading(true);
    try {
      if (category === "diseases") {
        const { data, error } = await supabase
          .from("disease_knowledge")
          .select("*")
          .order("severity", { ascending: false });
        
        if (error) throw error;
        setDiseases(data || []);
      } else if (category === "medications") {
        const { data, error } = await supabase
          .from("medication_knowledge")
          .select("*")
          .order("medication_name");
        
        if (error) throw error;
        setMedications(data || []);
      } else if (category === "vaccinations") {
        const { data, error } = await supabase
          .from("vaccination_schedules")
          .select("*")
          .order("critical_priority");
        
        if (error) throw error;
        setVaccinations(data || []);
      } else if (category === "emergencies") {
        const { data, error } = await supabase
          .from("emergency_procedures")
          .select("*")
          .order("time_sensitive_minutes");
        
        if (error) throw error;
        setEmergencies(data || []);
      } else if (category === "practices") {
        const { data, error } = await supabase
          .from("farming_best_practices")
          .select("*")
          .order("category");
        
        if (error) throw error;
        setPractices(data || []);
      }
    } catch (error) {
      console.error("Load error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "secondary";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <BookOpen className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Veterinary Knowledge Base</h2>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          placeholder="Search diseases, medications, vaccines..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchKnowledgeBase("diseases")}
        />
        <Button onClick={() => searchKnowledgeBase("diseases")} disabled={loading}>
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="diseases" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="diseases" onClick={() => loadAllData("diseases")}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Diseases
          </TabsTrigger>
          <TabsTrigger value="medications" onClick={() => loadAllData("medications")}>
            <Pill className="h-4 w-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="vaccinations" onClick={() => loadAllData("vaccinations")}>
            <Syringe className="h-4 w-4 mr-2" />
            Vaccinations
          </TabsTrigger>
          <TabsTrigger value="emergencies" onClick={() => loadAllData("emergencies")}>
            <AlertTriangle className="h-4 w-4 mr-2" />
            Emergencies
          </TabsTrigger>
          <TabsTrigger value="practices" onClick={() => loadAllData("practices")}>
            <Lightbulb className="h-4 w-4 mr-2" />
            Best Practices
          </TabsTrigger>
        </TabsList>

        <TabsContent value="diseases" className="mt-6">
          <Accordion type="single" collapsible className="w-full">
            {diseases.map((disease) => (
              <AccordionItem key={disease.id} value={disease.id}>
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">{disease.disease_name}</span>
                    <Badge variant={getSeverityColor(disease.severity)}>{disease.severity}</Badge>
                    {disease.zoonotic && <Badge variant="destructive">Zoonotic</Badge>}
                    {disease.vaccination_available && <Badge variant="secondary">Vaccine Available</Badge>}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Affects:</h4>
                      <div className="flex gap-2">
                        {disease.animal_types.map((type) => (
                          <Badge key={type} variant="outline">{type}</Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Common Symptoms:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {disease.common_symptoms.map((symptom, idx) => (
                          <li key={idx}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Treatment:</h4>
                      <p className="text-sm">{disease.treatment_protocol}</p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Prevention:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {disease.prevention_measures.map((measure, idx) => (
                          <li key={idx} className="text-sm">{measure}</li>
                        ))}
                      </ul>
                    </div>
                    {disease.economic_impact && (
                      <div className="bg-muted p-3 rounded">
                        <h4 className="font-semibold mb-1 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          Economic Impact:
                        </h4>
                        <p className="text-sm">{disease.economic_impact}</p>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
          {diseases.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">Click the tab to load disease information</p>
          )}
        </TabsContent>

        <TabsContent value="medications" className="mt-6">
          <div className="grid gap-4">
            {medications.map((med) => (
              <Card key={med.id} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{med.medication_name}</h3>
                      <Badge variant="outline">{med.drug_class}</Badge>
                    </div>
                    {med.approximate_cost_ksh && (
                      <span className="text-sm font-semibold text-primary">{med.approximate_cost_ksh}</span>
                    )}
                  </div>
                  <div>
                    <span className="font-semibold">Dosage: </span>
                    <span className="text-sm">{med.dosage_formula}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Route: </span>
                    <span className="text-sm">{med.administration_route}</span>
                  </div>
                  <div>
                    <span className="font-semibold">For: </span>
                    {med.target_animals.map((animal) => (
                      <Badge key={animal} variant="secondary" className="mr-1">{animal}</Badge>
                    ))}
                  </div>
                  {med.warnings && med.warnings.length > 0 && (
                    <div className="bg-destructive/10 p-2 rounded">
                      <p className="font-semibold text-sm text-destructive mb-1">⚠️ Warnings:</p>
                      <ul className="list-disc list-inside text-sm">
                        {med.warnings.map((warning, idx) => (
                          <li key={idx}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          {medications.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">Click the tab to load medication information</p>
          )}
        </TabsContent>

        <TabsContent value="vaccinations" className="mt-6">
          <div className="grid gap-4">
            {vaccinations.map((vac) => (
              <Card key={vac.id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold">{vac.vaccine_name}</h3>
                      <p className="text-sm text-muted-foreground">Prevents: {vac.disease_prevention}</p>
                    </div>
                    <Badge variant={vac.critical_priority === "essential" ? "default" : "secondary"}>
                      {vac.critical_priority}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-semibold">Animal:</span> {vac.animal_type}</div>
                    <div><span className="font-semibold">First dose:</span> {vac.age_at_first_dose}</div>
                    <div><span className="font-semibold">Booster:</span> {vac.booster_frequency}</div>
                    <div><span className="font-semibold">Cost:</span> {vac.cost_range_ksh}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {vaccinations.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">Click the tab to load vaccination schedules</p>
          )}
        </TabsContent>

        <TabsContent value="emergencies" className="mt-6">
          <div className="grid gap-4">
            {emergencies.map((emergency) => (
              <Card key={emergency.id} className="p-4 border-destructive">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-lg text-destructive">{emergency.emergency_type}</h3>
                    <Badge variant="destructive">⏱️ {emergency.time_sensitive_minutes} min</Badge>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Warning Signs:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {emergency.immediate_signs.map((sign, idx) => (
                        <li key={idx}>{sign}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded">
                    <h4 className="font-semibold mb-1">Immediate Actions:</h4>
                    <ol className="list-decimal list-inside text-sm space-y-1">
                      {emergency.immediate_actions.map((action, idx) => (
                        <li key={idx}>{action}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {emergencies.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">Click the tab to load emergency procedures</p>
          )}
        </TabsContent>

        <TabsContent value="practices" className="mt-6">
          <div className="grid gap-4">
            {practices.map((practice) => (
              <Card key={practice.id} className="p-4">
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">{practice.category}</Badge>
                    <h3 className="font-bold text-lg">{practice.practice_title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{practice.description}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Benefits:</h4>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {practice.benefits.map((benefit, idx) => (
                        <li key={idx}>{benefit}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-4 text-sm">
                    <span><span className="font-semibold">Cost:</span> {practice.cost_implication}</span>
                    <span><span className="font-semibold">ROI:</span> {practice.roi_timeframe}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          {practices.length === 0 && !loading && (
            <p className="text-center text-muted-foreground py-8">Click the tab to load best practices</p>
          )}
        </TabsContent>
      </Tabs>
    </Card>
  );
};
