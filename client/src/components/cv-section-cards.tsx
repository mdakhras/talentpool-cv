import { 
  User, 
  Briefcase, 
  Code, 
  Award, 
  Globe, 
  Users, 
  Download, 
  RotateCcw,
  ChevronRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CVProfile, CVSection } from "@shared/schema";

interface CVSectionCardsProps {
  profile?: CVProfile;
  sections: CVSection[];
  selectedSection: string | null;
  onSectionSelect: (section: string | null) => void;
}

const iconMap = {
  "fas fa-user": User,
  "fas fa-briefcase": Briefcase,
  "fas fa-code": Code,
  "fas fa-certificate": Award,
  "fas fa-globe": Globe,
  "fas fa-users": Users,
};

const colorClassMap = {
  "bg-primary/10 text-primary": "bg-primary/10 text-primary group-hover:bg-primary/20",
  "bg-accent/50 text-foreground": "bg-accent/50 text-foreground group-hover:bg-accent",
  "bg-green-100 text-green-600": "bg-green-100 text-green-600 group-hover:bg-green-200",
  "bg-yellow-100 text-yellow-600": "bg-yellow-100 text-yellow-600 group-hover:bg-yellow-200",
  "bg-purple-100 text-purple-600": "bg-purple-100 text-purple-600 group-hover:bg-purple-200",
  "bg-blue-100 text-blue-600": "bg-blue-100 text-blue-600 group-hover:bg-blue-200",
};

export default function CVSectionCards({ 
  profile, 
  sections, 
  selectedSection, 
  onSectionSelect 
}: CVSectionCardsProps) {
  if (!profile) {
    return (
      <div className="sticky top-6">
        <Card className="p-6 mb-6">
          <div className="animate-pulse">
            <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-3 bg-muted rounded"></div>
          </div>
        </Card>
      </div>
    );
  }

  const getIcon = (iconClass: string) => {
    const IconComponent = iconMap[iconClass as keyof typeof iconMap] || User;
    return IconComponent;
  };

  const getColorClass = (colorClass: string) => {
    return colorClassMap[colorClass as keyof typeof colorClassMap] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="sticky top-6" data-testid="cv-section-cards">
      {/* Profile Card */}
      <Card className="p-6 mb-6" data-testid="profile-card">
        <div className="text-center">
          <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-primary/20">
            <AvatarImage 
              src={profile.profileImage} 
              alt={`${profile.name} profile photo`}
            />
            <AvatarFallback className="text-lg">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold text-foreground mb-1" data-testid="profile-name">
            {profile.name}
          </h2>
          <p className="text-sm text-muted-foreground mb-3" data-testid="profile-title">
            {profile.title}
          </p>
          {profile.location && (
            <div className="text-xs text-muted-foreground">
              <span data-testid="profile-location">{profile.location}</span>
            </div>
          )}
        </div>
      </Card>
      
      {/* CV Sections */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide px-2">
          CV Sections
        </h3>
        
        {sections.map((section) => {
          const IconComponent = getIcon(section.icon);
          const isSelected = selectedSection === section.id;
          
          return (
            <Button
              key={section.id}
              variant="ghost"
              className={`card-hover w-full h-auto p-4 text-left hover:border-primary/30 transition-all duration-200 group justify-start ${
                isSelected ? 'border-primary bg-primary/5' : ''
              }`}
              onClick={() => onSectionSelect(isSelected ? null : section.id)}
              data-testid={`section-${section.id}`}
            >
              <div className="flex items-center space-x-3 w-full">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${getColorClass(section.colorClass)}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {section.name}
                  </h4>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </Button>
          );
        })}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-border space-y-3">
        <Button 
          className="w-full"
          data-testid="button-generate-cv"
        >
          <Download className="mr-2 h-4 w-4" />
          Generate Full CV
        </Button>
        <Button 
          variant="secondary" 
          className="w-full"
          onClick={() => onSectionSelect(null)}
          data-testid="button-new-conversation"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          New Conversation
        </Button>
      </div>
    </div>
  );
}
