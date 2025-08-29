import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Calendar, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export function ROIMetrics() {
  return (
    <div className="space-y-4">
      {/* Primary ROI Card */}
      <Card className="shadow-card bg-gradient-success text-success-foreground">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-success-foreground">
            <TrendingUp className="h-5 w-5" />
            <span>Annual ROI</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="text-3xl font-bold">$4,847</div>
              <p className="text-sm opacity-90">+18.2% vs last year</p>
            </div>
            <div className="flex justify-between text-sm opacity-80">
              <span>Annual fees paid: $895</span>
              <span>Value gained: $5,742</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly & Yearly Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>This Month</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">$412</div>
            <p className="text-xs text-success">+$67 vs last month</p>
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Points earned:</span>
                <span className="font-medium">23,450</span>
              </div>
              <div className="flex justify-between">
                <span>Value rate:</span>
                <span className="font-medium">1.76¢/pt</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Target className="h-4 w-4 text-premium" />
              <span>Year Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-premium">$4,847</div>
            <p className="text-xs text-success">87% of $5,500 goal</p>
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Total points:</span>
                <span className="font-medium">287,340</span>
              </div>
              <div className="flex justify-between">
                <span>Avg value rate:</span>
                <span className="font-medium">1.69¢/pt</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="shadow-card">
        <CardContent className="pt-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-foreground">7</div>
              <div className="text-xs text-muted-foreground">Active Cards</div>
            </div>
            <div>
              <div className="text-lg font-bold text-success">94%</div>
              <div className="text-xs text-muted-foreground">Utilization</div>
            </div>
            <div>
              <div className="text-lg font-bold text-premium">A+</div>
              <div className="text-xs text-muted-foreground">Opt Score</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
