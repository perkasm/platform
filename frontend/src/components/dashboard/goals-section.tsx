import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Target, Plane, Gift, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

export function GoalsSection() {
  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-primary" />
          <span>AI-Recommended Goals</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Trip Planning Goal */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Plane className="h-4 w-4 text-premium" />
            <h4 className="font-medium">Japan Trip 2025</h4>
            <span className="text-xs bg-premium/10 text-premium px-2 py-1 rounded-full">AI Recommended</span>
          </div>
          <Progress value={65} className="h-2" />
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox id="japan-dining" defaultChecked />
              <label htmlFor="japan-dining" className="text-sm">
                Spend $2,400 on dining (3x points) - <span className="text-success font-medium">$1,560/$2,400</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="japan-points" />
              <label htmlFor="japan-points" className="text-sm">
                Accumulate 85k points total - <span className="text-muted-foreground">55k/85k</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="japan-transfer" />
              <label htmlFor="japan-transfer" className="text-sm">
                Transfer points to ANA (1.6x value vs cash)
              </label>
            </div>
          </div>
        </div>

        {/* Spending Optimization Goals */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-success" />
            <h4 className="font-medium">Q2 Spending Targets</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox id="chase-ink-target" defaultChecked />
              <label htmlFor="chase-ink-target" className="text-sm">
                Chase Ink: $50k office supplies - <span className="text-success font-medium">$32k/$50k</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="freedom-gas" />
              <label htmlFor="freedom-gas" className="text-sm">
                Freedom Flex: Maximize 5x gas category (Q2) - <span className="text-muted-foreground">$245/$1,500</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="amex-groceries" defaultChecked />
              <label htmlFor="amex-groceries" className="text-sm">
                Amex Gold: 4x groceries optimization - <span className="text-success font-medium">On track</span>
              </label>
            </div>
          </div>
        </div>

        {/* Monthly Reward Claims */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Gift className="h-4 w-4 text-premium" />
            <h4 className="font-medium">Monthly Reward Claims</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <Checkbox id="amex-offers" />
              <label htmlFor="amex-offers" className="text-sm">
                Activate 3 new Amex Offers (Hotel.com 10x, Dell 10%, Best Buy 5%)
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="chase-dining" defaultChecked />
              <label htmlFor="chase-dining" className="text-sm">
                Claim Chase Dining 5x bonus - <span className="text-success font-medium">Activated</span>
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="quarterly-categories" />
              <label htmlFor="quarterly-categories" className="text-sm">
                Review & activate Q3 bonus categories (due July 1)
              </label>
            </div>
            <div className="flex items-center space-x-3">
              <Checkbox id="travel-credits" />
              <label htmlFor="travel-credits" className="text-sm">
                Use $150 remaining travel credits before Dec 31
              </label>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-destructive" />
            <h4 className="font-medium">Upcoming Deadlines</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded bg-destructive/5 border border-destructive/20">
              <span className="text-sm">Delta SkyMiles expiration</span>
              <span className="text-xs text-destructive font-medium">45 days</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-premium/5 border border-premium/20">
              <span className="text-sm">Chase Freedom Q2 activation</span>
              <span className="text-xs text-premium font-medium">15 days</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-success/5 border border-success/20">
              <span className="text-sm">Amex Gold welcome bonus deadline</span>
              <span className="text-xs text-success font-medium">3 months</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
