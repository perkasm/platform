import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CreditCard, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import card images
import chaseSapphireReserve from "@/assets/cards/chase-sapphire-reserve.jpg";
import chaseInkBusiness from "@/assets/cards/chase-ink-business.jpg";
import amexGold from "@/assets/cards/amex-gold.jpg";
import chaseFreedomFlex from "@/assets/cards/chase-freedom-flex.jpg";

interface CreditCardData {
  id: string;
  name: string;
  type: string;
  image: string;
  currentPoints: number;
  availableCredit: number;
  creditLimit: number;
  utilizationScore: number;
  welcomeBonusProgress?: {
    spent: number;
    required: number;
    deadline: string;
  };
}

const mockCards: CreditCardData[] = [
  {
    id: "1",
    name: "Chase Sapphire Reserve",
    type: "Travel",
    image: chaseSapphireReserve,
    currentPoints: 87650,
    availableCredit: 18500,
    creditLimit: 25000,
    utilizationScore: 94,
    welcomeBonusProgress: {
      spent: 3200,
      required: 4000,
      deadline: "2024-05-15"
    }
  },
  {
    id: "2",
    name: "Chase Ink Business Preferred",
    type: "Business",
    image: chaseInkBusiness,
    currentPoints: 156890,
    availableCredit: 87000,
    creditLimit: 100000,
    utilizationScore: 89
  },
  {
    id: "3",
    name: "American Express Gold",
    type: "Dining",
    image: amexGold,
    currentPoints: 45670,
    availableCredit: 15600,
    creditLimit: 20000,
    utilizationScore: 78
  },
  {
    id: "4",
    name: "Chase Freedom Flex",
    type: "Cashback",
    image: chaseFreedomFlex,
    currentPoints: 12340,
    availableCredit: 4200,
    creditLimit: 8000,
    utilizationScore: 85
  }
];

export function MyCards() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Cards</h2>
          <p className="text-muted-foreground">Manage and optimize your credit card portfolio</p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <CreditCard className="h-4 w-4" />
          <span>Add Card</span>
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {mockCards.map((card) => (
          <Card key={card.id} className="shadow-card hover:shadow-premium transition-all duration-300 cursor-pointer overflow-hidden">
            {/* Card Image */}
            <div className="relative h-32 overflow-hidden">
              <img 
                src={card.image} 
                alt={card.name}
                className="w-full h-full object-cover rounded-t-lg"
              />
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                <div className="flex items-center space-x-1">
                  <TrendingUp className={`h-3 w-3 ${
                    card.utilizationScore >= 90 ? 'text-success' : 
                    card.utilizationScore >= 75 ? 'text-premium' : 'text-muted-foreground'
                  }`} />
                  <span className="text-xs font-medium">{card.utilizationScore}%</span>
                </div>
              </div>
              <div className="absolute top-2 left-2">
                <Badge variant="secondary" className="text-xs">{card.type}</Badge>
              </div>
            </div>

            <CardContent className="p-4 space-y-3">
              {/* Card Name */}
              <div>
                <h3 className="font-semibold text-sm truncate">{card.name}</h3>
              </div>

              {/* Key Metrics */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Points</span>
                  <span className="text-sm font-bold text-success">{card.currentPoints.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Available</span>
                  <span className="text-sm font-semibold">${card.availableCredit.toLocaleString()}</span>
                </div>
              </div>

              {/* Credit Utilization */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Utilization</span>
                  <span className="font-medium">
                    {Math.round(((card.creditLimit - card.availableCredit) / card.creditLimit) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={((card.creditLimit - card.availableCredit) / card.creditLimit) * 100} 
                  className="h-1.5"
                />
              </div>

              {/* Welcome Bonus Progress */}
              {card.welcomeBonusProgress && (
                <div className="bg-premium/10 p-2 rounded-md">
                  <div className="flex items-center space-x-1 mb-1">
                    <AlertTriangle className="h-3 w-3 text-premium" />
                    <span className="text-xs font-medium">Welcome Bonus</span>
                  </div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">
                      ${card.welcomeBonusProgress.spent.toLocaleString()} / ${card.welcomeBonusProgress.required.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={(card.welcomeBonusProgress.spent / card.welcomeBonusProgress.required) * 100} 
                    className="h-1.5"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    ${(card.welcomeBonusProgress.required - card.welcomeBonusProgress.spent).toLocaleString()} left
                  </p>
                </div>
              )}

              {/* Action Button */}
              <Button variant="outline" size="sm" className="w-full text-xs">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

