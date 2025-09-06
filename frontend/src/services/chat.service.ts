import { post } from "@/services/api";

export type ChatResponse = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: string;
};

export const ChatService = {
  sendMessage: async (message: string): Promise<ChatResponse> => {
    // POST /chat -> { id, role, content, timestamp }
    return await post<ChatResponse>("/chat", { message });
  },

  // add other chat-related endpoints here
};