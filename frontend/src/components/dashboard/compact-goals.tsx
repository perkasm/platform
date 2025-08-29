import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Target, Plane, Gift, Calendar, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function CompactGoals() {
  return (
    <Card className="shadow-card h-fit">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>AI Goals Tracker</span>
          </div>
          <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            Auto-tracking
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trip Goal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Plane className="h-3 w-3 text-premium" />
              <span className="text-sm font-medium">Japan Trip 2025</span>
            </div>
            <span className="text-xs text-premium">65% complete</span>
          </div>
          <Progress value={65} className="h-1.5" />
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-xs">
              <CheckCircle className="h-3 w-3 text-success" />
              <span className="text-success">Dining spend: $1,560/$2,400 ✓</span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <div className="h-3 w-3 border border-muted-foreground rounded-full" />
              <span className="text-muted-foreground">Points: 55k/85k needed</span>
            </div>
          </div>
        </div>

        {/* Q2 Targets */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Target className="h-3 w-3 text-success" />
            <span className="text-sm font-medium">Q2 Spending</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Chase Ink office supplies</span>
              <span className="text-success">$32k/$50k</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Freedom 5x gas category</span>
              <span className="text-muted-foreground">$245/$1,500</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Amex 4x groceries</span>
              <span className="text-success">On track ✓</span>
            </div>
          </div>
        </div>

        {/* Monthly Tasks */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Gift className="h-3 w-3 text-premium" />
            <span className="text-sm font-medium">Monthly Tasks</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Checkbox id="amex-offers" className="h-3 w-3" />
              <label htmlFor="amex-offers" className="text-xs">Activate 3 Amex Offers</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="chase-dining" defaultChecked className="h-3 w-3" />
              <label htmlFor="chase-dining" className="text-xs text-success">Chase Dining 5x ✓</label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox id="q3-categories" className="h-3 w-3" />
              <label htmlFor="q3-categories" className="text-xs">Activate Q3 categories</label>
            </div>
          </div>
        </div>

        {/* Urgent Alerts */}
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3 text-destructive" />
            <span className="text-sm font-medium">Urgent</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between p-2 rounded bg-destructive/5 border border-destructive/20">
              <span className="text-xs">Delta Miles expire</span>
              <span className="text-xs text-destructive font-medium">45 days</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-premium/5 border border-premium/20">
              <span className="text-xs">Q2 activation due</span>
              <span className="text-xs text-premium font-medium">15 days</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
