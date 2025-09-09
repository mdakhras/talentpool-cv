import { Brain, Settings, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm" data-testid="app-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="gradient-border">
              <div className="gradient-border-content p-2">
                <Brain className="text-primary text-xl" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground" data-testid="app-title">
                PersonalCV
              </h1>
              <p className="text-sm text-muted-foreground">AI-Powered CV Assistant</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-secondary/50 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" data-testid="status-indicator"></div>
              <span className="text-sm text-foreground font-medium">CrewAI Online</span>
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground transition-colors"
              data-testid="button-settings"
            >
              <Cog className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
