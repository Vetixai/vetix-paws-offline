import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SpeciesOption {
  id: string;
  name: string;
  icon: string;
  category: 'livestock' | 'pets';
}

const speciesOptions: SpeciesOption[] = [
  { id: 'cattle', name: 'Cattle', icon: '🐄', category: 'livestock' },
  { id: 'goats', name: 'Goats', icon: '🐐', category: 'livestock' },
  { id: 'sheep', name: 'Sheep', icon: '🐑', category: 'livestock' },
  { id: 'poultry', name: 'Poultry', icon: '🐔', category: 'livestock' },
  { id: 'dogs', name: 'Dogs', icon: '🐕', category: 'pets' },
  { id: 'cats', name: 'Cats', icon: '🐱', category: 'pets' },
  { id: 'rabbits', name: 'Rabbits', icon: '🐰', category: 'pets' },
];

interface SpeciesSelectorProps {
  onSelect?: (species: string) => void;
  onSpeciesChange?: (species: string) => void;
  selectedSpecies?: string;
}

export const SpeciesSelector = ({ onSelect, onSpeciesChange, selectedSpecies }: SpeciesSelectorProps) => {
  const livestock = speciesOptions.filter(s => s.category === 'livestock');
  const pets = speciesOptions.filter(s => s.category === 'pets');

  const SpeciesCard = ({ species }: { species: SpeciesOption }) => (
    <Card 
      className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-soft hover:scale-105 ${
        selectedSpecies === species.id 
          ? 'ring-2 ring-primary bg-accent' 
          : 'hover:bg-accent/50'
      }`}
      onClick={() => {
        onSelect?.(species.id);
        onSpeciesChange?.(species.id);
      }}
    >
      <div className="text-center">
        <div className="text-4xl mb-2">{species.icon}</div>
        <h3 className="font-medium text-foreground">{species.name}</h3>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Livestock</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {livestock.map((species) => (
            <SpeciesCard key={species.id} species={species} />
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Domestic Animals</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {pets.map((species) => (
            <SpeciesCard key={species.id} species={species} />
          ))}
        </div>
      </div>
    </div>
  );
};