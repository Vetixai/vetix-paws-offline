import { useState, useEffect, createContext, useContext } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Globe, Volume2, Mic } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// Language definitions with cultural adaptations
export const SUPPORTED_LANGUAGES = {
  'sw-KE': {
    name: 'Kiswahili (Kenya)',
    nativeName: 'Kiswahili',
    code: 'sw-KE',
    flag: '🇰🇪',
    voiceCode: 'sw-KE',
    region: 'Kenya',
    animalTerms: {
      cattle: 'ng\'ombe',
      goat: 'mbuzi', 
      sheep: 'kondoo',
      chicken: 'kuku',
      dog: 'mbwa',
      cat: 'paka'
    }
  },
  'sw-TZ': {
    name: 'Kiswahili (Tanzania)', 
    nativeName: 'Kiswahili',
    code: 'sw-TZ',
    flag: '🇹🇿',
    voiceCode: 'sw-TZ',
    region: 'Tanzania',
    animalTerms: {
      cattle: 'ng\'ombe',
      goat: 'mbuzi',
      sheep: 'kondoo', 
      chicken: 'kuku',
      dog: 'mbwa',
      cat: 'paka'
    }
  },
  'en-KE': {
    name: 'English (Kenya)',
    nativeName: 'English',
    code: 'en-KE',
    flag: '🇬🇧',
    voiceCode: 'en-KE',
    region: 'Kenya',
    animalTerms: {
      cattle: 'cattle',
      goat: 'goat',
      sheep: 'sheep',
      chicken: 'chicken', 
      dog: 'dog',
      cat: 'cat'
    }
  },
  'luo': {
    name: 'Dholuo',
    nativeName: 'Dholuo',
    code: 'luo',
    flag: '🇰🇪',
    voiceCode: 'en-KE', // Fallback to English for voice
    region: 'Kenya/Tanzania',
    animalTerms: {
      cattle: 'dhiang',
      goat: 'diel',
      sheep: 'rombe',
      chicken: 'gweno',
      dog: 'guok',
      cat: 'oyawa'
    }
  },
  'kik': {
    name: 'Kikuyu',
    nativeName: 'Gĩkũyũ',
    code: 'kik',
    flag: '🇰🇪',
    voiceCode: 'en-KE',
    region: 'Kenya',
    animalTerms: {
      cattle: 'ngʼombe',
      goat: 'mbũri',
      sheep: 'ngʼondu',
      chicken: 'ngũkũ',
      dog: 'ngui',
      cat: 'njau'
    }
  }
};

// Translations for common veterinary terms
export const TRANSLATIONS = {
  'sw-KE': {
    welcome: 'Karibu Vetix AI',
    symptoms: 'Dalili za Mnyama',
    diagnosis: 'Uchunguzi wa Kiafya',
    emergency: 'Hali ya Dharura',
    treatment: 'Matibabu',
    prevention: 'Kuzuia',
    consultation: 'Ushauri',
    healthCheck: 'Kupima Afya',
    animalCare: 'Huduma za Wanyamapori',
    farmingTips: 'Vidokezo vya Kilimo',
    diseaseAlert: 'Onyo la Ugonjwa',
    vaccineSchedule: 'Ratiba ya Chanjo',
    feedingGuide: 'Mwongozo wa Kulisha',
    breedingTips: 'Ushauri wa Uzazi',
    weatherAlert: 'Tahadhari ya Hali ya Anga',
    marketPrices: 'Bei za Soko'
  },
  'sw-TZ': {
    welcome: 'Karibu Vetix AI',
    symptoms: 'Dalili za Mnyama',  
    diagnosis: 'Uchunguzi wa Afya',
    emergency: 'Dharura',
    treatment: 'Matibabu',
    prevention: 'Kujikinga',
    consultation: 'Ushauri',
    healthCheck: 'Ukaguzi wa Afya',
    animalCare: 'Utunzaji wa Wanyama',
    farmingTips: 'Mipango ya Kilimo',
    diseaseAlert: 'Onyo la Ugonjwa',
    vaccineSchedule: 'Ratiba ya Chanjo',
    feedingGuide: 'Mwongozo wa Kulisha',
    breedingTips: 'Ushauri wa Uzazi',
    weatherAlert: 'Tahadhari ya Hali ya Anga',
    marketPrices: 'Bei za Soko'
  },
  'en-KE': {
    welcome: 'Welcome to Vetix AI',
    symptoms: 'Animal Symptoms',
    diagnosis: 'Health Diagnosis', 
    emergency: 'Emergency',
    treatment: 'Treatment',
    prevention: 'Prevention',
    consultation: 'Consultation',
    healthCheck: 'Health Check',
    animalCare: 'Animal Care',
    farmingTips: 'Farming Tips',
    diseaseAlert: 'Disease Alert',
    vaccineSchedule: 'Vaccine Schedule',
    feedingGuide: 'Feeding Guide',
    breedingTips: 'Breeding Tips',
    weatherAlert: 'Weather Alert',
    marketPrices: 'Market Prices'
  },
  'luo': {
    welcome: 'Warore e Vetix AI',
    symptoms: 'Ranyisi mag le',
    diagnosis: 'Nonro mar ngima',
    emergency: 'Chandruok matek',
    treatment: 'Thieth',
    prevention: 'Gengʼo',
    consultation: 'Ngʼado rieko',
    healthCheck: 'Nono ngima',
    animalCare: 'Rito le',
    farmingTips: 'Puonj mar pur',
    diseaseAlert: 'Siem mar tuo',
    vaccineSchedule: 'Kwan mar thieth',
    feedingGuide: 'Puonj mar chiemo',
    breedingTips: 'Puonj mar nyuol',
    weatherAlert: 'Siem mar koth',
    marketPrices: 'Nengo mag ohala'
  },
  'kik': {
    welcome: 'Wĩra Vetix AI-inĩ',
    symptoms: 'Imenyithia cia nyamũ',
    diagnosis: 'Gũtuĩria ũgima',
    emergency: 'Hĩndĩ ya itua',
    treatment: 'Gũhonia',
    prevention: 'Gĩthirĩko',
    consultation: 'Ũtaarania',
    healthCheck: 'Gũthima ũgima',
    animalCare: 'Kũmenyerera nyamũ',
    farmingTips: 'Mataaro ma ũrĩmi',
    diseaseAlert: 'Gĩtaarĩko gĩa mũrimũ',
    vaccineSchedule: 'Mũtharaba wa ndawa',
    feedingGuide: 'Mũtongoria wa kũheana irio',
    breedingTips: 'Mataaro ma gũciarithia',
    weatherAlert: 'Gĩtaarĩko gĩa rũhuho',
    marketPrices: 'Thoguo cia ndũrĩrĩ'
  }
};

