import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader2, Pill, Search, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface Medicine {
  id: string;
  medication_name: string;
  generic_name: string | null;
  drug_class: string;
  target_animals: string[];
  target_conditions: string[];
  dosage_formula: string;
  administration_route: string;
  frequency: string;
  duration: string | null;
  contraindications: string[] | null;
  side_effects: string[] | null;
  approximate_cost_ksh: string | null;
  available_in_kenya: boolean | null;
  prescription_required: boolean | null;
  withdrawal_period_meat: string | null;
  withdrawal_period_milk: string | null;
  storage_conditions: string | null;
  warnings: string[] | null;
}

export const MedicineDatabase = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [populating, setPopulating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("all");

  const loadMedicines = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('medication_knowledge')
        .select('*')
        .eq('available_in_kenya', true)
        .order('medication_name');

      if (error) throw error;
      setMedicines(data || []);
      setFilteredMedicines(data || []);
    } catch (error) {
      console.error('Error loading medicines:', error);
      toast.error('Failed to load medicine database');
    } finally {
      setLoading(false);
    }
  };

  const populateDatabase = async () => {
    setPopulating(true);
    try {
      const { data, error } = await supabase.functions.invoke('populate-medicine-database');
      
      if (error) throw error;
      
      toast.success(`Successfully added ${data.count} medicines to database`);
      await loadMedicines();
    } catch (error) {
      console.error('Error populating database:', error);
      toast.error('Failed to populate medicine database');
    } finally {
      setPopulating(false);
    }
  };

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    let filtered = medicines;

    if (searchQuery) {
      filtered = filtered.filter(med => 
        med.medication_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.generic_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        med.target_conditions.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (selectedClass !== "all") {
      filtered = filtered.filter(med => med.drug_class === selectedClass);
    }

    setFilteredMedicines(filtered);
  }, [searchQuery, selectedClass, medicines]);

  const drugClasses = Array.from(new Set(medicines.map(m => m.drug_class)));

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-6 w-6" />
              Kenya Veterinary Medicine Database
            </CardTitle>
            <CardDescription>
              Comprehensive database of veterinary medicines available in Kenya with AI-estimated pricing
            </CardDescription>
          </div>
          <Button
            onClick={populateDatabase}
            disabled={populating}
            variant="outline"
            size="sm"
          >
            {populating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Populating...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Populate AI Database
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines, conditions, or ingredients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={selectedClass} onValueChange={setSelectedClass}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All ({medicines.length})</TabsTrigger>
            {drugClasses.map(drugClass => (
              <TabsTrigger key={drugClass} value={drugClass}>
                {drugClass} ({medicines.filter(m => m.drug_class === drugClass).length})
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedClass} className="mt-4">
            {filteredMedicines.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {medicines.length === 0 ? (
                  <div>
                    <p className="mb-4">No medicines in database yet.</p>
                    <Button onClick={populateDatabase} disabled={populating}>
                      {populating ? 'Populating...' : 'Populate Database with AI'}
                    </Button>
                  </div>
                ) : (
                  'No medicines found matching your search.'
                )}
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredMedicines.map((medicine) => (
                  <AccordionItem key={medicine.id} value={medicine.id}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="text-left">
                          <div className="font-semibold">{medicine.medication_name}</div>
                          {medicine.generic_name && (
                            <div className="text-sm text-muted-foreground">
                              ({medicine.generic_name})
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary">{medicine.drug_class}</Badge>
                          {medicine.approximate_cost_ksh && (
                            <Badge variant="outline">KSh {medicine.approximate_cost_ksh}</Badge>
                          )}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4">
                        <div>
                          <h4 className="font-semibold mb-2">Target Animals</h4>
                          <div className="flex flex-wrap gap-2">
                            {medicine.target_animals.map(animal => (
                              <Badge key={animal} variant="secondary">{animal}</Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Treats</h4>
                          <div className="flex flex-wrap gap-2">
                            {medicine.target_conditions.map(condition => (
                              <Badge key={condition}>{condition}</Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold mb-1">Dosage</h4>
                            <p className="text-sm">{medicine.dosage_formula}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Administration</h4>
                            <p className="text-sm">{medicine.administration_route}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold mb-1">Frequency</h4>
                            <p className="text-sm">{medicine.frequency}</p>
                          </div>
                          {medicine.duration && (
                            <div>
                              <h4 className="font-semibold mb-1">Duration</h4>
                              <p className="text-sm">{medicine.duration}</p>
                            </div>
                          )}
                        </div>

                        {medicine.withdrawal_period_meat && (
                          <div>
                            <h4 className="font-semibold mb-1">Withdrawal Periods</h4>
                            <p className="text-sm">
                              Meat: {medicine.withdrawal_period_meat}
                              {medicine.withdrawal_period_milk && ` | Milk: ${medicine.withdrawal_period_milk}`}
                            </p>
                          </div>
                        )}

                        {medicine.contraindications && medicine.contraindications.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-destructive">Contraindications</h4>
                            <ul className="text-sm list-disc list-inside space-y-1">
                              {medicine.contraindications.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {medicine.side_effects && medicine.side_effects.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Side Effects</h4>
                            <ul className="text-sm list-disc list-inside space-y-1">
                              {medicine.side_effects.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {medicine.warnings && medicine.warnings.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2 text-warning">Warnings</h4>
                            <ul className="text-sm list-disc list-inside space-y-1">
                              {medicine.warnings.map((item, idx) => (
                                <li key={idx}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {medicine.storage_conditions && (
                          <div>
                            <h4 className="font-semibold mb-1">Storage</h4>
                            <p className="text-sm">{medicine.storage_conditions}</p>
                          </div>
                        )}

                        <div className="flex gap-2 pt-2">
                          {medicine.prescription_required && (
                            <Badge variant="destructive">Prescription Required</Badge>
                          )}
                          {medicine.available_in_kenya && (
                            <Badge variant="default">Available in Kenya</Badge>
                          )}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
