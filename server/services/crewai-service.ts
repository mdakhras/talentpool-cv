import { CVProfile } from "@shared/schema";

export class CrewAIService {
  private apiKey: string;
  private baseUrl: string;
  private isAzure: boolean;
  private azureDeployment?: string;
  private azureApiVersion?: string;

  constructor() {
    // Check if Azure OpenAI is configured
    this.isAzure = !!(process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT);
    
    if (this.isAzure) {
      this.apiKey = process.env.AZURE_OPENAI_API_KEY!;
      this.baseUrl = process.env.AZURE_OPENAI_ENDPOINT!;
      this.azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-35-turbo";
      this.azureApiVersion = process.env.AZURE_OPENAI_API_VERSION || "2024-02-15-preview";
    } else {
      this.apiKey = process.env.CREWAI_API_KEY || process.env.OPENAI_API_KEY || "default_key";
      this.baseUrl = process.env.CREWAI_BASE_URL || "https://api.openai.com/v1";
    }
  }

  async generateResponse(message: string, profile: CVProfile, section?: string): Promise<string> {
    try {
      // Create section-specific context
      const sectionContext = this.buildSectionContext(profile, section);
      
      // Build the prompt for the AI agent
      const systemPrompt = this.buildSystemPrompt(profile, section);
      const userPrompt = `${sectionContext}\n\nUser question: ${message}`;

      // Call AI service (OpenAI or Azure OpenAI)
      const url = this.isAzure 
        ? `${this.baseUrl}/openai/deployments/${this.azureDeployment}/chat/completions?api-version=${this.azureApiVersion}`
        : `${this.baseUrl}/chat/completions`;

      const headers = this.isAzure
        ? {
            'api-key': this.apiKey,
            'Content-Type': 'application/json',
          }
        : {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          };

      const body = this.isAzure
        ? {
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 500,
            temperature: 0.7,
          }
        : {
            model: "gpt-3.5-turbo",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt }
            ],
            max_tokens: 500,
            temperature: 0.7,
          };

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || "I apologize, but I couldn't generate a response at this time.";

    } catch (error) {
      console.error("CrewAI service error:", error);
      
      // Fallback response based on section
      return this.generateFallbackResponse(message, profile, section);
    }
  }

  private buildSystemPrompt(profile: CVProfile, section?: string): string {
    const basePrompt = `You are an AI assistant specializing in presenting professional CV information. You represent ${profile.name}, a ${profile.title} based in ${profile.location}. 

Your role is to provide accurate, professional, and engaging responses about their background, experience, and qualifications. Always speak in third person when referring to ${profile.name}.

Key guidelines:
- Be professional but conversational
- Provide specific details when available
- Format responses with clear structure when appropriate
- Use bullet points or numbered lists for multiple items
- Include relevant context and achievements
- Be enthusiastic about their accomplishments`;

    if (section) {
      const sectionPrompts = {
        bio: "Focus on personal background, career overview, and professional summary.",
        experience: "Emphasize work history, responsibilities, achievements, and career progression.",
        skills: "Highlight technical abilities, proficiency levels, and practical applications.",
        certificates: "Detail certifications, their relevance, and professional value.",
        languages: "Explain language skills, proficiency levels, and how they were acquired.",
        memberships: "Describe professional affiliations and their significance."
      };
      
      return `${basePrompt}\n\nCurrent focus: ${sectionPrompts[section as keyof typeof sectionPrompts] || "General CV information"}`;
    }

    return basePrompt;
  }

  private buildSectionContext(profile: CVProfile, section?: string): string {
    if (!section) {
      return this.buildFullContext(profile);
    }

    switch (section) {
      case 'bio':
        return `Biography: ${profile.bio}`;
      
      case 'experience':
        return `Work Experience:\n${profile.experience.map(exp => 
          `• ${exp.title} at ${exp.company} (${exp.period})\n  ${exp.description}`
        ).join('\n')}`;
      
      case 'skills':
        return `Technical Skills: ${profile.skills.join(', ')}`;
      
      case 'certificates':
        return `Certifications: ${profile.certificates.join(', ')}`;
      
      case 'languages':
        return `Languages:\n${profile.languages.map(lang => 
          `• ${lang.name}: ${lang.level} - ${lang.context}`
        ).join('\n')}`;
      
      case 'memberships':
        return `Professional Memberships: ${profile.memberships.join(', ')}`;
      
      default:
        return this.buildFullContext(profile);
    }
  }

  private buildFullContext(profile: CVProfile): string {
    return `
Complete Professional Profile for ${profile.name}:

Title: ${profile.title}
Location: ${profile.location}

Biography: ${profile.bio}

Experience:
${profile.experience.map(exp => `• ${exp.title} at ${exp.company} (${exp.period}) - ${exp.description}`).join('\n')}

Skills: ${profile.skills.join(', ')}

Certifications: ${profile.certificates.join(', ')}

Languages:
${profile.languages.map(lang => `• ${lang.name}: ${lang.level} - ${lang.context}`).join('\n')}

Memberships: ${profile.memberships.join(', ')}
`;
  }

  private generateFallbackResponse(message: string, profile: CVProfile, section?: string): string {
    const messageLower = message.toLowerCase();
    
    // Simple keyword matching for fallback responses
    if (messageLower.includes('experience') || messageLower.includes('work')) {
      return `${profile.name} has extensive experience in software development. Currently working as a ${profile.title}, they have demonstrated expertise across multiple roles and technologies. Their most recent position involves ${profile.experience[0]?.description || 'leading technical initiatives'}.`;
    }
    
    if (messageLower.includes('skill') || messageLower.includes('technical')) {
      return `${profile.name} possesses a strong technical skill set including: ${profile.skills.slice(0, 5).join(', ')}${profile.skills.length > 5 ? ', and more' : ''}. These skills have been developed and refined through hands-on experience in various projects and roles.`;
    }
    
    if (messageLower.includes('language')) {
      return `${profile.name} is multilingual with the following language capabilities: ${profile.languages.map(lang => `${lang.name} (${lang.level})`).join(', ')}. ${profile.languages[0]?.context || 'These language skills enhance their ability to work in diverse, international environments.'}`; 
    }
    
    // Default response
    return `Thank you for your question about ${profile.name}. As a ${profile.title} with ${profile.experience.length}+ years of experience, they bring a wealth of knowledge in software development and technical leadership. Feel free to ask about specific aspects of their background, skills, or experience.`;
  }

  generateSuggestions(section: string, profile: CVProfile): string[] {
    const suggestions = {
      bio: [
        `What makes ${profile.name} unique as a ${profile.title}?`,
        "Tell me about their career journey",
        "What are their main professional interests?"
      ],
      experience: [
        "What are their key achievements?",
        "Tell me about their leadership experience",
        "What projects has they worked on recently?"
      ],
      skills: [
        "What are their strongest technical skills?",
        "How do they stay current with technology?",
        "What programming languages do they prefer?"
      ],
      certificates: [
        "What certifications does they have?",
        "How do these certifications benefit their work?",
        "Are they pursuing any new certifications?"
      ],
      languages: [
        "What languages does they speak?",
        "How did they learn these languages?",
        "How do language skills help in their career?"
      ],
      memberships: [
        "What professional organizations are they part of?",
        "How active are they in the tech community?",
        "What networking activities do they participate in?"
      ]
    };

    return suggestions[section as keyof typeof suggestions] || [
      "Tell me about their background",
      "What are their key strengths?",
      "What makes them a great candidate?"
    ];
  }
}
