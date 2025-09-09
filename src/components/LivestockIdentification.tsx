import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Camera, QrCode, Search, Plus, Edit, Trash2, Heart, Calendar, MapPin } from "lucide-react";
import { useLanguage } from "./LocalLanguageSupport";
import { useToast } from "@/components/ui/use-toast";

interface AnimalProfile {
  id: string;
  name?: string;
  species: string;
  breed?: string;
  age?: string;
  gender?: 'male' | 'female';
  color?: string;
  markings?: string;
  photo?: string;
  qrCode?: string;
  owner: string;
  location?: string;
  healthHistory: HealthRecord[];
  vaccinations: VaccinationRecord[];
  breeding?: BreedingRecord[];
  createdAt: Date;
  updatedAt: Date;
}

interface HealthRecord {
  id: string;
  date: Date;
  condition: string;
  treatment: string;
  veterinarian?: string;
  notes?: string;
  cost?: number;
}

interface VaccinationRecord {
  id: string;
  vaccine: string;
  date: Date;
  nextDue?: Date;
  batch?: string;
  veterinarian?: string;
}

interface BreedingRecord {
  id: string;
  date: Date;
  partner?: string;
  expectedDue?: Date;
  outcome?: 'pregnant' | 'failed' | 'delivered';
  offspring?: number;
}

