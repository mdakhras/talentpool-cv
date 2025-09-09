import { ExperienceItem, LanguageItem } from "@shared/schema";

export class CVParserService {
  parseMarkdown(content: string): Partial<{
    name: string;
    title: string;
    location: string;
    bio: string;
    experience: ExperienceItem[];
    skills: string[];
    certificates: string[];
    languages: LanguageItem[];
    memberships: string[];
  }> {
    const result: any = {};
    
    try {
      // Split content into sections
      const sections = this.splitIntoSections(content);
      
      // Parse basic information
      result.name = this.extractName(content);
      result.title = this.extractTitle(content);
      result.location = this.extractLocation(content);
      result.bio = this.extractBio(sections);
      
      // Parse structured sections
      result.experience = this.parseExperience(sections);
      result.skills = this.parseSkills(sections);
      result.certificates = this.parseCertificates(sections);
      result.languages = this.parseLanguages(sections);
      result.memberships = this.parseMemberships(sections);
      
    } catch (error) {
      console.error("Error parsing markdown:", error);
    }
    
    return result;
  }

  private splitIntoSections(content: string): Map<string, string> {
    const sections = new Map<string, string>();
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      // Check if line is a header (starts with # or ##)
      const headerMatch = line.match(/^#+\s*(.+)$/);
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          sections.set(currentSection.toLowerCase(), currentContent.join('\n').trim());
        }
        
        // Start new section
        currentSection = headerMatch[1].trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection) {
      sections.set(currentSection.toLowerCase(), currentContent.join('\n').trim());
    }
    
    return sections;
  }

  private extractName(content: string): string {
    // Look for name in various patterns
    const patterns = [
      /^#\s*([^#\n]+)/m,  // First h1 header
      /name:\s*(.+)/i,    // name: field
      /^([A-Z][a-z]+\s+[A-Z][a-z]+)/m  // First capitalized name pattern
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return "Professional";
  }

  private extractTitle(content: string): string {
    const patterns = [
      /title:\s*(.+)/i,
      /position:\s*(.+)/i,
      /role:\s*(.+)/i,
      /##\s*([^#\n]+(?:engineer|developer|manager|architect|analyst|consultant))/i
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return "Software Professional";
  }

  private extractLocation(content: string): string {
    const patterns = [
      /location:\s*(.+)/i,
      /address:\s*(.+)/i,
      /based in:\s*(.+)/i,
      /([A-Z][a-z]+,\s*[A-Z]{2})/  // City, State pattern
    ];
    
    for (const pattern of patterns) {
      const match = content.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return "";
  }

  private extractBio(sections: Map<string, string>): string {
    const bioSections = ['summary', 'bio', 'biography', 'about', 'overview', 'profile'];
    
    for (const sectionName of bioSections) {
      if (sections.has(sectionName)) {
        return sections.get(sectionName)!;
      }
    }
    
    return "";
  }

  private parseExperience(sections: Map<string, string>): ExperienceItem[] {
    const experienceContent = sections.get('experience') || sections.get('work experience') || sections.get('employment') || '';
    if (!experienceContent) return [];
    
    const experiences: ExperienceItem[] = [];
    const lines = experienceContent.split('\n');
    let currentExp: Partial<ExperienceItem> = {};
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Check for job title and company pattern
      const jobMatch = trimmed.match(/^[-*]?\s*(.+?)\s+at\s+(.+?)\s*[-–—]\s*(.+)$/);
      if (jobMatch) {
        if (currentExp.title) {
          experiences.push(currentExp as ExperienceItem);
        }
        currentExp = {
          title: jobMatch[1].trim(),
          company: jobMatch[2].trim(),
          period: jobMatch[3].trim(),
          description: ''
        };
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        // Description bullet point
        if (currentExp.description) {
          currentExp.description += ' ';
        }
        currentExp.description = (currentExp.description || '') + trimmed.substring(1).trim();
      } else if (currentExp.title && !trimmed.match(/^#+/)) {
        // Continue description
        if (currentExp.description) {
          currentExp.description += ' ';
        }
        currentExp.description = (currentExp.description || '') + trimmed;
      }
    }
    
    if (currentExp.title) {
      experiences.push(currentExp as ExperienceItem);
    }
    
    return experiences;
  }

  private parseSkills(sections: Map<string, string>): string[] {
    const skillsContent = sections.get('skills') || sections.get('technical skills') || sections.get('technologies') || '';
    if (!skillsContent) return [];
    
    const skills: string[] = [];
    const lines = skillsContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      if (trimmed.includes(',')) {
        // Comma-separated skills
        skills.push(...trimmed.split(',').map(s => s.trim()).filter(s => s));
      } else if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        // Bullet point skill
        skills.push(trimmed.substring(1).trim());
      } else if (!trimmed.match(/^#+/)) {
        // Single skill per line
        skills.push(trimmed);
      }
    }
    
    return skills.filter(skill => skill.length > 0);
  }

  private parseCertificates(sections: Map<string, string>): string[] {
    const certsContent = sections.get('certificates') || sections.get('certifications') || sections.get('credentials') || '';
    if (!certsContent) return [];
    
    const certs: string[] = [];
    const lines = certsContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.match(/^#+/)) continue;
      
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        certs.push(trimmed.substring(1).trim());
      } else {
        certs.push(trimmed);
      }
    }
    
    return certs.filter(cert => cert.length > 0);
  }

  private parseLanguages(sections: Map<string, string>): LanguageItem[] {
    const langContent = sections.get('languages') || sections.get('language skills') || '';
    if (!langContent) return [];
    
    const languages: LanguageItem[] = [];
    const lines = langContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.match(/^#+/)) continue;
      
      // Parse patterns like "English - Native" or "Spanish (Conversational)"
      const patterns = [
        /^[-*]?\s*(.+?)\s*[-–—]\s*(.+?)(?:\s*[-–—]\s*(.+))?$/,
        /^[-*]?\s*(.+?)\s*\((.+?)\)(?:\s*[-–—]\s*(.+))?$/,
        /^[-*]?\s*(.+?):\s*(.+?)(?:\s*[-–—]\s*(.+))?$/
      ];
      
      for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match) {
          languages.push({
            name: match[1].trim(),
            level: match[2].trim(),
            context: match[3]?.trim() || `${match[2]} proficiency`
          });
          break;
        }
      }
    }
    
    return languages;
  }

  private parseMemberships(sections: Map<string, string>): string[] {
    const membContent = sections.get('memberships') || sections.get('organizations') || sections.get('associations') || '';
    if (!membContent) return [];
    
    const memberships: string[] = [];
    const lines = membContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.match(/^#+/)) continue;
      
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        memberships.push(trimmed.substring(1).trim());
      } else {
        memberships.push(trimmed);
      }
    }
    
    return memberships.filter(membership => membership.length > 0);
  }
}
