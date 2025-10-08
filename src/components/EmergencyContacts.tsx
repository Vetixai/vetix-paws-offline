import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Phone, Plus, Trash2, Edit2, Save, X, MapPin, User } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface EmergencyContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string;
  location: string;
  priority: number;
  is_active: boolean;
}

export const EmergencyContacts = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone_number: "",
    relationship: "",
    location: "",
    priority: 1
  });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('priority', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Hitilafu",
        description: "Imeshindwa kupakia anwani za dharura",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Ingia kwanza",
        description: "Unahitaji kuingia ili kuongeza anwani",
        variant: "destructive",
      });
      return;
    }

    if (!formData.name || !formData.phone_number) {
      toast({
        title: "Taarifa pungufu",
        description: "Jaza jina na nambari ya simu",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingId) {
        // Update existing contact
        const { error } = await supabase
          .from('emergency_contacts')
          .update({
            name: formData.name,
            phone_number: formData.phone_number,
            relationship: formData.relationship,
            location: formData.location,
            priority: formData.priority,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) throw error;
        
        toast({
          title: "Imebadilishwa",
          description: "Anwani imebadilishwa",
        });
      } else {
        // Create new contact
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            user_id: user.id,
            name: formData.name,
            phone_number: formData.phone_number,
            relationship: formData.relationship,
            location: formData.location,
            priority: formData.priority,
            is_active: true
          });

        if (error) throw error;
        
        toast({
          title: "Imeongezwa",
          description: "Anwani mpya imeongezwa",
        });
      }

      // Reset form and fetch updated contacts
      setFormData({ name: "", phone_number: "", relationship: "", location: "", priority: 1 });
      setIsAdding(false);
      setEditingId(null);
      fetchContacts();
    } catch (error) {
      console.error('Error saving contact:', error);
      toast({
        title: "Hitilafu",
        description: "Imeshindwa kuhifadhi anwani",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('emergency_contacts')
        .update({ is_active: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Imefutwa",
        description: "Anwani imefutwa",
      });
      fetchContacts();
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast({
        title: "Hitilafu",
        description: "Imeshindwa kufuta anwani",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setFormData({
      name: contact.name,
      phone_number: contact.phone_number,
      relationship: contact.relationship || "",
      location: contact.location || "",
      priority: contact.priority
    });
    setEditingId(contact.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({ name: "", phone_number: "", relationship: "", location: "", priority: 1 });
    setIsAdding(false);
    setEditingId(null);
  };

  const callContact = (phoneNumber: string) => {
    window.open(`tel:${phoneNumber}`);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">Inapakia...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" />
            Anwani za Dharura / Emergency Contacts
          </span>
          {!isAdding && (
            <Button
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Ongeza
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add/Edit Form */}
        {isAdding && (
          <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
            <h4 className="font-semibold text-sm">
              {editingId ? "Badilisha Anwani" : "Anwani Mpya"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name">Jina / Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Jina kamili"
                />
              </div>
              <div>
                <Label htmlFor="phone">Simu / Phone *</Label>
                <Input
                  id="phone"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                  placeholder="+254..."
                />
              </div>
              <div>
                <Label htmlFor="relationship">Uhusiano / Relationship</Label>
                <Input
                  id="relationship"
                  value={formData.relationship}
                  onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                  placeholder="Daktari, Jirani, Rafiki..."
                />
              </div>
              <div>
                <Label htmlFor="location">Mahali / Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Mji au eneo"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} className="gap-2">
                <Save className="w-4 h-4" />
                {editingId ? "Badilisha" : "Hifadhi"}
              </Button>
              <Button onClick={handleCancel} variant="outline" className="gap-2">
                <X className="w-4 h-4" />
                Ghairi
              </Button>
            </div>
          </div>
        )}

        {/* Contacts List */}
        {contacts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Hakuna anwani za dharura bado</p>
            <p className="text-sm">Bonyeza "Ongeza" kuongeza anwani mpya</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-4 bg-gradient-to-r from-background to-muted/30 rounded-lg border hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        {contact.name}
                      </h4>
                      {contact.priority === 1 && (
                        <Badge variant="default" className="text-xs">
                          Msingi / Primary
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {contact.phone_number}
                      </p>
                      {contact.relationship && (
                        <p className="flex items-center gap-2">
                          <User className="w-3 h-3" />
                          {contact.relationship}
                        </p>
                      )}
                      {contact.location && (
                        <p className="flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {contact.location}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => callContact(contact.phone_number)}
                      className="gap-2"
                    >
                      <Phone className="w-3 h-3" />
                      Piga
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground p-3 bg-muted/30 rounded">
          <p>💡 Ongeza anwani za dharura kwa daktari wa mifugo, majirani, au wafugaji wenzako</p>
          <p>📞 Weka nambari ambazo zinaweza kupatikana haraka wakati wa dharura</p>
        </div>
      </CardContent>
    </Card>
  );
};