export const LivestockIdentification = () => {
  const [animals, setAnimals] = useState<AnimalProfile[]>([]);
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { translate, getAnimalTerm } = useLanguage();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate unique QR code for animal
  const generateQRCode = (animalId: string): string => {
    return `VETIX-${animalId}-${Date.now()}`;
  };

  // Generate unique animal ID
  const generateAnimalId = (): string => {
    return `VTX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Camera functions
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please use file upload instead.",
        variant: "destructive"
      });
    }
  };

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const photoDataURL = canvas.toDataURL('image/jpeg');
        setCapturedPhoto(photoDataURL);
        
        // Stop camera
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        toast({
          title: "📸 Photo Captured!",
          description: "Animal photo saved for identification",
        });
      }
    }
  }, [toast]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedPhoto(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create new animal profile
  const createAnimalProfile = () => {
    const newAnimal: AnimalProfile = {
      id: generateAnimalId(),
      species: 'cattle',
      owner: 'John Farmer', // Would get from current user
      qrCode: generateQRCode(generateAnimalId()),
      photo: capturedPhoto || undefined,
      healthHistory: [],
      vaccinations: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setAnimals(prev => [newAnimal, ...prev]);
    setSelectedAnimal(newAnimal);
    setIsEditing(true);
    setCapturedPhoto(null);
    
    toast({
      title: "🐄 New Animal Created!",
      description: `ID: ${newAnimal.id}`,
    });
  };

  // Update animal profile
  const updateAnimal = (updatedAnimal: AnimalProfile) => {
    updatedAnimal.updatedAt = new Date();
    setAnimals(prev => prev.map(animal => 
      animal.id === updatedAnimal.id ? updatedAnimal : animal
    ));
    setSelectedAnimal(updatedAnimal);
    setIsEditing(false);
    
    toast({
      title: "✅ Profile Updated",
      description: "Animal information saved successfully",
    });
  };

  // Add health record
  const addHealthRecord = (animalId: string, record: Omit<HealthRecord, 'id'>) => {
    const newRecord: HealthRecord = {
      ...record,
      id: `health-${Date.now()}`
    };
    
    setAnimals(prev => prev.map(animal => 
      animal.id === animalId 
        ? { ...animal, healthHistory: [newRecord, ...animal.healthHistory] }
        : animal
    ));
  };

  // Filter animals based on search
  const filteredAnimals = animals.filter(animal => 
    animal.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    animal.species.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Utambulisho wa Wanyama - Livestock ID System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Controls */}
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, name, or species..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Button onClick={startCamera} variant="outline" className="gap-2">
              <Camera className="w-4 h-4" />
              Take Photo
            </Button>
            
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              Upload Photo
            </Button>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              ref={fileInputRef}
              className="hidden"
            />
          </div>

          {/* Camera/Photo Capture */}
          {videoRef.current?.srcObject && (
            <Card className="p-4">
              <div className="space-y-4">
                <video 
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full max-w-sm mx-auto rounded-lg"
                />
                <div className="flex justify-center gap-2">
                  <Button onClick={capturePhoto}>
                    📸 Capture Photo
                  </Button>
                  <Button variant="outline" onClick={() => {
                    const stream = videoRef.current?.srcObject as MediaStream;
                    stream?.getTracks().forEach(track => track.stop());
                  }}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Captured Photo Preview */}
          {capturedPhoto && (
            <Card className="p-4">
              <div className="space-y-4">
                <img 
                  src={capturedPhoto} 
                  alt="Captured animal" 
                  className="w-full max-w-sm mx-auto rounded-lg"
                />
                <div className="flex justify-center gap-2">
                  <Button onClick={createAnimalProfile}>
                    ✅ Create Animal Profile
                  </Button>
                  <Button variant="outline" onClick={() => setCapturedPhoto(null)}>
                    Retake Photo
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Animals List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAnimals.map((animal) => (
              <Card 
                key={animal.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedAnimal?.id === animal.id ? 'border-primary' : ''
                }`}
                onClick={() => setSelectedAnimal(animal)}
              >
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Animal Photo */}
                    {animal.photo ? (
                      <img 
                        src={animal.photo} 
                        alt={`${animal.species} ${animal.id}`}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-32 bg-muted rounded-md flex items-center justify-center">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Basic Info */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="text-xs">
                          {animal.id}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {getAnimalTerm(animal.species)}
                        </Badge>
                      </div>
                      
                      <h4 className="font-medium">
                        {animal.name || `${getAnimalTerm(animal.species)} ${animal.id.slice(-4)}`}
                      </h4>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        {animal.breed && <p>Breed: {animal.breed}</p>}
                        {animal.age && <p>Age: {animal.age}</p>}
                        <p>Owner: {animal.owner}</p>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Heart className="w-3 h-3 mr-1" />
                          {animal.healthHistory.length} records
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Calendar className="w-3 h-3 mr-1" />
                          {animal.vaccinations.length} vaccines
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Selected Animal Details */}
          {selectedAnimal && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {selectedAnimal.name || `${getAnimalTerm(selectedAnimal.species)} ${selectedAnimal.id.slice(-4)}`}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setIsEditing(!isEditing)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input 
                      placeholder="Animal name" 
                      defaultValue={selectedAnimal.name}
                    />
                    <Input 
                      placeholder="Breed" 
                      defaultValue={selectedAnimal.breed}
                    />
                    <Input 
                      placeholder="Age" 
                      defaultValue={selectedAnimal.age}
                    />
                    <select className="border rounded px-3 py-2" defaultValue={selectedAnimal.gender}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <Input 
                      placeholder="Color" 
                      defaultValue={selectedAnimal.color}
                    />
                    <Input 
                      placeholder="Location" 
                      defaultValue={selectedAnimal.location}
                    />
                    <div className="md:col-span-2">
                      <Textarea 
                        placeholder="Special markings or notes"
                        defaultValue={selectedAnimal.markings}
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <Button onClick={() => updateAnimal(selectedAnimal)}>
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Animal Details */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Animal Information</h4>
                      <div className="text-sm space-y-2">
                        <p><strong>ID:</strong> {selectedAnimal.id}</p>
                        <p><strong>QR Code:</strong> {selectedAnimal.qrCode}</p>
                        <p><strong>Species:</strong> {getAnimalTerm(selectedAnimal.species)}</p>
                        <p><strong>Owner:</strong> {selectedAnimal.owner}</p>
                        {selectedAnimal.location && (
                          <p><strong>Location:</strong> {selectedAnimal.location}</p>
                        )}
                        <p><strong>Created:</strong> {selectedAnimal.createdAt.toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Health History */}
                    <div className="space-y-3">
                      <h4 className="font-medium">Recent Health Records</h4>
                      {selectedAnimal.healthHistory.length > 0 ? (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {selectedAnimal.healthHistory.slice(0, 5).map((record) => (
                            <div key={record.id} className="border p-2 rounded text-sm">
                              <p><strong>{record.condition}</strong></p>
                              <p className="text-muted-foreground">{record.treatment}</p>
                              <p className="text-xs">{record.date.toLocaleDateString()}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm">No health records yet</p>
                      )}
                      
                      <Button size="sm" variant="outline" className="w-full">
                        + Add Health Record
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </CardContent>
      </Card>
    </div>
  );
};