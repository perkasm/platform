/**
 * TypeScript Types for Credit Cards
 * 
 * Shared types used across the application for credit card data.
 */

export interface WelcomeBonusProgress {
  spent: number;
  required: number;
  deadline: string | null;
  progress_percentage: number;
}

export interface CreditCard {
  id: number;
  user_id: number;
  name: string;
  card_type: string;
  issuer: string;
  network?: string;
  credit_limit: number;
  available_credit: number;
  current_balance: number;
  current_points: number;
  points_currency?: string;
  utilization_rate: number;
  utilization_score: number;
  last_four?: string;
  expiration_date?: string;
  annual_fee: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  welcome_bonus_progress?: WelcomeBonusProgress;
}

export interface CreditCardCreate {
  name: string;
  card_type: string;
  issuer: string;
  network?: string;
  credit_limit: number;
  annual_fee?: number;
  last_four?: string;
  expiration_date?: string;
  has_welcome_bonus?: boolean;
  welcome_bonus_required?: number;
  welcome_bonus_deadline?: string;
}

export interface CreditCardUpdate {
  name?: string;
  card_type?: string;
  issuer?: string;
  network?: string;
  credit_limit?: number;
  available_credit?: number;
  current_balance?: number;
  current_points?: number;
  annual_fee?: number;
  is_active?: boolean;
  welcome_bonus_spent?: number;
}

export interface CreditCardList {
  cards: CreditCard[];
  total: number;
}

export interface DashboardMetrics {
  total_points: number;
  total_available_credit: number;
  average_utilization: number;
  cards_count: number;
  monthly_spending: number;
  monthly_points_earned: number;
  estimated_annual_value: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  card_id?: number;
  created_at: string;
}

export interface UpcomingAction {
  title: string;
  description: string;
  amount: string;
  deadline: string;
  card_id?: number;
}

export interface DashboardResponse {
  metrics: DashboardMetrics;
  alerts: Alert[];
  upcoming_actions: UpcomingAction[];
}

export interface CardRecommendation {
  id: string;
  name: string;
  issuer: string;
  category: string;
  welcome_bonus: string;
  annual_fee: number;
  estimated_value: number;
  key_benefits: string[];
  match_reason: string;
  match_score: number;
  affiliate_disclosure: boolean;
}

export interface RecommendationsResponse {
  recommendations: CardRecommendation[];
  total: number;
  generated_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  conversation_id: string;
  tokens_used?: number;
}

export interface ChatRequest {
  message: string;
  conversation_id?: string;
  include_context?: boolean;
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
  timestamp: string;
  conversation_id: string;
  tokens_used?: number;
}
