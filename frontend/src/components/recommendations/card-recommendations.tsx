import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, TrendingUp, ExternalLink, Shield } from "lucide-react";

interface CardRecommendation {
  id: string;
  name: string;
  issuer: string;
  category: string;
  welcomeBonus: string;
  annualFee: number;
  estimatedValue: number;
  keyBenefits: string[];
  matchReason: string;
  affiliateDisclosure: boolean;
}

const recommendations: CardRecommendation[] = [
  {
    id: "1",
    name: "Chase Ink Business Cash",
    issuer: "Chase",
    category: "Business",
    welcomeBonus: "75,000 points after $7,500 spend",
    annualFee: 0,
    estimatedValue: 1850,
    keyBenefits: [
      "5% on office supplies and internet",
      "5% on gas stations",
      "No annual fee",
      "Employee cards at no cost"
    ],
    matchReason: "Perfect for your high office supply spending",
    affiliateDisclosure: true
  },
  {
    id: "2",
    name: "Capital One Venture X",
    issuer: "Capital One",
    category: "Travel",
    welcomeBonus: "75,000 miles after $4,000 spend",
    annualFee: 395,
    estimatedValue: 2100,
    keyBenefits: [
      "2x miles on everything",
      "$300 annual travel credit",
      "Priority Pass lounge access",
      "Global Entry credit"
    ],
    matchReason: "Complements your travel spending patterns",
    affiliateDisclosure: true
  },
  {
    id: "3",
    name: "Citi Double Cash",
    issuer: "Citi",
    category: "Cashback",
    welcomeBonus: "$200 after $1,500 spend",
    annualFee: 0,
    estimatedValue: 890,
    keyBenefits: [
      "2% cash back on everything",
      "No annual fee",
      "No foreign transaction fees",
      "Simple earning structure"
    ],
    matchReason: "Great backup card for non-bonus categories",
    affiliateDisclosure: true
  }
];

export function CardRecommendations() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Personalized Card Recommendations</h2>
        <p className="text-muted-foreground">
          Based on your spending patterns and current portfolio
        </p>
      </div>

      {/* Affiliate Disclosure */}
      <Card className="border-premium bg-premium/5">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-premium flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-premium mb-1">Affiliate Disclosure</h3>
              <p className="text-sm text-muted-foreground">
                PerkAsm may earn a commission when you apply for recommended cards. 
                This doesn't affect our recommendations, which are based solely on your spending data and optimization potential.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="shadow-card hover:shadow-premium transition-all duration-300">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{rec.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{rec.issuer}</p>
                </div>
                <Badge variant="secondary">{rec.category}</Badge>
              </div>
              <div className="bg-gradient-success text-success-foreground p-3 rounded-lg mt-3">
                <p className="font-medium text-sm">{rec.welcomeBonus}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Value Proposition */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Annual Value</p>
                  <p className="text-2xl font-bold text-success">${rec.estimatedValue}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Annual Fee</p>
                  <p className="text-lg font-semibold">
                    {rec.annualFee === 0 ? "Free" : `$${rec.annualFee}`}
                  </p>
                </div>
              </div>

              {/* Match Reason */}
              <div className="bg-primary/10 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Why This Card?</span>
                </div>
                <p className="text-sm text-muted-foreground">{rec.matchReason}</p>
              </div>

              {/* Key Benefits */}
              <div>
                <h4 className="font-medium text-sm mb-2">Key Benefits</h4>
                <ul className="space-y-1">
                  {rec.keyBenefits.map((benefit, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Star className="h-3 w-3 text-premium" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <Button className="w-full bg-gradient-primary hover:opacity-90">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Apply Now
                </Button>
                <Button variant="outline" className="w-full">
                  Compare Details
                </Button>
              </div>

              {/* Affiliate Badge */}
              {rec.affiliateDisclosure && (
                <div className="text-center">
                  <Badge variant="outline" className="text-xs">
                    Affiliate Partner
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparison Tool */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Card Comparison Tool</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <h3 className="text-lg font-medium mb-2">Compare Cards Side-by-Side</h3>
            <p className="text-muted-foreground mb-4">
              Select multiple cards to see detailed comparisons of benefits, fees, and earning potential
            </p>
            <Button variant="outline">
              Open Comparison Tool
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
