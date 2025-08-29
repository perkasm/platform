import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Send, Bot, User, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const predefinedPrompts = [
  "How many points do I need for a flight to Japan?",
  "What's the best way to earn points for an upcoming trip?",
  "Should I redeem my points for cash or travel value?",
  "How can I maximize points on my upcoming large purchase?",
  "Tell me about recent point devaluations",
  "Which card should I use for dining purchases?",
  "When is the best time to book with points?",
  "Help me optimize my Q2 spending strategy"
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI assistant for credit card rewards optimization. I can help you maximize your points, find the best redemption strategies, and optimize your spending across your cards. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateAIResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes("japan") && lowerMessage.includes("flight")) {
      return "For a round-trip flight to Japan, you'll typically need 60,000-80,000 points for economy or 120,000-160,000 for business class with Chase Ultimate Rewards or American Express Membership Rewards.\n\nBased on your current portfolio:\n• You have 87,650 Chase UR points - need about 15,000 more\n• Consider transferring to ANA (60k economy) or United (70k economy)\n• Best booking window: 2-3 months in advance\n• Optimal travel dates: Tuesday-Thursday departures\n\nRecommendation: Use your Chase Sapphire Reserve for the remaining spend needed, focusing on 3x categories (dining, travel).";
    }
    
    if (lowerMessage.includes("dining") || lowerMessage.includes("restaurant")) {
      return "For dining purchases, I recommend using your American Express Gold card which earns 4x points on dining worldwide.\n\nYour optimization strategy:\n• Amex Gold: 4x on dining (up to $25,000/year)\n• After hitting the cap, switch to Chase Sapphire Reserve (3x)\n• For small coffee shops that might not code as dining, use Chase Freedom Flex if dining is a bonus category\n\nCurrent status: You've earned approximately $890 in dining rewards this quarter. You're on track to maximize your Amex Gold dining bonus.";
    }
    
    return "I understand you're looking for credit card optimization advice. Based on your spending patterns and current cards, I can provide personalized recommendations.\n\nTo give you the most accurate advice, could you provide more details about:\n• Your specific spending category\n• Purchase amount range\n• Timeline for any travel plans\n• Current points balances you want to optimize\n\nI have access to your transaction history and can provide real-time optimization suggestions based on your actual spending patterns.";
  };

  const handlePredefinedPrompt = (prompt: string) => {
    handleSendMessage(prompt);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <Sparkles className="h-6 w-6 text-premium" />
          <h2 className="text-2xl font-bold">AI Optimization Assistant</h2>
        </div>
        <p className="text-muted-foreground">Get personalized strategies for maximizing your credit card rewards</p>
      </div>

      {/* Predefined Prompts */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Quick Start Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {predefinedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                className="text-left h-auto p-3 justify-start hover:bg-primary/5"
                onClick={() => handlePredefinedPrompt(prompt)}
              >
                <span className="text-sm">{prompt}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Interface */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-primary" />
            <span>Conversation</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.role === "user" ? "flex-row-reverse space-x-reverse" : ""
                  }`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === "user" 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={`flex-1 ${message.role === "user" ? "text-right" : ""}`}>
                    <div className={`inline-block max-w-[80%] p-3 rounded-lg ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="inline-block bg-muted p-3 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100"></div>
                        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Ask about your rewards strategy..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
                className="flex-1"
              />
              <Button 
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isLoading}
                className="px-3"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
