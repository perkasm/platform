export interface Card {
  id: string;
  name: string;
  last4: string;
  network: "Visa" | "Mastercard" | "Amex" | "Discover";
  primaryCategory: string;
  primaryReward: string;
  balance: number;
  monthlyEarned: number;
  annualFee: number;
  nextFeeDate: string | null;
  color: string;
  categories: { name: string; multiplier: number }[];
  perks: string[];
  chosenCategory?: string;
}

export const mockCards: Card[] = [
  {
    id: "1",
    name: "Chase Sapphire Preferred",
    last4: "4832",
    network: "Visa",
    primaryCategory: "3x Dining",
    primaryReward: "Chase UR",
    balance: 48250,
    monthlyEarned: 3200,
    annualFee: 95,
    nextFeeDate: "2025-09-15",
    color: "#1a3a6b",
    categories: [
      { name: "Dining", multiplier: 3 },
      { name: "Travel", multiplier: 2 },
      { name: "Streaming", multiplier: 3 },
      { name: "Everything Else", multiplier: 1 },
    ],
    perks: [
      "$50 annual hotel credit",
      "Travel & purchase insurance",
      "No foreign transaction fees",
      "1:1 point transfers to 14 partners",
      "Primary car rental insurance",
    ],
  },
  {
    id: "2",
    name: "Amex Gold Card",
    last4: "7291",
    network: "Amex",
    primaryCategory: "4x Dining",
    primaryReward: "Amex MR",
    balance: 62100,
    monthlyEarned: 4800,
    annualFee: 250,
    nextFeeDate: "2025-11-22",
    color: "#b08840",
    categories: [
      { name: "Dining", multiplier: 4 },
      { name: "U.S. Supermarkets", multiplier: 4 },
      { name: "Flights", multiplier: 3 },
      { name: "Everything Else", multiplier: 1 },
    ],
    perks: [
      "$120 dining credit ($10/month)",
      "$120 Uber Cash ($10/month)",
      "No preset spending limit",
      "Transfer to 20+ airline/hotel partners",
    ],
  },
  {
    id: "3",
    name: "Citi Double Cash",
    last4: "5617",
    network: "Mastercard",
    primaryCategory: "2% Cash Back",
    primaryReward: "Cash Back",
    balance: 0,
    monthlyEarned: 85,
    annualFee: 0,
    nextFeeDate: null,
    color: "#003b70",
    categories: [{ name: "Everything", multiplier: 2 }],
    perks: [
      "1% when you buy + 1% when you pay",
      "No annual fee",
      "0% intro APR for 18 months",
    ],
  },
];

export type TransactionCategory =
  | "dining"
  | "travel"
  | "groceries"
  | "gas"
  | "shopping"
  | "streaming"
  | "other";

export interface Transaction {
  id: string;
  merchant: string;
  category: TransactionCategory;
  amount: number;
  pointsEarned: number;
  cardId: string;
  cardName: string;
  date: string;
  isOptimal: boolean;
}

