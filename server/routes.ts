import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertChatMessageSchema } from "@shared/schema";
import { CrewAIService } from "./services/crewai-service";
import { CVParserService } from "./services/cv-parser";

export async function registerRoutes(app: Express): Promise<Server> {
  const crewAIService = new CrewAIService();
  const cvParserService = new CVParserService();

  // Get CV profile
  app.get("/api/cv-profile", async (req, res) => {
    try {
      const profile = await storage.getCVProfile();
      if (!profile) {
        return res.status(404).json({ message: "CV profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to get CV profile" });
    }
  });

  // Get CV sections configuration
  app.get("/api/cv-sections", async (req, res) => {
    try {
      const sections = [
        {
          id: "bio",
          name: "Biography",
          icon: "fas fa-user",
          description: "Personal overview",
          colorClass: "bg-primary/10 text-primary"
        },
        {
          id: "experience",
          name: "Experience",
          icon: "fas fa-briefcase",
          description: "Work history",
          colorClass: "bg-accent/50 text-foreground"
        },
        {
          id: "skills",
          name: "Skills",
          icon: "fas fa-code",
          description: "Technical abilities",
          colorClass: "bg-green-100 text-green-600"
        },
        {
          id: "certificates",
          name: "Certificates",
          icon: "fas fa-certificate",
          description: "Certifications",
          colorClass: "bg-yellow-100 text-yellow-600"
        },
        {
          id: "languages",
          name: "Languages",
          icon: "fas fa-globe",
          description: "Language skills",
          colorClass: "bg-purple-100 text-purple-600"
        },
        {
          id: "memberships",
          name: "Memberships",
          icon: "fas fa-users",
          description: "Organizations",
          colorClass: "bg-blue-100 text-blue-600"
        }
      ];
      res.json(sections);
    } catch (error) {
      res.status(500).json({ message: "Failed to get CV sections" });
    }
  });

  // Chat with AI about CV
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, section } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Message is required" });
      }

      // Get CV profile
      const profile = await storage.getCVProfile();
      if (!profile) {
        return res.status(404).json({ message: "CV profile not found" });
      }

      // Generate AI response using CrewAI
      const response = await crewAIService.generateResponse(message, profile, section);

      // Store the chat message
      await storage.createChatMessage({
        profileId: profile.id,
        message,
        response,
        section: section || null
      });

      res.json({ response });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Get chat history
  app.get("/api/chat/history/:profileId", async (req, res) => {
    try {
      const { profileId } = req.params;
      const messages = await storage.getChatMessages(profileId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get chat history" });
    }
  });

  // Parse and update CV from markdown
  app.post("/api/cv/parse", async (req, res) => {
    try {
      const { markdownContent } = req.body;
      
      if (!markdownContent) {
        return res.status(400).json({ message: "Markdown content is required" });
      }

      const parsedCV = cvParserService.parseMarkdown(markdownContent);
      
      // Update the default profile with parsed data
      const updatedProfile = await storage.updateCVProfile("default-profile", parsedCV);
      
      if (!updatedProfile) {
        return res.status(404).json({ message: "Failed to update CV profile" });
      }

      res.json(updatedProfile);
    } catch (error) {
      console.error("CV parsing error:", error);
      res.status(500).json({ message: "Failed to parse CV content" });
    }
  });

  // Generate quick suggestions based on section
  app.get("/api/suggestions/:section", async (req, res) => {
    try {
      const { section } = req.params;
      const profile = await storage.getCVProfile();
      
      if (!profile) {
        return res.status(404).json({ message: "CV profile not found" });
      }

      const suggestions = crewAIService.generateSuggestions(section, profile);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate suggestions" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
