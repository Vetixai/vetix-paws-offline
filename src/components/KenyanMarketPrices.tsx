import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useLanguage } from "./LocalLanguageSupport";

interface MarketPrice {
  animal: string;
  region: string;
  price: number;
  unit: string;
  trend: "up" | "down" | "stable";
  lastUpdated: string;
}

export const KenyanMarketPrices = () => {
  const { translate, currentLanguage } = useLanguage();
  const [prices, setPrices] = useState<MarketPrice[]>([
    {
      animal: "Dairy Cow",
      region: "Nairobi",
      price: 85000,
      unit: "per animal",
      trend: "up",
      lastUpdated: "Today"
    },
    {
      animal: "Goat",
      region: "Kiambu",
      price: 8500,
      unit: "per animal",
      trend: "stable",
      lastUpdated: "2 days ago"
    },
    {
      animal: "Chicken (Broiler)",
      region: "Nakuru",
      price: 650,
      unit: "per animal",
      trend: "down",
      lastUpdated: "Today"
    },
    {
      animal: "Sheep",
      region: "Kajiado",
      price: 12000,
      unit: "per animal",
      trend: "up",
      lastUpdated: "1 day ago"
    }
  ]);

  const getTrendIcon = (trend: string) => {
    if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
    if (trend === "down") return <TrendingDown className="w-4 h-4 text-destructive" />;
    return <div className="w-4 h-4 bg-muted rounded-full" />;
  };

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          {currentLanguage === 'sw-KE' ? 'Bei za Soko Kenya' : 'Kenyan Market Prices'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {prices.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{item.animal}</p>
                  {getTrendIcon(item.trend)}
                </div>
                <p className="text-sm text-muted-foreground">{item.region}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary">KSh {item.price.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">{item.unit}</p>
                <p className="text-xs text-muted-foreground">{item.lastUpdated}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          {currentLanguage === 'sw-KE' 
            ? 'Bei zinaweza kutofautiana kulingana na ubora na eneo' 
            : 'Prices may vary based on quality and exact location'}
        </p>
      </CardContent>
    </Card>
  );
};
