import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageCircle, Phone, MapPin, Star, Clock, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface VetAgent {
  id: string;
  name: string;
  title: string;
  location: string;
  distance: string;
  rating: number;
  totalCases: number;
  specialties: string[];
  availability: 'online' | 'busy' | 'offline';
  responseTime: string;
  avatar: string;
  languages: string[];
  cost: string;
}

interface CommunityPost {
  id: string;
  author: string;
  avatar: string;
  animalType: string;
  title: string;
  description: string;
  images: string[];
  timestamp: string;
  responses: number;
  urgency: 'low' | 'medium' | 'high';
  solved: boolean;
}

export const CommunityAgentMode = () => {
  const [activeTab, setActiveTab] = useState<'agents' | 'community'>('agents');
  const [availableAgents, setAvailableAgents] = useState<VetAgent[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<VetAgent | null>(null);
  const [consultationMessage, setConsultationMessage] = useState("");
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    animalType: "",
    urgency: "medium" as 'low' | 'medium' | 'high'
  });
  const { toast } = useToast();

  // Mock data for demonstration
  useEffect(() => {
    loadAvailableAgents();
    loadCommunityPosts();
  }, []);

  const loadAvailableAgents = async () => {
    setIsLoadingAgents(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockAgents: VetAgent[] = [
      {
        id: '1',
        name: 'Dr. Sarah Mwangi',
        title: 'Licensed Veterinarian',
        location: 'Nairobi, Kenya',
        distance: '2.1 km',
        rating: 4.9,
        totalCases: 1247,
        specialties: ['Cattle', 'Goats', 'Emergency Care'],
        availability: 'online',
        responseTime: '< 5 min',
        avatar: '/placeholder-vet1.jpg',
        languages: ['English', 'Swahili', 'Kikuyu'],
        cost: '300-500 KSH'
      },
      {
        id: '2',
        name: 'Dr. Joseph Kimani',
        title: 'Community Veterinary Agent',
        location: 'Kiambu, Kenya',
        distance: '5.7 km',
        rating: 4.7,
        totalCases: 892,
        specialties: ['Poultry', 'Sheep', 'Preventive Care'],
        availability: 'online',
        responseTime: '< 10 min',
        avatar: '/placeholder-vet2.jpg',
        languages: ['English', 'Swahili'],
        cost: '200-400 KSH'
      },
      {
        id: '3',
        name: 'Agnes Wanjiku',
        title: 'Certified Animal Health Technician',
        location: 'Thika, Kenya',
        distance: '12.3 km',
        rating: 4.6,
        totalCases: 654,
        specialties: ['Basic Treatment', 'Vaccination', 'Health Monitoring'],
        availability: 'busy',
        responseTime: '< 30 min',
        avatar: '/placeholder-vet3.jpg',
        languages: ['Swahili', 'Kikuyu'],
        cost: '150-300 KSH'
      }
    ];
    
    setAvailableAgents(mockAgents);
    setIsLoadingAgents(false);
  };

  const loadCommunityPosts = async () => {
    const mockPosts: CommunityPost[] = [
      {
        id: '1',
        author: 'John Farmer',
        avatar: '/placeholder-farmer1.jpg',
        animalType: 'Cow',
        title: 'My cow is not eating well for 2 days',
        description: 'She seems lethargic and has reduced appetite. Temperature feels normal.',
        images: [],
        timestamp: '2 hours ago',
        responses: 3,
        urgency: 'medium',
        solved: false
      },
      {
        id: '2',
        author: 'Mary Wanjira',
        avatar: '/placeholder-farmer2.jpg',
        animalType: 'Chicken',
        title: 'Chickens showing respiratory symptoms',
        description: 'Several chickens coughing and wheezing. Started yesterday.',
        images: [],
        timestamp: '5 hours ago',
        responses: 7,
        urgency: 'high',
        solved: true
      }
    ];
    
    setCommunityPosts(mockPosts);
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'online': return 'text-green-600';
      case 'busy': return 'text-yellow-600';
      case 'offline': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'online': return 'default';
      case 'busy': return 'secondary';
      case 'offline': return 'outline';
      default: return 'outline';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const connectToAgent = (agent: VetAgent) => {
    setSelectedAgent(agent);
    toast({
      title: "Connected to Agent",
      description: `Starting consultation with ${agent.name}`,
    });
  };

  const sendConsultationMessage = () => {
    if (!consultationMessage.trim() || !selectedAgent) return;
    
    toast({
      title: "Message Sent",
      description: `Your consultation request has been sent to ${selectedAgent.name}`,
    });
    
    setConsultationMessage("");
    setSelectedAgent(null);
  };

  const submitCommunityPost = () => {
    if (!newPost.title.trim() || !newPost.description.trim()) {
      toast({
        title: "Incomplete Post",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Post Submitted",
      description: "Your question has been posted to the community",
    });
    
    setNewPost({ title: "", description: "", animalType: "", urgency: "medium" });
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('agents')}
          className={`flex-1 px-4 py-2 rounded-md transition-all ${
            activeTab === 'agents' 
              ? 'bg-background shadow-sm text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Veterinary Agents
        </button>
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 px-4 py-2 rounded-md transition-all ${
            activeTab === 'community' 
              ? 'bg-background shadow-sm text-foreground' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MessageCircle className="w-4 h-4 inline mr-2" />
          Community Forum
        </button>
      </div>

      {/* Agents Tab */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Connect with Local Veterinary Professionals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Get instant professional help from certified veterinarians and animal health technicians in your area.
              </p>
              
              {isLoadingAgents ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Finding available agents near you...</p>
                </div>
              ) : availableAgents.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="text-lg font-semibold mb-2">No Agents Available</h3>
                  <p className="text-muted-foreground">
                    Veterinary agents will be listed here once they register in your area.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {availableAgents.map((agent) => (
                    <Card key={agent.id} className="border-2 hover:border-primary/50 transition-colors">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <Avatar className="w-12 h-12">
                              <AvatarImage src={agent.avatar} alt={agent.name} />
                              <AvatarFallback>{agent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{agent.name}</h4>
                                <Badge variant={getAvailabilityBadge(agent.availability)}>
                                  {agent.availability}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground mb-2">{agent.title}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {agent.location} • {agent.distance}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                  {agent.rating} ({agent.totalCases} cases)
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {agent.responseTime}
                                </span>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mb-2">
                                {agent.specialties.map((specialty, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {specialty}
                                  </Badge>
                                ))}
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  <span className="font-medium">Languages:</span> {agent.languages.join(', ')}
                                  <br />
                                  <span className="font-medium">Cost:</span> {agent.cost}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              onClick={() => connectToAgent(agent)}
                              disabled={agent.availability === 'offline'}
                              className="whitespace-nowrap"
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              Consult
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`tel:+254700123456`)}
                              className="whitespace-nowrap"
                            >
                              <Phone className="w-4 h-4 mr-1" />
                              Call
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Community Tab */}
      {activeTab === 'community' && (
        <div className="space-y-4">
          {/* New Post Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ask the Community</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="What's your question about? (e.g., My cow is limping)"
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({...prev, title: e.target.value}))}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Animal type (e.g., Cow, Goat)"
                  value={newPost.animalType}
                  onChange={(e) => setNewPost(prev => ({...prev, animalType: e.target.value}))}
                />
                <select
                  className="px-3 py-2 border rounded-md"
                  value={newPost.urgency}
                  onChange={(e) => setNewPost(prev => ({...prev, urgency: e.target.value as any}))}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>
              
              <Textarea
                placeholder="Describe the symptoms and situation in detail..."
                value={newPost.description}
                onChange={(e) => setNewPost(prev => ({...prev, description: e.target.value}))}
                rows={3}
              />
              
              <Button onClick={submitCommunityPost} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Post to Community
              </Button>
            </CardContent>
          </Card>

          {/* Community Posts */}
          {communityPosts.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Community Posts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Be the first to ask a question or share your experience with the community!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
            {communityPosts.map((post) => (
              <Card key={post.id} className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={post.avatar} alt={post.author} />
                        <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{post.author}</p>
                        <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {post.animalType}
                      </Badge>
                      <Badge variant={getUrgencyColor(post.urgency)} className="text-xs">
                        {post.urgency}
                      </Badge>
                      {post.solved && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Solved
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-semibold mb-2">{post.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{post.description}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.responses} responses</span>
                    <Button variant="ghost" size="sm" className="h-auto p-0 text-xs">
                      View Discussion →
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          )}
        </div>
      )}

      {/* Consultation Modal */}
      {selectedAgent && (
        <Card className="fixed inset-x-4 top-20 z-50 max-w-lg mx-auto border-2 border-primary bg-background shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={selectedAgent.avatar} alt={selectedAgent.name} />
                <AvatarFallback>{selectedAgent.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">{selectedAgent.name}</p>
                <p className="text-sm text-muted-foreground">{selectedAgent.title}</p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Describe your animal's condition and symptoms..."
              value={consultationMessage}
              onChange={(e) => setConsultationMessage(e.target.value)}
              rows={4}
            />
            
            <div className="flex gap-2">
              <Button onClick={sendConsultationMessage} className="flex-1">
                <Send className="w-4 h-4 mr-2" />
                Send Consultation
              </Button>
              <Button variant="outline" onClick={() => setSelectedAgent(null)}>
                Cancel
              </Button>
            </div>
            
            <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
              <p><strong>Response time:</strong> {selectedAgent.responseTime}</p>
              <p><strong>Consultation cost:</strong> {selectedAgent.cost}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};