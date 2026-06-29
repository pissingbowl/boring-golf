import type { Express, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { logAdminAction, getAdminLogs } from "./logging";
import { activeTrip, tripMembers, getGamesByTrip, deleteGame as mockDeleteGame } from "../mocks";

declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
    adminEmail?: string;
    adminLoginTime?: string;
  }
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.isAdmin) {
    return res.status(401).json({ error: "Unauthorized - Admin login required" });
  }
  next();
}

const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});

export function registerAdminRoutes(app: Express): void {
  
  app.post("/api/admin/login", async (req, res) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid credentials format" });
      }
      
      const { email, password } = parsed.data;
      
      if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.error("Admin credentials not configured");
        return res.status(500).json({ error: "Admin not configured" });
      }
      
      if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        logAdminAction("unknown", "login_failed", { email });
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      req.session.isAdmin = true;
      req.session.adminEmail = email;
      req.session.adminLoginTime = new Date().toISOString();
      
      logAdminAction(email, "login_success", {});
      
      res.json({ success: true, email });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
  
  app.post("/api/admin/logout", (req, res) => {
    const email = req.session?.adminEmail || "unknown";
    logAdminAction(email, "logout", {});
    
    req.session.isAdmin = false;
    req.session.adminEmail = undefined;
    req.session.adminLoginTime = undefined;
    
    res.json({ success: true });
  });
  
  app.get("/api/admin/session", (req, res) => {
    if (req.session?.isAdmin) {
      res.json({
        authenticated: true,
        email: req.session.adminEmail,
        loginTime: req.session.adminLoginTime,
      });
    } else {
      res.json({ authenticated: false });
    }
  });
  
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const mockUsers = await import("../mocks/users").then(m => m.mockUsers);
      const mockGames = await import("../mocks/tournaments").then(m => m.mockGames);
      
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const recentUsers = mockUsers.filter(u => {
        const createdAt = u.createdAt ? new Date(u.createdAt) : new Date();
        return createdAt >= sevenDaysAgo;
      });
      
      res.json({
        totalUsers: mockUsers.length,
        totalTrips: 1,
        totalGames: mockGames.length,
        recentSignups: recentUsers.length,
        recentTripsCreated: 0,
        databaseConnected: !!process.env.DATABASE_URL,
        environment: process.env.NODE_ENV || "development",
      });
      
      logAdminAction(req.session.adminEmail!, "view_stats", {});
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
  
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const mockUsers = await import("../mocks/users").then(m => m.mockUsers);
      
      const users = mockUsers.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name || "Unknown",
        phone: u.phone || null,
        signupDate: u.createdAt?.toISOString() || new Date().toISOString(),
        profileComplete: u.surveyCompleted ?? false,
      }));
      
      logAdminAction(req.session.adminEmail!, "view_users", { count: users.length });
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });
  
  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const mockUsers = await import("../mocks/users").then(m => m.mockUsers);
      const user = mockUsers.find(u => u.id === req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      logAdminAction(req.session.adminEmail!, "view_user", { userId: req.params.id });
      res.json(user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });
  
  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const mockUsers = await import("../mocks/users").then(m => m.mockUsers);
      const userIndex = mockUsers.findIndex(u => u.id === req.params.id);
      
      if (userIndex === -1) {
        return res.status(404).json({ error: "User not found" });
      }
      
      logAdminAction(req.session.adminEmail!, "update_user", { 
        userId: req.params.id,
        changes: Object.keys(req.body) 
      });
      
      res.json({ ...mockUsers[userIndex], ...req.body });
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });
  
  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      logAdminAction(req.session.adminEmail!, "delete_user", { userId: req.params.id });
      res.json({ success: true, message: "User deleted (mock)" });
    } catch (error) {
      console.error("Failed to delete user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });
  
  app.post("/api/admin/users/:id/impersonate", requireAdmin, async (req, res) => {
    try {
      const mockUsers = await import("../mocks/users").then(m => m.mockUsers);
      const user = mockUsers.find(u => u.id === req.params.id);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      logAdminAction(req.session.adminEmail!, "impersonate_user", { 
        userId: req.params.id,
        userEmail: user.email 
      });
      
      res.json({ 
        success: true, 
        message: `Impersonation session created for ${user.email}`,
        token: `impersonate-${req.params.id}-${Date.now()}`
      });
    } catch (error) {
      console.error("Failed to impersonate user:", error);
      res.status(500).json({ error: "Failed to impersonate user" });
    }
  });
  
  app.get("/api/admin/trips", requireAdmin, async (req, res) => {
    try {
      const trips = [{
        id: activeTrip.id,
        name: activeTrip.name,
        destination: activeTrip.location,
        startDate: activeTrip.startDate,
        endDate: activeTrip.endDate,
        status: activeTrip.status,
        participantCount: tripMembers.filter(m => m.tripId === activeTrip.id).length,
        createdBy: "Charlie Martin",
      }];
      
      logAdminAction(req.session.adminEmail!, "view_trips", { count: trips.length });
      res.json(trips);
    } catch (error) {
      console.error("Failed to fetch trips:", error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });
  
  app.get("/api/admin/trips/:id", requireAdmin, async (req, res) => {
    try {
      if (req.params.id !== activeTrip.id) {
        return res.status(404).json({ error: "Trip not found" });
      }
      
      const members = tripMembers.filter(m => m.tripId === activeTrip.id);
      
      logAdminAction(req.session.adminEmail!, "view_trip", { tripId: req.params.id });
      res.json({
        ...activeTrip,
        members,
      });
    } catch (error) {
      console.error("Failed to fetch trip:", error);
      res.status(500).json({ error: "Failed to fetch trip" });
    }
  });
  
  app.delete("/api/admin/trips/:id", requireAdmin, async (req, res) => {
    try {
      logAdminAction(req.session.adminEmail!, "delete_trip", { tripId: req.params.id });
      res.json({ success: true, message: "Trip deleted (mock)" });
    } catch (error) {
      console.error("Failed to delete trip:", error);
      res.status(500).json({ error: "Failed to delete trip" });
    }
  });
  
  app.post("/api/admin/trips/:id/join", requireAdmin, async (req, res) => {
    try {
      logAdminAction(req.session.adminEmail!, "join_trip", { tripId: req.params.id });
      res.json({ success: true, message: "Added to trip (mock)" });
    } catch (error) {
      console.error("Failed to join trip:", error);
      res.status(500).json({ error: "Failed to join trip" });
    }
  });
  
  app.get("/api/admin/games", requireAdmin, async (req, res) => {
    try {
      const mockGames = await import("../mocks/tournaments").then(m => m.mockGames);
      
      const games = mockGames.map(g => ({
        id: g.id,
        name: g.name,
        type: g.category,
        tripId: g.tripId,
        tripName: activeTrip.name,
        status: g.isActive ? 'active' : 'inactive',
        participantCount: g.playerIds?.length || 0,
      }));
      
      logAdminAction(req.session.adminEmail!, "view_games", { count: games.length });
      res.json(games);
    } catch (error) {
      console.error("Failed to fetch games:", error);
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });
  
  app.get("/api/admin/games/:id", requireAdmin, async (req, res) => {
    try {
      const mockGames = await import("../mocks/tournaments").then(m => m.mockGames);
      const game = mockGames.find(g => g.id === req.params.id);
      
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      
      logAdminAction(req.session.adminEmail!, "view_game", { gameId: req.params.id });
      res.json(game);
    } catch (error) {
      console.error("Failed to fetch game:", error);
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });
  
  app.delete("/api/admin/games/:id", requireAdmin, async (req, res) => {
    try {
      logAdminAction(req.session.adminEmail!, "delete_game", { gameId: req.params.id });
      mockDeleteGame(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete game:", error);
      res.status(500).json({ error: "Failed to delete game" });
    }
  });
  
  app.get("/api/admin/logs", requireAdmin, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const logs = getAdminLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Failed to fetch admin logs:", error);
      res.status(500).json({ error: "Failed to fetch logs" });
    }
  });
  
  app.post("/api/admin/trigger-job", requireAdmin, async (req, res) => {
    try {
      const { jobName } = req.body;
      logAdminAction(req.session.adminEmail!, "trigger_job", { jobName });
      res.json({ success: true, message: `Job "${jobName}" triggered (mock)` });
    } catch (error) {
      console.error("Failed to trigger job:", error);
      res.status(500).json({ error: "Failed to trigger job" });
    }
  });

  // ============================================
  // OPS-BACK CONTROL ROOM ROUTES
  // ============================================
  
  // In-memory storage for knowledge entries (mock-first approach)
  const knowledgeEntries: Array<{
    id: string;
    category: "course" | "city" | "history" | "easter_egg" | "tip" | "quote";
    title: string;
    content: string;
    relatedEntityId?: string;
    tags?: string[];
    isActive: boolean;
    createdBy?: string;
    createdAt: string;
    updatedAt: string;
  }> = [
    {
      id: "ke-001",
      category: "course",
      title: "Pinehurst No. 2 - Pro Tip",
      content: "The crowned greens at Pinehurst No. 2 require you to land the ball below the hole. Always take one less club and let it roll up.",
      relatedEntityId: "course-pinehurst-2",
      tags: ["strategy", "greens", "approach"],
      isActive: true,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ke-002",
      category: "history",
      title: "The Birth of the Stymie",
      content: "Before 1951, if your opponent's ball blocked your path to the hole on the green, you had to play around it. This rule, called the 'stymie', was eliminated to speed up play.",
      tags: ["rules", "history", "putting"],
      isActive: true,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ke-003",
      category: "easter_egg",
      title: "The Boring Bird",
      content: "If you scroll to the very bottom of the landing page and click the mascot 7 times, a secret animation plays.",
      tags: ["secret", "fun"],
      isActive: false,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ke-004",
      category: "city",
      title: "Pinehurst Village",
      content: "Founded in 1895 by James Walker Tufts as a health resort, Pinehurst has grown into the 'Home of American Golf' with 9 courses on the resort property alone.",
      relatedEntityId: "pinehurst-nc",
      tags: ["destination", "resort"],
      isActive: true,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "ke-005",
      category: "quote",
      title: "Bobby Jones on Golf",
      content: "Golf is the closest game to the game we call life. You get bad breaks from good shots; you get good breaks from bad shots - but you have to play the ball where it lies.",
      tags: ["inspiration", "legend"],
      isActive: true,
      createdBy: "admin",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const knowledgeEntrySchema = z.object({
    category: z.enum(["course", "city", "history", "easter_egg", "tip", "quote"]),
    title: z.string().min(1),
    content: z.string().min(1),
    relatedEntityId: z.string().optional(),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().optional(),
  });

  // Get all knowledge entries
  app.get("/api/admin/ops-back/entries", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      let filtered = knowledgeEntries;
      
      if (category) {
        filtered = knowledgeEntries.filter(e => e.category === category);
      }
      
      logAdminAction(req.session.adminEmail!, "ops_back_list_entries", { category: category || "all" });
      res.json(filtered);
    } catch (error) {
      console.error("Failed to fetch knowledge entries:", error);
      res.status(500).json({ error: "Failed to fetch entries" });
    }
  });

  // Create knowledge entry
  app.post("/api/admin/ops-back/entries", requireAdmin, async (req, res) => {
    try {
      const parsed = knowledgeEntrySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid entry data", details: parsed.error.errors });
      }
      
      const newEntry = {
        id: `ke-${Date.now()}`,
        ...parsed.data,
        isActive: parsed.data.isActive ?? true,
        createdBy: req.session.adminEmail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      knowledgeEntries.push(newEntry);
      logAdminAction(req.session.adminEmail!, "ops_back_create_entry", { id: newEntry.id, title: newEntry.title });
      res.json(newEntry);
    } catch (error) {
      console.error("Failed to create knowledge entry:", error);
      res.status(500).json({ error: "Failed to create entry" });
    }
  });

  // Update knowledge entry
  app.patch("/api/admin/ops-back/entries/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const index = knowledgeEntries.findIndex(e => e.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: "Entry not found" });
      }
      
      const updates = req.body;
      knowledgeEntries[index] = {
        ...knowledgeEntries[index],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      logAdminAction(req.session.adminEmail!, "ops_back_update_entry", { id, updates: Object.keys(updates) });
      res.json(knowledgeEntries[index]);
    } catch (error) {
      console.error("Failed to update knowledge entry:", error);
      res.status(500).json({ error: "Failed to update entry" });
    }
  });

  // Delete knowledge entry
  app.delete("/api/admin/ops-back/entries/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const index = knowledgeEntries.findIndex(e => e.id === id);
      
      if (index === -1) {
        return res.status(404).json({ error: "Entry not found" });
      }
      
      knowledgeEntries.splice(index, 1);
      logAdminAction(req.session.adminEmail!, "ops_back_delete_entry", { id });
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to delete knowledge entry:", error);
      res.status(500).json({ error: "Failed to delete entry" });
    }
  });

  // Get ops-back stats
  app.get("/api/admin/ops-back/stats", requireAdmin, async (req, res) => {
    try {
      const stats = {
        totalEntries: knowledgeEntries.length,
        byCategory: {
          course: knowledgeEntries.filter(e => e.category === "course").length,
          city: knowledgeEntries.filter(e => e.category === "city").length,
          history: knowledgeEntries.filter(e => e.category === "history").length,
          easter_egg: knowledgeEntries.filter(e => e.category === "easter_egg").length,
          tip: knowledgeEntries.filter(e => e.category === "tip").length,
          quote: knowledgeEntries.filter(e => e.category === "quote").length,
        },
        activeEntries: knowledgeEntries.filter(e => e.isActive).length,
        inactiveEntries: knowledgeEntries.filter(e => !e.isActive).length,
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Failed to fetch ops-back stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });
}
