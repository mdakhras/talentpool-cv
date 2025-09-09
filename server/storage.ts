import { type User, type InsertUser, type CVProfile, type InsertCVProfile, type InsertChatMessage, type ChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getCVProfile(id?: string): Promise<CVProfile | undefined>;
  createCVProfile(profile: InsertCVProfile): Promise<CVProfile>;
  updateCVProfile(id: string, profile: Partial<CVProfile>): Promise<CVProfile | undefined>;
  
  getChatMessages(profileId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private cvProfiles: Map<string, CVProfile>;
  private chatMessages: Map<string, ChatMessage>;

  constructor() {
    this.users = new Map();
    this.cvProfiles = new Map();
    this.chatMessages = new Map();
    
    // Initialize with default CV profile
    this.initializeDefaultProfile();
  }

  private initializeDefaultProfile() {
    const defaultProfile: CVProfile = {
      id: "default-profile",
      name: "John Anderson",
      title: "Senior Software Engineer",
      location: "San Francisco, CA",
      bio: "Experienced software engineer with 8+ years in full-stack development, specializing in React, Node.js, and cloud technologies. Passionate about building scalable applications and leading development teams.",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      experience: [
        {
          title: "Senior Software Engineer",
          company: "TechCorp",
          period: "2021-Present",
          description: "Led development of React-based dashboard serving 50K+ users, implementing Redux for state management and optimizing performance with React.memo and lazy loading. Reduced application load time by 40% through code splitting."
        },
        {
          title: "Full Stack Developer",
          company: "StartupXYZ",
          period: "2019-2021",
          description: "Built and maintained multiple web applications using Node.js, Express, and React. Implemented CI/CD pipelines and automated testing strategies."
        }
      ],
      skills: ["React", "Node.js", "TypeScript", "Python", "AWS", "Docker", "PostgreSQL", "Redux", "Next.js", "Tailwind CSS"],
      certificates: ["AWS Certified Developer", "React Professional Certificate", "Node.js Application Developer"],
      languages: [
        { name: "English", level: "Native", context: "Native speaker" },
        { name: "Spanish", level: "Conversational", context: "Learned through travel and practice over 5 years" },
        { name: "French", level: "Basic", context: "Self-taught using online resources" }
      ],
      memberships: ["IEEE Computer Society", "React Developer Community", "Node.js Foundation"],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.cvProfiles.set(defaultProfile.id, defaultProfile);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getCVProfile(id?: string): Promise<CVProfile | undefined> {
    if (id) {
      return this.cvProfiles.get(id);
    }
    // Return default profile if no ID provided
    return this.cvProfiles.get("default-profile");
  }

  async createCVProfile(profile: InsertCVProfile): Promise<CVProfile> {
    const id = randomUUID();
    const cvProfile: CVProfile = { 
      ...profile, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.cvProfiles.set(id, cvProfile);
    return cvProfile;
  }

  async updateCVProfile(id: string, profile: Partial<CVProfile>): Promise<CVProfile | undefined> {
    const existing = this.cvProfiles.get(id);
    if (!existing) return undefined;
    
    const updated: CVProfile = { 
      ...existing, 
      ...profile, 
      updatedAt: new Date() 
    };
    this.cvProfiles.set(id, updated);
    return updated;
  }

  async getChatMessages(profileId: string): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values())
      .filter(msg => (msg as any).profileId === profileId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const id = randomUUID();
    const chatMessage: ChatMessage = {
      id,
      message: message.message,
      response: message.response,
      timestamp: new Date().toISOString(),
      isUser: false
    };
    this.chatMessages.set(id, chatMessage);
    return chatMessage;
  }
}

export const storage = new MemStorage();