// Language context
interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (lang: string) => void;
  translate: (key: string) => string;
  getAnimalTerm: (animal: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Auto-detect from browser or default to Swahili Kenya
    const browserLang = navigator.language;
    if (browserLang.startsWith('sw')) return 'sw-KE';
    if (browserLang === 'en-KE' || browserLang === 'en-TZ') return 'en-KE';
    return 'sw-KE';
  });

  const setLanguage = (lang: string) => {
    setCurrentLanguage(lang);
    localStorage.setItem('vetix-language', lang);
  };

  const translate = (key: string): string => {
    const langTranslations = TRANSLATIONS[currentLanguage as keyof typeof TRANSLATIONS];
    if (langTranslations && key in langTranslations) {
      return langTranslations[key as keyof typeof langTranslations] as string;
    }
    // Fallback to English
    const enTranslations = TRANSLATIONS['en-KE'];
    if (key in enTranslations) {
      return enTranslations[key as keyof typeof enTranslations] as string;
    }
    // Return key if translation not found
    return key;
  };

  const getAnimalTerm = (animal: string): string => {
    const langInfo = SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES];
    if (langInfo && animal in langInfo.animalTerms) {
      return langInfo.animalTerms[animal as keyof typeof langInfo.animalTerms];
    }
    // Fallback to English
    const enInfo = SUPPORTED_LANGUAGES['en-KE'];
    if (animal in enInfo.animalTerms) {
      return enInfo.animalTerms[animal as keyof typeof enInfo.animalTerms];
    }
    return animal;
  };

  const isRTL = false; // None of our supported languages are RTL

  useEffect(() => {
    const saved = localStorage.getItem('vetix-language');
    if (saved && SUPPORTED_LANGUAGES[saved as keyof typeof SUPPORTED_LANGUAGES]) {
      setCurrentLanguage(saved);
    }
  }, []);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguage,
      translate,
      getAnimalTerm,
      isRTL
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

interface LocalLanguageSupportProps {
  onLanguageChange?: (language: string) => void;
  showVoiceDemo?: boolean;
}

export const LocalLanguageSupport = ({ onLanguageChange, showVoiceDemo = true }: LocalLanguageSupportProps) => {
  const { currentLanguage, setLanguage, translate } = useLanguage();
  const { toast } = useToast();
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    onLanguageChange?.(lang);
    
    const langInfo = SUPPORTED_LANGUAGES[lang as keyof typeof SUPPORTED_LANGUAGES];
    toast({
      title: `${langInfo.flag} ${translate('welcome')}`,
      description: `Lugha imebadilishwa kuwa ${langInfo.nativeName}`,
    });
  };

  const playVoiceDemo = async () => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: "Voice not supported",
        description: "Your browser doesn't support text-to-speech",
        variant: "destructive"
      });
      return;
    }

    setIsDemoPlaying(true);
    const langInfo = SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES];
    const demoText = `${translate('welcome')}. Napenda kusaidia katika huduma za afya za wanyama.`;
    
    const utterance = new SpeechSynthesisUtterance(demoText);
    utterance.lang = langInfo.voiceCode;
    utterance.rate = 0.8;
    utterance.pitch = 1.0;
    
    utterance.onend = () => {
      setIsDemoPlaying(false);
    };

    speechSynthesis.speak(utterance);
  };

  const currentLangInfo = SUPPORTED_LANGUAGES[currentLanguage as keyof typeof SUPPORTED_LANGUAGES];

  return (
    <Card className="p-6 bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Lugha / Language</h3>
            <Badge variant="secondary" className="text-xs">
              {currentLangInfo.flag} {currentLangInfo.region}
            </Badge>
          </div>
          
          {showVoiceDemo && (
            <Button
              variant="outline"
              size="sm"
              onClick={playVoiceDemo}
              disabled={isDemoPlaying}
              className="gap-2"
            >
              {isDemoPlaying ? <Mic className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
              Demo
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Chagua Lugha / Select Language
            </label>
            <Select value={currentLanguage} onValueChange={handleLanguageChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                      <span className="text-xs text-muted-foreground">({lang.region})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {translate('animalCare')}
            </label>
            <div className="flex flex-wrap gap-1">
              {Object.entries(currentLangInfo.animalTerms).map(([en, local]) => (
                <Badge key={en} variant="outline" className="text-xs">
                  {local}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p>🌍 {translate('welcome')} - Vetix inaweza kukusaidia kwa lugha mbalimbali</p>
          <p>🎤 Ongea kwa {currentLangInfo.nativeName} - tutaelewana vizuri</p>
          <p>🏥 Terminology ya matibabu imeboreshwa kwa mazingira yako</p>
        </div>
      </div>
    </Card>
  );
};