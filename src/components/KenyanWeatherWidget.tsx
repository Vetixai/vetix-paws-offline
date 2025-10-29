import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cloud, CloudRain, Sun, Wind, Droplets } from "lucide-react";
import { useLanguage } from "./LocalLanguageSupport";

interface WeatherData {
  region: string;
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy";
  humidity: number;
  rainfall: number;
  advisory: string;
}

export const KenyanWeatherWidget = () => {
  const { currentLanguage } = useLanguage();
  const [weather, setWeather] = useState<WeatherData>({
    region: "Central Kenya",
    temperature: 22,
    condition: "sunny",
    humidity: 65,
    rainfall: 0,
    advisory: "Good grazing conditions. Ensure animals have shade and water."
  });

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "sunny":
        return <Sun className="w-12 h-12 text-warning" />;
      case "rainy":
        return <CloudRain className="w-12 h-12 text-primary" />;
      default:
        return <Cloud className="w-12 h-12 text-muted-foreground" />;
    }
  };

  const getAdvisory = () => {
    if (currentLanguage === 'sw-KE') {
      if (weather.condition === "rainy") return "Hali nzuri kwa mifugo. Hakikisha maji safi yapatikana.";
      if (weather.temperature > 30) return "Joto kali. Hakikisha wanyama wana kivuli na maji mengi.";
      return "Hali nzuri ya kilimo na ufugaji. Endelea kutunza wanyama vizuri.";
    }
    return weather.advisory;
  };

  return (
    <Card className="border-border bg-gradient-to-br from-primary/5 to-secondary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5 text-primary" />
          {currentLanguage === 'sw-KE' ? 'Hali ya Hewa - Kenya' : 'Kenya Weather'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">{weather.region}</p>
            <p className="text-4xl font-bold text-foreground">{weather.temperature}°C</p>
            <p className="text-sm text-muted-foreground capitalize">{weather.condition}</p>
          </div>
          <div>
            {getWeatherIcon()}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
            <Droplets className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">
                {currentLanguage === 'sw-KE' ? 'Unyevu' : 'Humidity'}
              </p>
              <p className="font-semibold text-foreground">{weather.humidity}%</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 bg-background rounded-lg">
            <CloudRain className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">
                {currentLanguage === 'sw-KE' ? 'Mvua' : 'Rainfall'}
              </p>
              <p className="font-semibold text-foreground">{weather.rainfall}mm</p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
          <p className="text-xs font-semibold text-primary mb-1">
            {currentLanguage === 'sw-KE' ? 'Ushauri wa Kilimo' : 'Farming Advisory'}
          </p>
          <p className="text-sm text-foreground">{getAdvisory()}</p>
        </div>
      </CardContent>
    </Card>
  );
};