export const mockTransactions: Transaction[] = [
  { id: "t1", merchant: "Nobu Restaurant", category: "dining", amount: 187.50, pointsEarned: 562, cardId: "2", cardName: "Amex Gold", date: "2025-03-10", isOptimal: true },
  { id: "t2", merchant: "Delta Air Lines", category: "travel", amount: 423.00, pointsEarned: 846, cardId: "1", cardName: "Chase Sapphire", date: "2025-03-09", isOptimal: true },
  { id: "t3", merchant: "Whole Foods", category: "groceries", amount: 94.20, pointsEarned: 376, cardId: "2", cardName: "Amex Gold", date: "2025-03-08", isOptimal: true },
  { id: "t4", merchant: "Starbucks", category: "dining", amount: 12.80, pointsEarned: 12, cardId: "3", cardName: "Citi Double Cash", date: "2025-03-07", isOptimal: false },
  { id: "t5", merchant: "Shell Gas Station", category: "gas", amount: 68.40, pointsEarned: 68, cardId: "3", cardName: "Citi Double Cash", date: "2025-03-07", isOptimal: true },
  { id: "t6", merchant: "Amazon", category: "shopping", amount: 156.99, pointsEarned: 156, cardId: "3", cardName: "Citi Double Cash", date: "2025-03-06", isOptimal: true },
  { id: "t7", merchant: "Netflix", category: "streaming", amount: 22.99, pointsEarned: 68, cardId: "1", cardName: "Chase Sapphire", date: "2025-03-05", isOptimal: true },
  { id: "t8", merchant: "Sushi Nakazawa", category: "dining", amount: 220.00, pointsEarned: 220, cardId: "3", cardName: "Citi Double Cash", date: "2025-03-05", isOptimal: false },
  { id: "t9", merchant: "Marriott Hotels", category: "travel", amount: 389.00, pointsEarned: 778, cardId: "1", cardName: "Chase Sapphire", date: "2025-03-03", isOptimal: true },
  { id: "t10", merchant: "Trader Joe's", category: "groceries", amount: 67.45, pointsEarned: 269, cardId: "2", cardName: "Amex Gold", date: "2025-03-02", isOptimal: true },
  { id: "t11", merchant: "United Airlines", category: "travel", amount: 654.00, pointsEarned: 1308, cardId: "1", cardName: "Chase Sapphire", date: "2025-03-01", isOptimal: true },
  { id: "t12", merchant: "Chipotle", category: "dining", amount: 18.75, pointsEarned: 18, cardId: "3", cardName: "Citi Double Cash", date: "2025-02-28", isOptimal: false },
];

export interface LoyaltyProgram {
  id: string;
  name: string;
  shortName: string;
  balance: number;
  cpp: number;
  dollarValue: number;
  color: string;
}

export const mockLoyaltyPrograms: LoyaltyProgram[] = [];

export interface Insight {
  id: string;
  icon: string;
  title: string;
  shortSummary: string;
  description: string;
  actionLabel: string;
  type: "warning" | "opportunity" | "tip";
}

export const mockInsights: Insight[] = [
  {
    id: "i1",
    icon: "⚡",
    title: "Chase Sapphire Bonus Almost Complete",
    shortSummary: "You're $800 away from your Chase Sapphire welcome bonus",
    description: "You've spent $3,200 of your $4,000 minimum spend requirement. With your current spending rate, you'll earn the 60,000 bonus points (worth ~$1,200) in about 3 weeks. Consider prepaying any upcoming bills to accelerate.",
    actionLabel: "View Spending Progress",
    type: "opportunity",
  },
  {
    id: "i2",
    icon: "🏨",
    title: "Hyatt Points Expiring Soon",
    shortSummary: "Hyatt points expiring in 60 days — take action now",
    description: "Your 28,500 Hyatt points are set to expire in 60 days. A small qualifying activity will reset the clock. Consider booking a Cat 1-4 property for 5,000–15,000 points to use some and extend the rest.",
    actionLabel: "Find Hyatt Hotels",
    type: "warning",
  },
  {
    id: "i3",
    icon: "✈️",
    title: "Optimal Time to Book Tokyo",
    shortSummary: "Best time to book Tokyo with your points this fall",
    description: "ANA has released saver award space to Tokyo (NRT) for Oct–Nov. You can book round-trip business class for 75,000 Virgin Atlantic points, transferable from your Amex MR. This saves ~$4,200 vs. cash pricing.",
    actionLabel: "Explore This Route",
    type: "tip",
  },
  {
    id: "i4",
    icon: "💳",
    title: "Suboptimal Card Usage Detected",
    shortSummary: "Using wrong card for dining — losing ~$48/month",
    description: "3 of your last 5 dining transactions used Citi Double Cash (2% back) instead of Amex Gold (4x ≈ 8% back at 2cpp). Switching to Amex Gold for all dining would earn ~$48/month more.",
    actionLabel: "Set Up Reminders",
    type: "warning",
  },
];

export const mockPortfolioStats = {
  totalValue: 4821,
  totalPoints: 297550,
  cardsActive: 3,
  monthlyEarn: 420,
};

export const mockChartData = [
  { month: "Oct", points: 18200 },
  { month: "Nov", points: 24100 },
  { month: "Dec", points: 31500 },
  { month: "Jan", points: 22800 },
  { month: "Feb", points: 28900 },
  { month: "Mar", points: 35400 },
];
