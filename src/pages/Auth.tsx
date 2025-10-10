import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/components/LocalLanguageSupport';
import { Loader2, Stethoscope, Globe } from 'lucide-react';
import type { User, Session } from '@supabase/supabase-js';

const Auth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState('');
  const [userType, setUserType] = useState<'farmer' | 'agent' | 'veterinarian'>('farmer');
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentLanguage, setLanguage, translate } = useLanguage();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          navigate('/');
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            phone_number: phoneNumber,
            country: country,
            region: region,
            user_type: userType,
            language: currentLanguage,
          }
        }
      });

      if (error) {
        if (error.message.includes('User already registered')) {
          toast({
            title: currentLanguage === 'en-KE' ? "Account exists" : "Akaunti ipo",
            description: currentLanguage === 'en-KE' ? "This email is already registered. Please sign in instead." : "Barua pepe hii imeshasajiliwa. Tafadhali ingia badala yake.",
            variant: "destructive",
          });
        } else {
          toast({
            title: currentLanguage === 'en-KE' ? "Sign up failed" : "Usajili umeshindwa",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: currentLanguage === 'en-KE' ? "Check your email" : "Angalia barua pepe yako",
          description: currentLanguage === 'en-KE' ? "We've sent you a confirmation link to complete your registration." : "Tumetuma kiunga cha uthibitisho kukamilisha usajili wako.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast({
            title: currentLanguage === 'en-KE' ? "Invalid credentials" : "Utambulisho si sahihi",
            description: currentLanguage === 'en-KE' ? "Please check your email and password and try again." : "Tafadhali hakiki barua pepe na nenosiri lako ujaribu tena.",
            variant: "destructive",
          });
        } else {
          toast({
            title: currentLanguage === 'en-KE' ? "Sign in failed" : "Kuingia kumeshindwa",
            description: error.message,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-between items-start mb-4">
            <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit">
              <Stethoscope className="h-8 w-8 text-primary" />
            </div>
            <Select value={currentLanguage} onValueChange={setLanguage}>
              <SelectTrigger className="w-32">
                <Globe className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sw-KE">🇰🇪 KiSwahili</SelectItem>
                <SelectItem value="en-KE">🇬🇧 English</SelectItem>
                <SelectItem value="luo">🇰🇪 Dholuo</SelectItem>
                <SelectItem value="kik">🇰🇪 Gĩkũyũ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardTitle className="text-2xl font-bold">Vetix AI</CardTitle>
          <CardDescription>
            {currentLanguage === 'en-KE' ? 'AI-powered animal health assistant' : 'Msaada wa AI kwa afya ya wanyamapori'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">{currentLanguage === 'en-KE' ? 'Sign In' : 'Ingia'}</TabsTrigger>
              <TabsTrigger value="signup">{currentLanguage === 'en-KE' ? 'Sign Up' : 'Jisajili'}</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">{currentLanguage === 'en-KE' ? 'Email' : 'Barua pepe'}</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentLanguage === 'en-KE' ? 'example@email.com' : 'mfano@email.com'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">{currentLanguage === 'en-KE' ? 'Password' : 'Nenosiri'}</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={currentLanguage === 'en-KE' ? 'Enter your password' : 'Weka nenosiri lako'}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentLanguage === 'en-KE' ? 'Sign In' : 'Ingia'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">{currentLanguage === 'en-KE' ? 'Full Name' : 'Jina kamili'}</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={currentLanguage === 'en-KE' ? 'Your full name' : 'Jina lako kamili'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">{currentLanguage === 'en-KE' ? 'Email' : 'Barua pepe'}</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={currentLanguage === 'en-KE' ? 'example@email.com' : 'mfano@email.com'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">{currentLanguage === 'en-KE' ? 'Password' : 'Nenosiri'}</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={currentLanguage === 'en-KE' ? 'Choose a password' : 'Chagua nenosiri'}
                    required
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{currentLanguage === 'en-KE' ? 'Phone Number' : 'Nambari ya simu'}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0712345678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">{currentLanguage === 'en-KE' ? 'Country' : 'Nchi'}</Label>
                  <Input
                    id="country"
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder={currentLanguage === 'en-KE' ? 'e.g., Kenya, Tanzania, Uganda' : 'mfano: Kenya, Tanzania, Uganda'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">{currentLanguage === 'en-KE' ? 'Region/County' : 'Mkoa/Kaunti'}</Label>
                  <Input
                    id="region"
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder={currentLanguage === 'en-KE' ? 'e.g., Nairobi, Kilimanjaro' : 'mfano: Nairobi, Kilimanjaro'}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-type">{currentLanguage === 'en-KE' ? 'User Type' : 'Aina ya mtumiaji'}</Label>
                  <Select value={userType} onValueChange={(value: 'farmer' | 'agent' | 'veterinarian') => setUserType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={currentLanguage === 'en-KE' ? 'Select user type' : 'Chagua aina ya mtumiaji'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="farmer">{currentLanguage === 'en-KE' ? 'Farmer' : 'Mfugaji'}</SelectItem>
                      <SelectItem value="agent">{currentLanguage === 'en-KE' ? 'Community Agent' : 'Wakala wa jamii'}</SelectItem>
                      <SelectItem value="veterinarian">{currentLanguage === 'en-KE' ? 'Veterinarian' : 'Daktari wa wanyamapori'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {currentLanguage === 'en-KE' ? 'Sign Up' : 'Jisajili'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;