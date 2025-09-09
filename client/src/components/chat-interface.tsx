import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Brain, User, Send, Paperclip } from "lucide-react";
import { CVProfile } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  section?: string;
}

interface ChatInterfaceProps {
  profile?: CVProfile;
  selectedSection: string | null;
}

export default function ChatInterface({ profile, selectedSection }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: suggestions } = useQuery({
    queryKey: ["/api/suggestions", selectedSection],
    enabled: !!selectedSection,
  });

  const chatMutation = useMutation({
    mutationFn: async ({ message, section }: { message: string; section?: string }) => {
      const response = await apiRequest("POST", "/api/chat", { message, section });
      return response.json();
    },
    onSuccess: (data, variables) => {
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        section: variables.section,
      };
      setMessages(prev => [...prev, aiMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to get response from AI assistant",
        variant: "destructive",
      });
    },
  });

  // Welcome message on component mount
  useEffect(() => {
    if (profile && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: "welcome",
        content: `Hello! I'm your AI CV assistant. I have access to ${profile.name}'s complete professional profile. You can ask me about their experience, skills, certifications, or any specific aspect of their background. You can also use the cards on the left to explore different sections of their CV.`,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [profile, messages.length]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || chatMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      section: selectedSection || undefined,
    };

    setMessages(prev => [...prev, userMessage]);
    
    chatMutation.mutate({ 
      message: inputValue, 
      section: selectedSection || undefined 
    });
    
    setInputValue("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hours ago`;
    return timestamp.toLocaleDateString();
  };

  const formatMessageContent = (content: string) => {
    // Simple formatting for bullet points and bold text
    return content
      .split('\n')
      .map((line, index) => {
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
          return (
            <div key={index} className="flex items-start space-x-2 mb-1">
              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
              <span>{line.trim().substring(1).trim()}</span>
            </div>
          );
        }
        if (line.trim().startsWith('**') && line.trim().endsWith('**')) {
          return (
            <p key={index} className="font-medium mb-2">
              {line.trim().slice(2, -2)}
            </p>
          );
        }
        return line.trim() ? <p key={index} className="mb-2">{line.trim()}</p> : null;
      })
      .filter(Boolean);
  };

  if (!profile) {
    return (
      <Card className="chat-container flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading chat interface...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="chat-container flex flex-col" data-testid="chat-interface">
      {/* Chat Header */}
      <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1" data-testid="chat-title">
              AI CV Assistant
            </h2>
            <p className="text-muted-foreground">
              Ask me anything about {profile.name}'s professional background
              {selectedSection && (
                <Badge variant="secondary" className="ml-2">
                  {selectedSection}
                </Badge>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-card/80 backdrop-blur-sm px-3 py-2 rounded-lg">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">CrewAI Agent</span>
          </div>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 chat-messages" data-testid="chat-messages">
        {messages.map((message) => (
          <div key={message.id} className="mb-6 message-animate">
            {message.isUser ? (
              <div className="flex items-start space-x-3 justify-end">
                <div className="flex-1 max-w-2xl">
                  <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-4 mb-2 ml-auto max-w-fit">
                    <p data-testid={`message-user-${message.id}`}>{message.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground text-right">
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="bg-secondary">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </div>
            ) : (
              <div className="flex items-start space-x-3">
                <Avatar className="w-8 h-8 bg-primary flex-shrink-0">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Brain className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-primary/10 rounded-lg rounded-tl-none p-4 mb-2">
                    <div className="text-foreground" data-testid={`message-ai-${message.id}`}>
                      {formatMessageContent(message.content)}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTimestamp(message.timestamp)}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Typing Indicator */}
        {chatMutation.isPending && (
          <div className="mb-6 typing-indicator" data-testid="typing-indicator">
            <div className="flex items-start space-x-3">
              <Avatar className="w-8 h-8 bg-primary flex-shrink-0">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Brain className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-primary/10 rounded-lg rounded-tl-none p-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-6 border-t border-border bg-secondary/20">
        <div className="space-y-4">
          {/* Quick Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2" data-testid="chat-suggestions">
              {suggestions.map((suggestion: string, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="text-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  onClick={() => handleSuggestionClick(suggestion)}
                  data-testid={`suggestion-${index}`}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          )}
          
          {/* Input Form */}
          <form onSubmit={handleSubmit} className="flex space-x-3" data-testid="chat-form">
            <div className="flex-1 relative">
              <Input
                type="text"
                placeholder={`Ask me anything about ${profile.name}'s CV...`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pr-12"
                disabled={chatMutation.isPending}
                data-testid="chat-input"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                data-testid="button-attach"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
            <Button
              type="submit"
              disabled={!inputValue.trim() || chatMutation.isPending}
              data-testid="button-send"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>Powered by CrewAI</span>
              <span>•</span>
              <span>Data from mycv.md</span>
            </div>
            <span data-testid="response-time">~2s response time</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
