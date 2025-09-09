import { type User, type InsertUser, type CVProfile, type InsertCVProfile, type InsertChatMessage, type ChatMessage } from "@shared/schema";
import { randomUUID } from "crypto";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { CVParserService } from "./services/cv-parser";

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
  private cvParserService: CVParserService;

  constructor() {
    this.users = new Map();
    this.cvProfiles = new Map();
    this.chatMessages = new Map();
    this.cvParserService = new CVParserService();
    
    // Initialize with CV data from file or default profile
    this.initializeProfileFromFile();
  }

  private initializeProfileFromFile() {
    try {
      const cvFilePath = join(process.cwd(), 'data', 'mycv.md');
      const personImagePath = join(process.cwd(), 'data', 'person.png');
      
      let profileData: Partial<CVProfile> = {};
      
      // Try to load and parse CV data from markdown file
      if (existsSync(cvFilePath)) {
        const markdownContent = readFileSync(cvFilePath, 'utf-8');
        profileData = this.cvParserService.parseMarkdown(markdownContent);
        console.log('✅ Successfully loaded CV data from data/mycv.md');
      } else {
        console.log('⚠️ CV file not found at data/mycv.md, using default profile data');
      }
      
      // Set profile image path
      let profileImage = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150";
      if (existsSync(personImagePath)) {
        profileImage = "/api/image/person.png";
        console.log('✅ Profile image found at data/person.png');
      } else {
        console.log('⚠️ Profile image not found at data/person.png, using default image');
      }
      
      // Create the default profile with parsed data or fallback values
      const defaultProfile: CVProfile = {
        id: "default-profile",
        name: profileData.name || "Professional",
        title: profileData.title || "Software Professional", 
        location: profileData.location || "",
        bio: profileData.bio || "Professional with experience in software development and technology.",
        profileImage,
        experience: profileData.experience || [
          {
            title: "Software Engineer",
            company: "Tech Company",
            period: "2020-Present",
            description: "Developing software solutions and working with modern technologies."
          }
        ],
        skills: profileData.skills || ["JavaScript", "React", "Node.js", "TypeScript"],
        certificates: profileData.certificates || [],
        languages: profileData.languages || [
          { name: "English", level: "Native", context: "Native speaker" }
        ],
        memberships: profileData.memberships || [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      this.cvProfiles.set(defaultProfile.id, defaultProfile);
      console.log('✅ CV profile initialized successfully');
      
    } catch (error) {
      console.error('❌ Error initializing CV profile from file:', error);
      // Fallback to minimal default profile
      this.initializeFallbackProfile();
    }
  }
  
  private initializeFallbackProfile() {
    const fallbackProfile: CVProfile = {
      id: "default-profile",
      name: "Professional",
      title: "Software Professional",
      location: "",
      bio: "Professional profile",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=150&h=150",
      experience: [],
      skills: [],
      certificates: [],
      languages: [],
      memberships: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.cvProfiles.set(fallbackProfile.id, fallbackProfile);
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
