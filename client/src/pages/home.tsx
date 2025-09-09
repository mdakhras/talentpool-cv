import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/app-header";
import CVSectionCards from "@/components/cv-section-cards";
import ChatInterface from "@/components/chat-interface";

export default function Home() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["/api/cv-profile"],
  });

  const { data: sections, isLoading: sectionsLoading } = useQuery({
    queryKey: ["/api/cv-sections"],
  });

  if (profileLoading || sectionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading CV Assistant...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" data-testid="home-page">
      <AppHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <CVSectionCards
              profile={profile}
              sections={sections || []}
              selectedSection={selectedSection}
              onSectionSelect={setSelectedSection}
            />
          </div>
          <div className="lg:col-span-3">
            <ChatInterface
              profile={profile}
              selectedSection={selectedSection}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
