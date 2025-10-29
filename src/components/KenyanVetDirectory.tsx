import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, MapPin, Clock, Star } from "lucide-react";
import { useLanguage } from "./LocalLanguageSupport";

interface VetService {
  name: string;
  location: string;
  phone: string;
  type: "government" | "private" | "mobile";
  hours: string;
  rating: number;
  services: string[];
  distance?: string;
}

export const KenyanVetDirectory = () => {
  const { currentLanguage } = useLanguage();
  const [searchRegion, setSearchRegion] = useState("");
  const [vets] = useState<VetService[]>([
    {
      name: "Kiambu County Veterinary Office",
      location: "Kiambu Town",
      phone: "0712-345-678",
      type: "government",
      hours: "Mon-Fri: 8AM-5PM",
      rating: 4.2,
      services: ["Vaccinations", "Disease Testing", "Advisory"],
      distance: "5 km"
    },
    {
      name: "Dr. Wanjiru Mobile Vet",
      location: "Nairobi/Kiambu Region",
      phone: "0722-123-456",
      type: "mobile",
      hours: "7 days: 7AM-7PM",
      rating: 4.8,
      services: ["Emergency", "Surgery", "Farm Visits"],
      distance: "Mobile Service"
    },
    {
      name: "Nakuru Animal Health Center",
      location: "Nakuru Town",
      phone: "0733-987-654",
      type: "private",
      hours: "Mon-Sat: 8AM-6PM",
      rating: 4.5,
      services: ["All Animals", "Lab Testing", "Pharmacy"],
      distance: "45 km"
    },
    {
      name: "Kajiado Livestock Office",
      location: "Kajiado Town",
      phone: "0745-678-901",
      type: "government",
      hours: "Mon-Fri: 8AM-4PM",
      rating: 4.0,
      services: ["Livestock Registration", "Disease Control", "Free Vaccinations"],
      distance: "60 km"
    }
  ]);

  const getTypeBadge = (type: string) => {
    if (type === "government") return <Badge variant="secondary">Government</Badge>;
    if (type === "mobile") return <Badge className="bg-success text-success-foreground">Mobile</Badge>;
    return <Badge variant="outline">Private</Badge>;
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          {currentLanguage === 'sw-KE' ? 'Madaktari wa Wanyama Kenya' : 'Veterinary Services Kenya'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={currentLanguage === 'sw-KE' ? "Tafuta eneo..." : "Search by region..."}
            value={searchRegion}
            onChange={(e) => setSearchRegion(e.target.value)}
          />
          <Button variant="outline">
            {currentLanguage === 'sw-KE' ? 'Tafuta' : 'Search'}
          </Button>
        </div>

        <div className="space-y-3">
          {vets.map((vet, index) => (
            <div key={index} className="p-4 border border-border rounded-lg hover:shadow-soft transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{vet.name}</h4>
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{vet.location} • {vet.distance}</p>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="text-sm font-medium text-foreground">{vet.rating}</span>
                  </div>
                </div>
                {getTypeBadge(vet.type)}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-success" />
                  <a href={`tel:${vet.phone}`} className="text-primary hover:underline font-medium">
                    {vet.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{vet.hours}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {vet.services.map((service, idx) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {service}
                  </Badge>
                ))}
              </div>

              <Button className="w-full mt-3 bg-success hover:bg-success/90" size="sm">
                <Phone className="w-4 h-4 mr-2" />
                {currentLanguage === 'sw-KE' ? 'Piga Simu' : 'Call Now'}
              </Button>
            </div>
          ))}
        </div>

        <div className="p-3 bg-primary/10 rounded-lg text-sm text-center text-muted-foreground">
          {currentLanguage === 'sw-KE' 
            ? 'Wasiliana na ofisi ya serikali kwa huduma za bure' 
            : 'Contact government offices for free services'}
        </div>
      </CardContent>
    </Card>
  );
};
