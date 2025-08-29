import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROIMetrics } from "./roi-metrics";
import { CompactGoals } from "./compact-goals";
import { AlertCircle, TrendingUp, Calendar, CreditCard } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-dashboard.jpg";

export function MainDashboard() {
  return (
    <div className="space-y-6 animate-slide-up">
      {/* Top Section: ROI Metrics Left, Goals Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ROI Metrics - Left Side (2/3 width) */}
        <div className="lg:col-span-2">
          <ROIMetrics />
        </div>
        
        {/* Compact Goals - Right Side (1/3 width) */}
        <div className="lg:col-span-1">
          <CompactGoals />
        </div>
      </div>


      {/* Alerts and Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proactive Alerts */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-premium" />
              <span>Proactive Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Alert className="border-premium bg-premium/5">
              <AlertCircle className="h-4 w-4 text-premium" />
              <AlertDescription>
                <strong>Chase Ink:</strong> You're approaching the $150k quarterly limit. 
                Consider using another card for large purchases.
              </AlertDescription>
            </Alert>
            <Alert className="border-destructive bg-destructive/5">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <AlertDescription>
                <strong>Point Expiration:</strong> 15,000 Delta SkyMiles expire in 45 days. 
                Consider booking a flight soon.
              </AlertDescription>
            </Alert>
            <Alert className="border-success bg-success/5">
              <AlertCircle className="h-4 w-4 text-success" />
              <AlertDescription>
                <strong>Quarterly Bonus:</strong> Remember to activate your Q2 bonus categories 
                on your Chase Freedom card.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Benefit Utilization Calendar */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span>This Month's Actions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Activate Q2 Categories</p>
                  <p className="text-sm text-muted-foreground">Chase Freedom Flex</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-premium">Due: Apr 15</p>
                  <p className="text-xs text-muted-foreground">5% on gas stations</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Use Travel Credit</p>
                  <p className="text-sm text-muted-foreground">Chase Sapphire Reserve</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-success">$300 available</p>
                  <p className="text-xs text-muted-foreground">Expires Dec 31</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Optimal Burn Window</p>
                  <p className="text-sm text-muted-foreground">Best time to use points</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">Japan flights</p>
                  <p className="text-xs text-muted-foreground">Book by May 1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Recent Transactions */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Recent Transactions & Optimization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                merchant: "Costco Wholesale",
                amount: "$387.65",
                card: "Chase Ink Business Preferred",
                points: "1,163 points",
                optimization: "Optimal choice - 3x on office supplies",
                optimizationType: "success"
              },
              {
                merchant: "Shell Gas Station",
                amount: "$45.20",
                card: "Chase Sapphire Preferred",
                points: "90 points",
                optimization: "Could have earned 2x more with Chase Freedom (5x gas this quarter)",
                optimizationType: "warning"
              },
              {
                merchant: "Amazon.com",
                amount: "$156.99",
                card: "Amazon Prime Visa",
                points: "785 points",
                optimization: "Perfect choice - 5x on Amazon purchases",
                optimizationType: "success"
              }
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{transaction.merchant}</h4>
                    <span className="text-lg font-semibold">{transaction.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{transaction.card}</span>
                    <span className="font-medium text-success">{transaction.points}</span>
                  </div>
                  <p className={cn(
                    "text-xs mt-1",
                    transaction.optimizationType === "success" && "text-success",
                    transaction.optimizationType === "warning" && "text-premium"
                  )}>
                    {transaction.optimization}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
