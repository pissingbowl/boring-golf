import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import postgres from "postgres";
import { db } from "./db";
import { trips } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import * as services from "./services";
import { registerAuthRoutes } from "./auth";
import { registerAdminRoutes } from "./admin";
import { requireAuth } from "./middleware/auth";

import { 
  tripMembers, computeRiskSummary,
  mockItinerary, mockTasks, mockShipments,
  mockTournaments, mockTeams, mockRounds, mockScores,
  mockIssues, mockAnnouncements, mockExpenses,
  computeLeaderboard, computeExpenseSummary,
  mockBags, mockTravelItems,
  getGamesByTrip, createGame, updateGame, deleteGame,
  getLedgerEntriesByTrip, getLedgerBalances, getLedgerSummary,
  getSettlementsByTrip, createSettlement, getPaymentMethods,
  getGroupsByGame, getGroupsByTrip, updateGroup, validateGameReadiness,
  inviteMember, updateMember, removeMember, changeMemberRole,
  // Itinerary Builder
  getBuilderBlocksByTrip, createBuilderBlock, updateBuilderBlock,
  deleteBuilderBlock, reorderBuilderBlocks, moveBlockToDay
} from "./mocks";
import {
  getActiveRound, getCourseData, updatePlayerScore, advanceRound, goToHole, endRound
} from "./mocks/rounds";
import {
  mockPgaTourCards,
  mockTourScheduleCards,
  mockGolfNewsCards,
  mockHistoryCards,
  mockCourseSpotlightCards
} from "./mocks/live-feed";

const settlementSchema = z.object({
  fromMemberId: z.string().min(1, "Payer member ID is required"),
  toMemberId: z.string().min(1, "Recipient member ID is required"),
  amount: z.number().positive("Amount must be positive"),
  method: z.enum(['cash', 'venmo', 'zelle', 'card', 'other']),
  note: z.string().optional(),
  status: z.enum(['pending', 'completed']).default('completed'),
  completedAt: z.string().optional(),
});

// Mock mode: if DATABASE_URL is missing or BG_MOCK_MODE is set, use mock data
const isMockMode = !process.env.DATABASE_URL || process.env.BG_MOCK_MODE === "true";

const sqlClient = process.env.DATABASE_URL
  ? postgres(process.env.DATABASE_URL, { prepare: false })
  : null;


// In-memory storage for itinerary publish status (mock mode - no DB migration needed)
const itineraryPublishedMap: Map<string, boolean> = new Map();

// Mock trips for fallback when DB is unavailable
// Using dynamic dates so they show as "upcoming" relative to today
const getUpcomingDate = (daysFromNow: number) => {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split('T')[0];
};

const mockTripsData = [
  {
    id: "mock-trip-001",
    name: "Pinehurst Invitational",
    destination: "Pinehurst, NC",
    start_date: getUpcomingDate(10), // 10 days from now - shows countdown
    nights: 4,
    invite_code: "PINE2024",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-trip-002", 
    name: "Pebble Beach Classic",
    destination: "Pebble Beach, CA",
    start_date: getUpcomingDate(45), // 45 days from now - shows Upcoming
    nights: 3,
    invite_code: "PEBBLE2026",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-trip-003",
    name: "St. Andrews Links Trip",
    destination: "St. Andrews, Scotland", 
    start_date: "2025-07-15", // Past - shows Completed
    nights: 5,
    invite_code: "STAND2025",
    created_at: new Date().toISOString(),
  },
];

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // ============================================
  // AUTHENTICATION (Supabase Bearer Token Auth)
  // Routes use requireAuth middleware from ./middleware/auth
  // ============================================
  registerAuthRoutes(app);
  
  // ============================================
  // ADMIN ROUTES (Separate Auth)
  // ============================================
  registerAdminRoutes(app);
  
  // ============================================
  // MOCK API ROUTES
  // These return mock data for UI development
  // Will be swapped to Supabase later
  // ============================================

  // === CURRENT USER ===
  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const user = req.user;
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // === TRIPS ===

  app.get("/api/db-check", async (_req, res) => {
    try {
      const [row] = await sqlClient!`select now() as now, current_database() as db`;
      res.json(row);
    } catch (error) {
      const err = error as { message?: string; stack?: string; code?: string };
      console.error("[api/db-check] ERROR", err);
      console.error("[api/db-check] message:", err?.message);
      console.error("[api/db-check] code:", err?.code);
      console.error("[api/db-check] stack:", err?.stack);
      res.status(500).json({ error: "DB check failed" });
    }
  });
  
  // Get all trips for the current user
  app.get("/api/my-trips", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const trips = await services.getUserTrips(userId);
      res.json(trips);
    } catch (error) {
      console.error("Failed to fetch user trips:", error);
      res.status(500).json({ error: "Failed to fetch trips" });
    }
  });

  // Create a new trip (no auth)
  // Helper function to generate invite code
  function generateInviteCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  app.post("/api/trips", async (req, res) => {
    console.log("[BG] POST /api/trips payload:", req.body);
    try {
      const tripSchema = z.object({
        name: z.string().min(1, "Trip name is required"),
        destination: z.string().min(1, "Destination is required"),
        start_date: z.string().optional(),
        startDate: z.string().optional(),
        nights: z.number().int().min(1).max(14),
      });

      const parsed = tripSchema.safeParse(req.body);
      if (!parsed.success) {
        console.log("[BG] POST /api/trips validation failed:", parsed.error.errors[0].message);
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const start_date = parsed.data.start_date ?? parsed.data.startDate ?? null;
      if (!start_date) {
        console.log("[BG] POST /api/trips missing start_date");
        return res.status(400).json({ error: "Start date is required" });
      }

      const inviteCode = generateInviteCode();

      // Mock mode fallback - create trip in memory
      if (isMockMode || !sqlClient) {
        const mockTrip = {
          id: `trip-${Date.now()}`,
          name: parsed.data.name,
          destination: parsed.data.destination,
          start_date: start_date,
          nights: parsed.data.nights,
          invite_code: inviteCode,
          created_at: new Date().toISOString(),
        };
        mockTripsData.push(mockTrip);
        console.log("[BG] POST /api/trips created mock trip:", { id: mockTrip.id, invite_code: mockTrip.invite_code });
        return res.status(201).json(mockTrip);
      }

      // Calculate end_date from start_date + nights
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(endDateObj.getDate() + parsed.data.nights);
      const end_date = endDateObj.toISOString().split('T')[0];

      const [trip] = await sqlClient!`
        INSERT INTO public.trips (name, location, start_date, end_date, invite_code)
        VALUES (${parsed.data.name}, ${parsed.data.destination}, ${start_date}, ${end_date}, ${inviteCode})
        RETURNING id, name, location as destination, start_date, 
          EXTRACT(DAY FROM (end_date - start_date))::int as nights, 
          invite_code, created_at
      `;

      console.log("[BG] POST /api/trips created trip:", { id: trip.id, invite_code: trip.invite_code });
      res.status(201).json(trip);
    } catch (error) {
      const err = error as { message?: string; stack?: string; code?: string };
      console.error("[BG] POST /api/trips error:", err?.message || err);
      res.status(500).json({ error: "Failed to create trip" });
    }
  });

  // List trips (no auth) - with mock mode fallback
  app.get("/api/trips", async (_req, res) => {
    // If mock mode or no DB client, return mock data
    if (isMockMode || !sqlClient) {
      console.log("[api/trips] mock mode - returning mock trips");
      return res.json(mockTripsData);
    }

    try {
      const allTrips = await sqlClient!`
        SELECT 
          id, 
          name, 
          location as destination, 
          start_date, 
          EXTRACT(DAY FROM (end_date - start_date))::int as nights,
          invite_code,
          created_at
        FROM public.trips
        ORDER BY created_at DESC
      `;
      res.json(allTrips);
    } catch (error) {
      const err = error as { message?: string; stack?: string; code?: string };
      console.error("[api/trips] DB error, falling back to mock:", err?.message);
      // Fallback to mock data on DB error instead of 500
      res.json(mockTripsData);
    }
  });

  // Get a single trip (no auth) - with mock mode fallback
  app.get("/api/trips/:id", async (req, res) => {
    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      const mockTrip = mockTripsData.find(t => t.id === req.params.id) || mockTripsData[0];
      const itinerary_published = itineraryPublishedMap.get(req.params.id) ?? false;
      return res.json({ ...mockTrip, id: req.params.id, itinerary_published });
    }

    try {
      const [trip] = await sqlClient!`
        SELECT 
          id, 
          name, 
          location as destination, 
          start_date, 
          EXTRACT(DAY FROM (end_date - start_date))::int as nights,
          invite_code, 
          created_at
        FROM public.trips
        WHERE id = ${req.params.id}
      `;
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      // Include itinerary_published from in-memory map (defaults to false)
      const itinerary_published = itineraryPublishedMap.get(req.params.id) ?? false;
      res.json({ ...trip, itinerary_published });
    } catch (error) {
      // Fallback to mock on error
      const mockTrip = mockTripsData[0];
      const itinerary_published = itineraryPublishedMap.get(req.params.id) ?? false;
      res.json({ ...mockTrip, id: req.params.id, itinerary_published });
    }
  });

  // Update trip (including itinerary_published) - with mock mode fallback
  app.patch("/api/trips/:id", async (req, res) => {
    const { itinerary_published } = req.body;

    // Handle itinerary_published update (in-memory for now)
    if (typeof itinerary_published === "boolean") {
      itineraryPublishedMap.set(req.params.id, itinerary_published);
    }

    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      const mockTrip = mockTripsData.find(t => t.id === req.params.id) || mockTripsData[0];
      const published = itineraryPublishedMap.get(req.params.id) ?? false;
      return res.json({ ...mockTrip, id: req.params.id, itinerary_published: published });
    }

    try {
      // Fetch and return updated trip
      const [trip] = await sqlClient!`
        SELECT 
          id, 
          name, 
          location as destination, 
          start_date, 
          EXTRACT(DAY FROM (end_date - start_date))::int as nights,
          invite_code, 
          created_at
        FROM public.trips
        WHERE id = ${req.params.id}
      `;
      if (!trip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      const published = itineraryPublishedMap.get(req.params.id) ?? false;
      res.json({ ...trip, itinerary_published: published });
    } catch (error) {
      // Fallback to mock on error
      const mockTrip = mockTripsData[0];
      const published = itineraryPublishedMap.get(req.params.id) ?? false;
      res.json({ ...mockTrip, id: req.params.id, itinerary_published: published });
    }
  });

  // Delete a trip (no auth)
  app.delete("/api/trips/:id", async (req, res) => {
    try {
      const result = await sqlClient!`
        DELETE FROM public.trips
        WHERE id = ${req.params.id}
        RETURNING id
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trip" });
    }
  });

  // Update a trip (no auth) - uses location and calculates end_date from nights
  app.put("/api/trips/:id", async (req, res) => {
    try {
      const tripSchema = z.object({
        name: z.string().min(1, "Trip name is required"),
        destination: z.string().min(1, "Destination is required"),
        start_date: z.string().optional(),
        startDate: z.string().optional(),
        nights: z.number().int().min(1).max(14).nullable(),
      });

      const parsed = tripSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const start_date = parsed.data.start_date ?? parsed.data.startDate ?? null;
      if (!start_date) {
        return res.status(400).json({ error: "Start date is required" });
      }

      // Calculate end_date from start_date + nights
      const nights = parsed.data.nights ?? 3;
      const startDateObj = new Date(start_date);
      const endDateObj = new Date(startDateObj);
      endDateObj.setDate(endDateObj.getDate() + nights);
      const end_date = endDateObj.toISOString().split('T')[0];

      // Mock mode fallback
      if (isMockMode || !sqlClient) {
        const mockTrip = mockTripsData.find(t => t.id === req.params.id);
        if (mockTrip) {
          mockTrip.name = parsed.data.name;
          mockTrip.destination = parsed.data.destination;
          mockTrip.start_date = start_date;
          mockTrip.nights = nights;
        }
        return res.json({
          id: req.params.id,
          name: parsed.data.name,
          destination: parsed.data.destination,
          start_date,
          nights,
          created_at: new Date().toISOString()
        });
      }

      // Try to update in database
      try {
        const [trip] = await sqlClient!`
          UPDATE public.trips
          SET name = ${parsed.data.name},
              location = ${parsed.data.destination},
              start_date = ${start_date}::timestamp,
              end_date = ${end_date}::timestamp
          WHERE id = ${req.params.id}::uuid
          RETURNING 
            id, 
            name, 
            location as destination, 
            start_date, 
            EXTRACT(DAY FROM (end_date - start_date))::int as nights,
            created_at
        `;

        if (!trip) {
          // Trip not found in DB - might be a mock trip ID
          console.log("[BG] Trip not found in DB, checking if mock ID:", req.params.id);
          const mockTrip = mockTripsData.find(t => t.id === req.params.id);
          if (mockTrip) {
            mockTrip.name = parsed.data.name;
            mockTrip.destination = parsed.data.destination;
            mockTrip.start_date = start_date;
            mockTrip.nights = nights;
            return res.json({
              id: req.params.id,
              name: parsed.data.name,
              destination: parsed.data.destination,
              start_date,
              nights,
              created_at: new Date().toISOString()
            });
          }
          return res.status(404).json({ error: "Trip not found" });
        }

        res.json(trip);
      } catch (dbError: any) {
        // If the ID isn't a valid UUID, try mock mode
        if (dbError?.code === '22P02') { // invalid_text_representation (invalid UUID)
          console.log("[BG] Invalid UUID format, trying mock mode:", req.params.id);
          const mockTrip = mockTripsData.find(t => t.id === req.params.id);
          if (mockTrip) {
            mockTrip.name = parsed.data.name;
            mockTrip.destination = parsed.data.destination;
            mockTrip.start_date = start_date;
            mockTrip.nights = nights;
            return res.json({
              id: req.params.id,
              name: parsed.data.name,
              destination: parsed.data.destination,
              start_date,
              nights,
              created_at: new Date().toISOString()
            });
          }
        }
        throw dbError; // Re-throw to be caught by outer catch
      }
    } catch (error: any) {
      console.error("[BG] PUT /api/trips/:id error:", {
        message: error?.message,
        code: error?.code,
        detail: error?.detail,
        tripId: req.params.id,
        body: req.body,
      });
      // Return more specific error if available
      const errorMsg = error?.detail || error?.message || "Failed to update trip";
      res.status(500).json({ error: errorMsg });
    }
  });

  // === ROUNDS ===

  // In-memory mock rounds storage
  type MockRoundScore = { member_name: string; score: number | null };
  type MockRound = {
    id: string;
    trip_id: string;
    course_name: string;
    date: string;
    format: string;
    status: 'in_progress' | 'complete';
    scores: MockRoundScore[];
    notes: string | null;
    created_at: string;
  };
  const mockRoundsData: Map<string, MockRound[]> = new Map();

  // Create rounds table if it doesn't exist (with new columns)
  app.post("/api/migrate/rounds", async (req, res) => {
    try {
      await sqlClient!`
        CREATE TABLE IF NOT EXISTS public.rounds (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
          course_name TEXT NOT NULL,
          date DATE NOT NULL,
          format TEXT DEFAULT 'stroke_play',
          status TEXT DEFAULT 'in_progress',
          scores_json JSONB DEFAULT '[]'::jsonb,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      await sqlClient!`
        CREATE INDEX IF NOT EXISTS idx_rounds_trip_id ON public.rounds(trip_id)
      `;
      res.json({ success: true, message: "Rounds table created with scoring support" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create rounds table" });
    }
  });

  // Create a round for a trip (no auth)
  app.post("/api/trips/:tripId/rounds", async (req, res) => {
    const roundSchema = z.object({
      course_name: z.string().min(1, "Course name is required"),
      courseName: z.string().optional(),
      date: z.string().min(1, "Date is required"),
      format: z.enum(['stroke_play', 'stableford', 'skins']).optional(),
      scores: z.array(z.object({
        member_name: z.string(),
        score: z.number().nullable(),
      })).optional(),
      notes: z.string().optional(),
    });

    const parsed = roundSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const course_name = parsed.data.course_name ?? parsed.data.courseName ?? "";
    if (!course_name) {
      return res.status(400).json({ error: "Course name is required" });
    }

    const format = parsed.data.format || 'stroke_play';
    const scores = parsed.data.scores || [];
    const hasAllScores = scores.length > 0 && scores.every(s => s.score !== null);
    const status = hasAllScores ? 'complete' : 'in_progress';

    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      const newRound: MockRound = {
        id: `round-${Date.now()}`,
        trip_id: req.params.tripId,
        course_name,
        date: parsed.data.date,
        format,
        status,
        scores,
        notes: parsed.data.notes || null,
        created_at: new Date().toISOString(),
      };

      const tripRounds = mockRoundsData.get(req.params.tripId) || [];
      tripRounds.push(newRound);
      mockRoundsData.set(req.params.tripId, tripRounds);

      return res.status(201).json(newRound);
    }

    try {
      const [round] = await sqlClient`
        INSERT INTO public.rounds (trip_id, course_name, date, format, status, scores_json, notes)
        VALUES (${req.params.tripId}, ${course_name}, ${parsed.data.date}, ${format}, ${status}, ${JSON.stringify(scores)}::jsonb, ${parsed.data.notes ?? null})
        RETURNING id, trip_id, course_name, date, format, status, scores_json as scores, notes, created_at
      `;

      res.status(201).json(round);
    } catch (error) {
      // Fallback to mock on error
      const newRound: MockRound = {
        id: `round-${Date.now()}`,
        trip_id: req.params.tripId,
        course_name,
        date: parsed.data.date,
        format,
        status,
        scores,
        notes: parsed.data.notes || null,
        created_at: new Date().toISOString(),
      };

      const tripRounds = mockRoundsData.get(req.params.tripId) || [];
      tripRounds.push(newRound);
      mockRoundsData.set(req.params.tripId, tripRounds);

      res.status(201).json(newRound);
    }
  });

  // List rounds for a trip (no auth)
  app.get("/api/trips/:tripId/rounds", async (req, res) => {
    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      const rounds = mockRoundsData.get(req.params.tripId) || [];
      return res.json(rounds);
    }

    try {
      const rounds = await sqlClient`
        SELECT id, trip_id, course_name, date, format, status, scores_json as scores, notes, created_at
        FROM public.rounds
        WHERE trip_id = ${req.params.tripId}
        ORDER BY date ASC, created_at ASC
      `;
      res.json(rounds);
    } catch (error) {
      // Fallback to mock on error
      const rounds = mockRoundsData.get(req.params.tripId) || [];
      res.json(rounds);
    }
  });

  // Update a round's scores (no auth)
  app.patch("/api/rounds/:id", async (req, res) => {
    const updateSchema = z.object({
      scores: z.array(z.object({
        member_name: z.string(),
        score: z.number().nullable(),
      })).optional(),
      status: z.enum(['in_progress', 'complete']).optional(),
      notes: z.string().optional(),
    });

    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      for (const [tripId, rounds] of mockRoundsData.entries()) {
        const roundIdx = rounds.findIndex(r => r.id === req.params.id);
        if (roundIdx !== -1) {
          if (parsed.data.scores !== undefined) {
            rounds[roundIdx].scores = parsed.data.scores;
            // Auto-update status
            const hasAllScores = parsed.data.scores.length > 0 && parsed.data.scores.every(s => s.score !== null);
            rounds[roundIdx].status = hasAllScores ? 'complete' : 'in_progress';
          }
          if (parsed.data.status !== undefined) {
            rounds[roundIdx].status = parsed.data.status;
          }
          if (parsed.data.notes !== undefined) {
            rounds[roundIdx].notes = parsed.data.notes;
          }
          mockRoundsData.set(tripId, rounds);
          return res.json(rounds[roundIdx]);
        }
      }
      return res.status(404).json({ error: "Round not found" });
    }

    try {
      const updates: string[] = [];
      const values: any = {};
      
      if (parsed.data.scores !== undefined) {
        const hasAllScores = parsed.data.scores.length > 0 && parsed.data.scores.every(s => s.score !== null);
        const autoStatus = hasAllScores ? 'complete' : 'in_progress';
        
        const [round] = await sqlClient`
          UPDATE public.rounds
          SET scores_json = ${JSON.stringify(parsed.data.scores)}::jsonb,
              status = ${parsed.data.status || autoStatus}
          WHERE id = ${req.params.id}::uuid
          RETURNING id, trip_id, course_name, date, format, status, scores_json as scores, notes, created_at
        `;
        
        if (!round) {
          return res.status(404).json({ error: "Round not found" });
        }
        return res.json(round);
      }

      // Just status or notes update
      const [round] = await sqlClient`
        UPDATE public.rounds
        SET status = COALESCE(${parsed.data.status ?? null}, status),
            notes = COALESCE(${parsed.data.notes ?? null}, notes)
        WHERE id = ${req.params.id}::uuid
        RETURNING id, trip_id, course_name, date, format, status, scores_json as scores, notes, created_at
      `;

      if (!round) {
        return res.status(404).json({ error: "Round not found" });
      }
      res.json(round);
    } catch (error) {
      res.status(500).json({ error: "Failed to update round" });
    }
  });

  // Delete a round (no auth)
  app.delete("/api/rounds/:id", async (req, res) => {
    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      for (const [tripId, rounds] of mockRoundsData.entries()) {
        const idx = rounds.findIndex(r => r.id === req.params.id);
        if (idx !== -1) {
          rounds.splice(idx, 1);
          mockRoundsData.set(tripId, rounds);
          return res.json({ success: true });
        }
      }
      return res.status(404).json({ error: "Round not found" });
    }

    try {
      const result = await sqlClient`
        DELETE FROM public.rounds
        WHERE id = ${req.params.id}::uuid
        RETURNING id
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: "Round not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete round" });
    }
  });

  // Get trip leaderboard (aggregated scores)
  app.get("/api/trips/:tripId/leaderboard", async (req, res) => {
    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      const rounds = mockRoundsData.get(req.params.tripId) || [];
      
      // Aggregate scores by member
      const memberScores: Map<string, { total: number; roundsPlayed: number }> = new Map();
      
      for (const round of rounds) {
        for (const score of round.scores) {
          if (score.score !== null) {
            const existing = memberScores.get(score.member_name) || { total: 0, roundsPlayed: 0 };
            existing.total += score.score;
            existing.roundsPlayed += 1;
            memberScores.set(score.member_name, existing);
          }
        }
      }

      const leaderboard = Array.from(memberScores.entries())
        .map(([name, data]) => ({
          member_name: name,
          total_score: data.total,
          rounds_played: data.roundsPlayed,
          average: Math.round(data.total / data.roundsPlayed * 10) / 10,
        }))
        .sort((a, b) => a.total_score - b.total_score); // Lower is better in golf

      return res.json({
        rounds_count: rounds.length,
        leaderboard,
      });
    }

    try {
      const rounds = await sqlClient`
        SELECT scores_json as scores
        FROM public.rounds
        WHERE trip_id = ${req.params.tripId}
      `;

      // Aggregate scores by member
      const memberScores: Map<string, { total: number; roundsPlayed: number }> = new Map();
      
      for (const round of rounds) {
        const scores = round.scores || [];
        for (const score of scores) {
          if (score.score !== null) {
            const existing = memberScores.get(score.member_name) || { total: 0, roundsPlayed: 0 };
            existing.total += score.score;
            existing.roundsPlayed += 1;
            memberScores.set(score.member_name, existing);
          }
        }
      }

      const leaderboard = Array.from(memberScores.entries())
        .map(([name, data]) => ({
          member_name: name,
          total_score: data.total,
          rounds_played: data.roundsPlayed,
          average: Math.round(data.total / data.roundsPlayed * 10) / 10,
        }))
        .sort((a, b) => a.total_score - b.total_score);

      res.json({
        rounds_count: rounds.length,
        leaderboard,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate leaderboard" });
    }
  });

  // === ITINERARY BLOCKS ===

  // Create itinerary_blocks table if it doesn't exist
  app.post("/api/migrate/itinerary-blocks", async (req, res) => {
    try {
      await sqlClient!`
        CREATE TABLE IF NOT EXISTS public.itinerary_blocks (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          start_time TEXT,
          title TEXT NOT NULL,
          type TEXT NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      await sqlClient!`
        CREATE INDEX IF NOT EXISTS idx_itinerary_blocks_trip_id ON public.itinerary_blocks(trip_id)
      `;
      res.json({ success: true, message: "Itinerary blocks table created" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create itinerary blocks table" });
    }
  });

  // Add round_id column to itinerary_blocks
  app.post("/api/migrate/itinerary-blocks-round-link", async (req, res) => {
    try {
      await sqlClient!`
        ALTER TABLE public.itinerary_blocks
        ADD COLUMN IF NOT EXISTS round_id UUID REFERENCES public.rounds(id) ON DELETE SET NULL
      `;
      await sqlClient!`
        CREATE INDEX IF NOT EXISTS idx_itinerary_blocks_round_id ON public.itinerary_blocks(round_id)
      `;
      res.json({ success: true, message: "Added round_id to itinerary_blocks" });
    } catch (error) {
      res.status(500).json({ error: "Failed to add round_id column" });
    }
  });

  // Create an itinerary block for a trip (no auth)
  app.post("/api/trips/:tripId/itinerary", async (req, res) => {
    try {
      const blockSchema = z.object({
        date: z.string().min(1, "Date is required"),
        start_time: z.string().optional(),
        startTime: z.string().optional(),
        title: z.string().min(1, "Title is required"),
        type: z.string().min(1, "Type is required"),
        notes: z.string().optional(),
        round_id: z.string().uuid().optional(),
        roundId: z.string().uuid().optional(),
      });

      const parsed = blockSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const start_time = parsed.data.start_time ?? parsed.data.startTime ?? null;
      const round_id = parsed.data.round_id ?? parsed.data.roundId ?? null;

      const [block] = await sqlClient!`
        INSERT INTO public.itinerary_blocks (trip_id, date, start_time, title, type, notes, round_id)
        VALUES (${req.params.tripId}, ${parsed.data.date}, ${start_time}, ${parsed.data.title}, ${parsed.data.type}, ${parsed.data.notes ?? null}, ${round_id})
        RETURNING id, trip_id, date, start_time, title, type, notes, round_id, created_at
      `;

      res.status(201).json(block);
    } catch (error) {
      res.status(500).json({ error: "Failed to create itinerary block" });
    }
  });

  // List itinerary blocks for a trip (no auth)
  app.get("/api/trips/:tripId/itinerary", async (req, res) => {
    try {
      const blocks = await sqlClient!`
        SELECT id, trip_id, date, start_time, title, type, notes, round_id, created_at
        FROM public.itinerary_blocks
        WHERE trip_id = ${req.params.tripId}
        ORDER BY date ASC, start_time ASC NULLS FIRST, created_at ASC
      `;
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch itinerary blocks" });
    }
  });

  // Delete an itinerary block (no auth)
  app.delete("/api/itinerary/:id", async (req, res) => {
    try {
      const result = await sqlClient!`
        DELETE FROM public.itinerary_blocks
        WHERE id = ${req.params.id}
        RETURNING id
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: "Itinerary block not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete itinerary block" });
    }
  });

  // Update an itinerary block (no auth)
  app.patch("/api/itinerary/:id", async (req, res) => {
    try {
      const updateSchema = z.object({
        round_id: z.string().uuid().nullable().optional(),
        roundId: z.string().uuid().nullable().optional(),
      });

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const round_id = parsed.data.round_id !== undefined
        ? parsed.data.round_id
        : parsed.data.roundId !== undefined
          ? parsed.data.roundId
          : undefined;

      if (round_id === undefined) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const [block] = await sqlClient!`
        UPDATE public.itinerary_blocks
        SET round_id = ${round_id}
        WHERE id = ${req.params.id}
        RETURNING id, trip_id, date, start_time, title, type, notes, round_id, created_at
      `;

      if (!block) {
        return res.status(404).json({ error: "Itinerary block not found" });
      }

      res.json(block);
    } catch (error) {
      res.status(500).json({ error: "Failed to update itinerary block" });
    }
  });

  // === TRIP MEMBERS (NO AUTH) ===

  // Add invite_code to trips table
  app.post("/api/migrate/trips-invite-code", async (req, res) => {
    try {
      await sqlClient!`
        ALTER TABLE public.trips
        ADD COLUMN IF NOT EXISTS invite_code TEXT UNIQUE
      `;
      res.json({ success: true, message: "Added invite_code to trips table" });
    } catch (error) {
      res.status(500).json({ error: "Failed to add invite_code column" });
    }
  });

  // Create trip_members table
  app.post("/api/migrate/trip-members", async (req, res) => {
    try {
      await sqlClient!`
        CREATE TABLE IF NOT EXISTS public.trip_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(trip_id, name)
        )
      `;
      await sqlClient!`
        CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON public.trip_members(trip_id)
      `;
      res.json({ success: true, message: "Trip members table created" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create trip members table" });
    }
  });

  // In-memory mock members storage
  const mockMembers: Map<string, Array<{
    id: string;
    trip_id: string;
    name: string;
    email: string | null;
    role: string;
    rsvp_status: string;
    is_ghost: boolean;
    created_at: string;
  }>> = new Map();

  // List members for a trip (no auth) - uses guests table for roster
  app.get("/api/trips/:tripId/members", async (req, res) => {
    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      const members = mockMembers.get(req.params.tripId) || [];
      return res.json(members);
    }

    try {
      // Use guests table which has actual member names
      const members = await sqlClient`
        SELECT 
          id, 
          trip_id, 
          name, 
          email,
          role,
          rsvp_status,
          CASE 
            WHEN email IS NULL OR email = '' THEN true 
            ELSE false 
          END as is_ghost,
          NOW() as created_at
        FROM public.guests
        WHERE trip_id = ${req.params.tripId}
        ORDER BY id ASC
      `;
      res.json(members);
    } catch (error) {
      // Fallback to mock on DB error
      const members = mockMembers.get(req.params.tripId) || [];
      res.json(members);
    }
  });

  // Add a member to a trip (no auth)
  app.post("/api/trips/:tripId/members", async (req, res) => {
    const memberSchema = z.object({
      name: z.string().min(1, "Name is required"),
      email: z.string().email().optional().or(z.literal("")),
    });

    const parsed = memberSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors[0].message });
    }

    const email = parsed.data.email || null;
    const rsvpStatus = email ? 'pending' : 'confirmed'; // Ghost members are auto-confirmed

    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      const newMember = {
        id: `member-${Date.now()}`,
        trip_id: req.params.tripId,
        name: parsed.data.name,
        email,
        role: 'member',
        rsvp_status: rsvpStatus,
        is_ghost: !email,
        created_at: new Date().toISOString(),
      };
      
      const tripMembers = mockMembers.get(req.params.tripId) || [];
      tripMembers.push(newMember);
      mockMembers.set(req.params.tripId, tripMembers);
      
      return res.status(201).json(newMember);
    }

    try {
      // Insert into guests table which stores roster members
      const [member] = await sqlClient`
        INSERT INTO public.guests (trip_id, name, email, rsvp_status)
        VALUES (${req.params.tripId}, ${parsed.data.name}, ${email}, ${rsvpStatus})
        RETURNING 
          id, 
          trip_id, 
          name, 
          email,
          role,
          rsvp_status,
          CASE 
            WHEN email IS NULL OR email = '' THEN true 
            ELSE false 
          END as is_ghost,
          NOW() as created_at
      `;

      res.status(201).json(member);
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ error: "Member already exists in this trip" });
      }
      // Fallback to mock mode on error
      const newMember = {
        id: `member-${Date.now()}`,
        trip_id: req.params.tripId,
        name: parsed.data.name,
        email,
        role: 'member',
        rsvp_status: rsvpStatus,
        is_ghost: !email,
        created_at: new Date().toISOString(),
      };
      
      const tripMembers = mockMembers.get(req.params.tripId) || [];
      tripMembers.push(newMember);
      mockMembers.set(req.params.tripId, tripMembers);
      
      res.status(201).json(newMember);
    }
  });

  // Delete a trip member (no auth) - deletes from guests table
  app.delete("/api/trip-members/:id", async (req, res) => {
    // Mock mode fallback
    if (isMockMode || !sqlClient) {
      // Find and remove from mock data
      for (const [tripId, members] of mockMembers.entries()) {
        const idx = members.findIndex(m => m.id === req.params.id);
        if (idx !== -1) {
          members.splice(idx, 1);
          mockMembers.set(tripId, members);
          return res.json({ success: true });
        }
      }
      return res.status(404).json({ error: "Trip member not found" });
    }

    try {
      const result = await sqlClient`
        DELETE FROM public.guests
        WHERE id = ${req.params.id}
        RETURNING id
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: "Trip member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete trip member" });
    }
  });

  // Join trip with invite code (no auth)
  app.post("/api/join", async (req, res) => {
    try {
      const joinSchema = z.object({
        invite_code: z.string().min(1, "Invite code is required"),
        name: z.string().min(1, "Name is required"),
      });

      const parsed = joinSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      // Find trip by invite code
      const [trip] = await sqlClient!`
        SELECT id, name, invite_code
        FROM public.trips
        WHERE invite_code = ${parsed.data.invite_code}
      `;

      if (!trip) {
        return res.status(404).json({ error: "Invalid invite code" });
      }

      // Create member in guests table (roster)
      const [member] = await sqlClient!`
        INSERT INTO public.guests (trip_id, name)
        VALUES (${trip.id}, ${parsed.data.name})
        RETURNING id, trip_id, name, NOW() as created_at
      `;

      res.status(201).json({ trip_id: trip.id, member });
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(400).json({ error: "You are already a member of this trip" });
      }
      res.status(500).json({ error: "Failed to join trip" });
    }
  });

  // === EXPENSES ===

  // Create expenses and splits tables
  app.post("/api/migrate/expenses", async (req, res) => {
    try {
      await sqlClient!`
        CREATE TABLE IF NOT EXISTS public.expenses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
          paid_by TEXT NOT NULL,
          amount NUMERIC NOT NULL,
          description TEXT NOT NULL,
          category TEXT NOT NULL DEFAULT 'misc',
          expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      await sqlClient!`
        CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id)
      `;
      await sqlClient!`
        CREATE TABLE IF NOT EXISTS public.expense_splits (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          expense_id UUID NOT NULL REFERENCES public.expenses(id) ON DELETE CASCADE,
          member TEXT NOT NULL,
          amount_owed NUMERIC NOT NULL,
          is_paid BOOLEAN NOT NULL DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;
      await sqlClient!`
        CREATE INDEX IF NOT EXISTS idx_expense_splits_expense_id ON public.expense_splits(expense_id)
      `;
      res.json({ success: true, message: "Expenses tables created" });
    } catch (error) {
      res.status(500).json({ error: "Failed to create expenses tables" });
    }
  });

  // Create an expense with splits (no auth)
  app.post("/api/trips/:tripId/expenses", async (req, res) => {
    try {
      const expenseSchema = z.object({
        paid_by: z.string().min(1, "Paid by is required"),
        paidBy: z.string().optional(),
        amount: z.number().positive("Amount must be positive"),
        description: z.string().min(1, "Description is required"),
        category: z.string().default("misc"),
        expense_date: z.string().optional(),
        expenseDate: z.string().optional(),
        split_method: z.literal("equal").default("equal"),
        splitMethod: z.literal("equal").optional(),
        members: z.array(z.string().min(1)).min(1, "At least one member required"),
      });

      const parsed = expenseSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const paid_by = parsed.data.paid_by ?? parsed.data.paidBy ?? "";
      const expense_date = parsed.data.expense_date ?? parsed.data.expenseDate ?? new Date().toISOString().split('T')[0];

      // Insert expense
      const [expense] = await sqlClient!`
        INSERT INTO public.expenses (trip_id, paid_by, amount, description, category, expense_date)
        VALUES (${req.params.tripId}, ${paid_by}, ${parsed.data.amount}, ${parsed.data.description}, ${parsed.data.category}, ${expense_date})
        RETURNING id, trip_id, paid_by, amount, description, category, expense_date, created_at
      `;

      // Compute equal splits
      const totalMembers = parsed.data.members.length;
      const splitAmount = Math.floor((parsed.data.amount * 100) / totalMembers) / 100;
      const remainder = Math.round((parsed.data.amount - splitAmount * totalMembers) * 100) / 100;

      // Insert splits
      const splits = await Promise.all(
        parsed.data.members.map(async (member, index) => {
          const amountOwed = index === 0 ? splitAmount + remainder : splitAmount;
          const [split] = await sqlClient!`
            INSERT INTO public.expense_splits (expense_id, member, amount_owed)
            VALUES (${expense.id}, ${member}, ${amountOwed})
            RETURNING id, expense_id, member, amount_owed, is_paid, created_at
          `;
          return split;
        })
      );

      res.status(201).json({ expense, splits });
    } catch (error) {
      console.error("Failed to create expense:", error);
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  // List expenses for a trip with splits (no auth)
  app.get("/api/trips/:tripId/expenses", async (req, res) => {
    try {
      const expenses = await sqlClient!`
        SELECT id, trip_id, paid_by, amount, description, category, expense_date, created_at
        FROM public.expenses
        WHERE trip_id = ${req.params.tripId}
        ORDER BY expense_date DESC, created_at DESC
      `;

      const expensesWithSplits = await Promise.all(
        expenses.map(async (expense) => {
          const splits = await sqlClient!`
            SELECT id, expense_id, member, amount_owed, is_paid, created_at
            FROM public.expense_splits
            WHERE expense_id = ${expense.id}
            ORDER BY created_at ASC
          `;
          return { ...expense, splits };
        })
      );

      res.json(expensesWithSplits);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  // Delete an expense (cascades to splits) (no auth)
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const result = await sqlClient!`
        DELETE FROM public.expenses
        WHERE id = ${req.params.id}
        RETURNING id
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Get balances and suggested settlements for a trip (no auth)
  app.get("/api/trips/:tripId/balances", async (req, res) => {
    try {
      // Get all expenses for the trip
      const expenses = await sqlClient!`
        SELECT id, paid_by, amount
        FROM public.expenses
        WHERE trip_id = ${req.params.tripId}
      `;

      // Get all splits for these expenses
      const splits = await sqlClient!`
        SELECT s.member, s.amount_owed
        FROM public.expense_splits s
        JOIN public.expenses e ON s.expense_id = e.id
        WHERE e.trip_id = ${req.params.tripId}
      `;

      // Calculate paid amounts per member (in cents)
      const paidByMember: Record<string, number> = {};
      for (const expense of expenses) {
        const amountCents = Math.round(parseFloat(expense.amount.toString()) * 100);
        paidByMember[expense.paid_by] = (paidByMember[expense.paid_by] || 0) + amountCents;
      }

      // Calculate owed amounts per member (in cents)
      const owedByMember: Record<string, number> = {};
      for (const split of splits) {
        const amountCents = Math.round(parseFloat(split.amount_owed.toString()) * 100);
        owedByMember[split.member] = (owedByMember[split.member] || 0) + amountCents;
      }

      // Get all unique members
      const allMembers = new Set([
        ...Object.keys(paidByMember),
        ...Object.keys(owedByMember)
      ]);

      // Calculate net balances (in cents)
      const members = Array.from(allMembers).map(member => {
        const paidCents = paidByMember[member] || 0;
        const owedCents = owedByMember[member] || 0;
        const netCents = paidCents - owedCents;
        return {
          member,
          paid: paidCents / 100,
          owed: owedCents / 100,
          net: netCents / 100,
          netCents // Keep for settlement calculation
        };
      });

      // Calculate suggested transfers
      const creditors = members
        .filter(m => m.netCents > 0)
        .sort((a, b) => b.netCents - a.netCents)
        .map(m => ({ member: m.member, netCents: m.netCents }));

      const debtors = members
        .filter(m => m.netCents < 0)
        .sort((a, b) => a.netCents - b.netCents)
        .map(m => ({ member: m.member, netCents: -m.netCents }));

      const transfers: { from: string; to: string; amount: number }[] = [];

      let creditorIdx = 0;
      let debtorIdx = 0;

      while (creditorIdx < creditors.length && debtorIdx < debtors.length) {
        const creditor = creditors[creditorIdx];
        const debtor = debtors[debtorIdx];

        const payCents = Math.min(creditor.netCents, debtor.netCents);

        if (payCents > 0) {
          transfers.push({
            from: debtor.member,
            to: creditor.member,
            amount: Math.round(payCents) / 100
          });
        }

        creditor.netCents -= payCents;
        debtor.netCents -= payCents;

        if (creditor.netCents <= 0) creditorIdx++;
        if (debtor.netCents <= 0) debtorIdx++;
      }

      res.json({
        members: members.map(m => ({
          member: m.member,
          paid: m.paid,
          owed: m.owed,
          net: m.net
        })),
        transfers
      });
    } catch (error) {
      console.error("Failed to calculate balances:", error);
      res.status(500).json({ error: "Failed to calculate balances" });
    }
  });

  app.patch("/api/trips/:id", requireAuth, async (req, res) => {
    try {
      const updateSchema = z.object({
        name: z.string().min(1).optional(),
        location: z.string().min(1).optional(),
        startDate: z.string().transform(s => new Date(s)).optional(),
        endDate: z.string().transform(s => new Date(s)).optional(),
        theme: z.string().optional(),
        tier: z.enum(['ghost', 'onsite', 'signature']).optional(),
        budget: z.number().optional(),
      });

      const parsed = updateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const updatedTrip = await services.updateTrip(req.params.id, parsed.data);
      if (!updatedTrip) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(updatedTrip);
    } catch (error) {
      console.error("Failed to update trip:", error);
      res.status(500).json({ error: "Failed to update trip" });
    }
  });

  app.get("/api/trips/:id/full", requireAuth, async (req, res) => {
    try {
      const tripWithDetails = await services.getTripWithDetails(req.params.id);
      if (!tripWithDetails) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(tripWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch trip data" });
    }
  });

  // === GRAVITY WELL (Guest Experience Core) ===
  
  app.get("/api/trips/:id/gravity", async (req, res) => {
    try {
      const userId = req.query.userId as string || 'user-001';
      const gravityState = await services.getTripGravityState(req.params.id, userId);
      if (!gravityState) {
        return res.status(404).json({ error: "Trip not found" });
      }
      res.json(gravityState);
    } catch (error) {
      res.status(500).json({ error: "Failed to compute gravity state" });
    }
  });

  // === RISK SUMMARY ===
  
  app.get("/api/trips/:id/risk", async (req, res) => {
    try {
      const riskSummary = await services.getTripRiskSummary(req.params.id);
      res.json(riskSummary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch risk summary" });
    }
  });

  // === MEMBERS (OLD - REMOVED) ===
  // Old authenticated members endpoint removed - now using no-auth trip_members table above

  // Invite a new member
  const inviteMemberSchema = z.object({
    email: z.string().email("Valid email is required"),
    name: z.string().optional(),
    role: z.enum(['guest', 'captain']).default('guest'),
  });

  app.post("/api/trips/:tripId/members/invite", requireAuth, async (req, res) => {
    try {
      const parsed = inviteMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid invite data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      const { email, name, role } = parsed.data;
      const member = inviteMember(req.params.tripId, email, name, role);
      res.status(201).json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to invite member" });
    }
  });

  // Update member details
  const updateMemberSchema = z.object({
    roomAssignment: z.string().optional(),
    role: z.enum(['guest', 'captain', 'vip']).optional(),
    rsvpStatus: z.enum(['pending', 'confirmed', 'declined']).optional(),
  });

  app.patch("/api/trips/:tripId/members/:memberId", async (req, res) => {
    try {
      const parsed = updateMemberSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid update data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      const member = updateMember(req.params.memberId, parsed.data);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to update member" });
    }
  });

  // Remove member from trip
  app.delete("/api/trips/:tripId/members/:memberId", async (req, res) => {
    try {
      const deleted = removeMember(req.params.memberId);
      if (!deleted) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove member" });
    }
  });

  // Change member role (promote/demote captain)
  const changeRoleSchema = z.object({
    role: z.enum(['guest', 'captain', 'vip']),
  });

  app.patch("/api/trips/:tripId/members/:memberId/role", async (req, res) => {
    try {
      const parsed = changeRoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid role data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      const member = changeMemberRole(req.params.memberId, parsed.data.role);
      if (!member) {
        return res.status(404).json({ error: "Member not found" });
      }
      res.json(member);
    } catch (error) {
      res.status(500).json({ error: "Failed to change member role" });
    }
  });

  // === ITINERARY BLOCKS ===
  
  app.get("/api/trips/:tripId/blocks", async (req, res) => {
    try {
      const blocks = await services.getTripItinerary(req.params.tripId);
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blocks" });
    }
  });

  // === TASKS ===
  
  app.get("/api/trips/:tripId/tasks", async (req, res) => {
    try {
      const tasks = mockTasks.filter(t => t.tripId === req.params.tripId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // === SHIPMENTS ===
  
  app.get("/api/trips/:tripId/shipments", async (req, res) => {
    try {
      const shipments = mockShipments.filter(s => s.tripId === req.params.tripId);
      res.json(shipments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch shipments" });
    }
  });

  // === BAGS & TRAVEL ===
  
  app.get("/api/trips/:tripId/bags", async (req, res) => {
    try {
      const memberIds = tripMembers.filter(m => m.tripId === req.params.tripId).map(m => m.id);
      const bags = mockBags.filter(b => memberIds.includes(b.tripMemberId));
      res.json(bags);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch bags" });
    }
  });

  app.get("/api/trips/:tripId/travel", async (req, res) => {
    try {
      const memberIds = tripMembers.filter(m => m.tripId === req.params.tripId).map(m => m.id);
      const travel = mockTravelItems.filter(t => memberIds.includes(t.tripMemberId));
      res.json(travel);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch travel items" });
    }
  });

  // === TOURNAMENTS ===
  
  app.get("/api/trips/:tripId/tournaments", async (req, res) => {
    try {
      const tournaments = mockTournaments.filter(t => t.tripId === req.params.tripId);
      res.json(tournaments);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tournaments" });
    }
  });

  app.get("/api/tournaments/:tournamentId/leaderboard", async (req, res) => {
    try {
      const leaderboard = computeLeaderboard(req.params.tournamentId);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // === TEAMS ===
  
  app.get("/api/tournaments/:tournamentId/teams", async (req, res) => {
    try {
      const teams = mockTeams.filter(t => t.tournamentId === req.params.tournamentId);
      res.json(teams);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch teams" });
    }
  });

  // === ROUNDS ===
  
  app.get("/api/tournaments/:tournamentId/rounds", async (req, res) => {
    try {
      const rounds = mockRounds.filter(r => r.tournamentId === req.params.tournamentId);
      res.json(rounds);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch rounds" });
    }
  });

  // === SCORES ===
  
  app.get("/api/rounds/:roundId/scores", async (req, res) => {
    try {
      const scores = mockScores.filter(s => s.roundId === req.params.roundId);
      res.json(scores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch scores" });
    }
  });

  // === EXPENSES ===
  
  app.get("/api/trips/:tripId/expenses", async (req, res) => {
    try {
      const expenses = await services.getTripExpenses(req.params.tripId);
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  app.get("/api/trips/:tripId/expenses/summary", async (req, res) => {
    try {
      const summary = await services.getTripExpenseSummary(req.params.tripId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch expense summary" });
    }
  });

  // === ISSUES ===
  
  app.get("/api/trips/:tripId/issues", async (req, res) => {
    try {
      const issues = mockIssues.filter(i => i.tripId === req.params.tripId);
      res.json(issues);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch issues" });
    }
  });

  // === ANNOUNCEMENTS ===
  
  app.get("/api/trips/:tripId/announcements", async (req, res) => {
    try {
      const announcements = mockAnnouncements.filter(a => a.tripId === req.params.tripId);
      res.json(announcements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch announcements" });
    }
  });

  // === GAMES (Tournament Designer) ===
  
  app.get("/api/trips/:tripId/games", async (req, res) => {
    try {
      const games = getGamesByTrip(req.params.tripId);
      res.json(games);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch games" });
    }
  });

  app.post("/api/trips/:tripId/games", async (req, res) => {
    try {
      const game = createGame(req.params.tripId, req.body);
      res.status(201).json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to create game" });
    }
  });

  app.patch("/api/games/:gameId", async (req, res) => {
    try {
      const game = updateGame(req.params.gameId, req.body);
      if (!game) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json(game);
    } catch (error) {
      res.status(500).json({ error: "Failed to update game" });
    }
  });

  app.delete("/api/games/:gameId", async (req, res) => {
    try {
      const deleted = deleteGame(req.params.gameId);
      if (!deleted) {
        return res.status(404).json({ error: "Game not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete game" });
    }
  });

  // === GAME READINESS (Group Validation) ===
  
  app.get("/api/games/:gameId/readiness", async (req, res) => {
    try {
      const readiness = validateGameReadiness(req.params.gameId);
      res.json(readiness);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate game readiness" });
    }
  });

  app.get("/api/games/:gameId/groups", async (req, res) => {
    try {
      const groups = getGroupsByGame(req.params.gameId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  // Get all groups for a trip
  app.get("/api/trips/:tripId/groups", async (req, res) => {
    try {
      const groups = getGroupsByTrip(req.params.tripId);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch groups" });
    }
  });

  // Update a group (scorekeeper assignment, customization)
  const groupUpdateSchema = z.object({
    scorekeeperId: z.string().optional(),
    displayName: z.string().max(50).optional(),
    iconType: z.enum(['emoji', 'lucide', 'custom']).optional(),
    iconValue: z.string().max(100).optional(),
  });

  app.patch("/api/groups/:groupId", async (req, res) => {
    try {
      const parsed = groupUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid group update data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }

      const { scorekeeperId, displayName, iconType, iconValue } = parsed.data;
      const updates: Record<string, unknown> = {};
      
      if (scorekeeperId !== undefined) updates.scorekeeperId = scorekeeperId;
      if (displayName !== undefined) updates.displayName = displayName;
      if (iconType !== undefined) updates.iconType = iconType;
      if (iconValue !== undefined) updates.iconValue = iconValue;
      
      const group = updateGroup(req.params.groupId, updates);
      if (!group) {
        return res.status(404).json({ error: "Group not found" });
      }
      res.json(group);
    } catch (error) {
      res.status(500).json({ error: "Failed to update group" });
    }
  });

  // === LEDGER & PAYMENTS ===
  
  app.get("/api/trips/:tripId/ledger", async (req, res) => {
    try {
      const summary = getLedgerSummary(req.params.tripId);
      res.json(summary);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ledger" });
    }
  });

  app.get("/api/trips/:tripId/ledger/entries", async (req, res) => {
    try {
      const entries = getLedgerEntriesByTrip(req.params.tripId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch ledger entries" });
    }
  });

  app.get("/api/trips/:tripId/ledger/balances", async (req, res) => {
    try {
      const balances = getLedgerBalances(req.params.tripId);
      res.json(balances);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch balances" });
    }
  });

  app.get("/api/trips/:tripId/ledger/settlements", async (req, res) => {
    try {
      const settlements = getSettlementsByTrip(req.params.tripId);
      res.json(settlements);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch settlements" });
    }
  });

  app.post("/api/trips/:tripId/ledger/settlements", async (req, res) => {
    try {
      const parsed = settlementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid settlement data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      const settlement = createSettlement({
        tripId: req.params.tripId,
        ...parsed.data,
        completedAt: parsed.data.completedAt ? new Date(parsed.data.completedAt) : undefined,
      });
      res.status(201).json(settlement);
    } catch (error) {
      res.status(500).json({ error: "Failed to create settlement" });
    }
  });

  app.get("/api/payment-methods", async (req, res) => {
    try {
      const methods = getPaymentMethods();
      res.json(methods);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch payment methods" });
    }
  });

  // ============================================
  // LIVE FEED ROUTES
  // ============================================

  app.get("/api/live/pga-tour", async (req, res) => {
    try {
      const cards = mockPgaTourCards.map((card, i) => ({
        ...card,
        id: `pga-tour-${i}`
      }));
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch PGA Tour data" });
    }
  });

  app.get("/api/live/tour-schedule", async (req, res) => {
    try {
      const cards = mockTourScheduleCards.map((card, i) => ({
        ...card,
        id: `tour-schedule-${i}`
      }));
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tour schedule" });
    }
  });

  app.get("/api/live/news", async (req, res) => {
    try {
      const cards = mockGolfNewsCards.map((card, i) => ({
        ...card,
        id: `golf-news-${i}`
      }));
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch golf news" });
    }
  });

  app.get("/api/live/history", async (req, res) => {
    try {
      const cards = mockHistoryCards.map((card, i) => ({
        ...card,
        id: `history-${i}`
      }));
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  app.get("/api/live/courses", async (req, res) => {
    try {
      const cards = mockCourseSpotlightCards.map((card, i) => ({
        ...card,
        id: `course-spotlight-${i}`
      }));
      res.json(cards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course spotlights" });
    }
  });

  app.get("/api/live/all", async (req, res) => {
    try {
      const allCards = [
        ...mockPgaTourCards.map((card, i) => ({ ...card, id: `pga-tour-${i}` })),
        ...mockTourScheduleCards.map((card, i) => ({ ...card, id: `tour-schedule-${i}` })),
        ...mockGolfNewsCards.map((card, i) => ({ ...card, id: `golf-news-${i}` })),
        ...mockHistoryCards.map((card, i) => ({ ...card, id: `history-${i}` })),
        ...mockCourseSpotlightCards.map((card, i) => ({ ...card, id: `course-spotlight-${i}` })),
      ];
      res.json(allCards);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch live feed data" });
    }
  });

  // ============================================
  // CADDIE MODE ROUTES
  // ============================================

  app.get("/api/rounds/active", async (req, res) => {
    try {
      const tripId = req.query.tripId as string;
      if (!tripId) {
        return res.status(400).json({ error: "tripId is required" });
      }
      const round = getActiveRound(tripId);
      res.json(round);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch active round" });
    }
  });

  app.get("/api/courses/:courseId/holes", async (req, res) => {
    try {
      const courseData = getCourseData(req.params.courseId);
      if (!courseData) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(courseData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch course data" });
    }
  });

  const scoreUpdateSchema = z.object({
    playerId: z.string().min(1),
    holeIndex: z.number().min(0).max(17),
    score: z.number().min(1).max(15),
  });

  app.patch("/api/rounds/:roundId/scores", async (req, res) => {
    try {
      const parsed = scoreUpdateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid score data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      const { playerId, holeIndex, score } = parsed.data;
      const success = updatePlayerScore(req.params.roundId, playerId, holeIndex, score);
      if (!success) {
        return res.status(404).json({ error: "Round or player not found" });
      }
      const round = getActiveRound("trip-001");
      res.json(round);
    } catch (error) {
      res.status(500).json({ error: "Failed to update score" });
    }
  });

  const advanceSchema = z.object({
    direction: z.enum(['next', 'prev']),
  });

  app.post("/api/rounds/:roundId/advance", async (req, res) => {
    try {
      const parsed = advanceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid direction" });
      }
      const success = advanceRound(req.params.roundId, parsed.data.direction);
      if (!success) {
        return res.status(400).json({ error: "Cannot advance in that direction" });
      }
      const round = getActiveRound("trip-001");
      res.json(round);
    } catch (error) {
      res.status(500).json({ error: "Failed to advance round" });
    }
  });

  const goToHoleSchema = z.object({
    holeNumber: z.number().min(1).max(18),
  });

  app.post("/api/rounds/:roundId/go-to-hole", async (req, res) => {
    try {
      const parsed = goToHoleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid hole number" });
      }
      const success = goToHole(req.params.roundId, parsed.data.holeNumber);
      if (!success) {
        return res.status(400).json({ error: "Cannot go to that hole" });
      }
      const round = getActiveRound("trip-001");
      res.json(round);
    } catch (error) {
      res.status(500).json({ error: "Failed to go to hole" });
    }
  });

  app.post("/api/rounds/:roundId/end", async (req, res) => {
    try {
      const success = endRound(req.params.roundId);
      if (!success) {
        return res.status(404).json({ error: "Round not found" });
      }
      res.json({ success: true, message: "Round ended" });
    } catch (error) {
      res.status(500).json({ error: "Failed to end round" });
    }
  });

  // ============================================
  // ITINERARY BUILDER (Drag & Drop)
  // ============================================

  // Get all builder blocks for a trip
  app.get("/api/trips/:tripId/itinerary/builder", async (req, res) => {
    try {
      const blocks = getBuilderBlocksByTrip(req.params.tripId);
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch itinerary blocks" });
    }
  });

  // Create a new builder block
  const createBlockSchema = z.object({
    dayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    sortOrder: z.number().int().min(0),
    blockType: z.string(),
    category: z.enum(['meal', 'golf', 'transport', 'lodging', 'activity', 'logistics']),
    title: z.string().min(1),
    startTime: z.string().optional(),
    duration: z.number().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    confirmationNumber: z.string().optional(),
    status: z.enum(['open', 'soft', 'locked']).default('open'),
  });

  app.post("/api/trips/:tripId/itinerary/builder", async (req, res) => {
    try {
      const parsed = createBlockSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid block data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      const block = createBuilderBlock(req.params.tripId, parsed.data as any);
      res.status(201).json(block);
    } catch (error) {
      res.status(500).json({ error: "Failed to create block" });
    }
  });

  // Update a builder block
  const updateBlockSchema = z.object({
    dayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    sortOrder: z.number().int().min(0).optional(),
    blockType: z.string().optional(),
    category: z.enum(['meal', 'golf', 'transport', 'lodging', 'activity', 'logistics']).optional(),
    title: z.string().optional(),
    startTime: z.string().optional(),
    duration: z.number().optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    confirmationNumber: z.string().optional(),
    status: z.enum(['open', 'soft', 'locked']).optional(),
  });

  app.patch("/api/itinerary/builder/:blockId", async (req, res) => {
    try {
      const parsed = updateBlockSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid update data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      // Cast to the correct type since we trust the schema validation
      const block = updateBuilderBlock(req.params.blockId, parsed.data as Parameters<typeof updateBuilderBlock>[1]);
      if (!block) {
        return res.status(404).json({ error: "Block not found" });
      }
      res.json(block);
    } catch (error) {
      res.status(500).json({ error: "Failed to update block" });
    }
  });

  // Delete a builder block
  app.delete("/api/itinerary/builder/:blockId", async (req, res) => {
    try {
      const deleted = deleteBuilderBlock(req.params.blockId);
      if (!deleted) {
        return res.status(404).json({ error: "Block not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete block" });
    }
  });

  // Reorder blocks within a day (or move to different day)
  const reorderBlocksSchema = z.object({
    dayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    blockIds: z.array(z.string()),
  });

  app.post("/api/trips/:tripId/itinerary/builder/reorder", async (req, res) => {
    try {
      const parsed = reorderBlocksSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid reorder data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      const blocks = reorderBuilderBlocks(
        req.params.tripId, 
        parsed.data.dayDate, 
        parsed.data.blockIds
      );
      res.json(blocks);
    } catch (error) {
      res.status(500).json({ error: "Failed to reorder blocks" });
    }
  });

  // Move a single block to a day at a specific position
  const moveBlockSchema = z.object({
    newDayDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
    newSortOrder: z.number().int().min(0),
  });

  app.post("/api/itinerary/builder/:blockId/move", async (req, res) => {
    try {
      const parsed = moveBlockSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ 
          error: "Invalid move data", 
          details: parsed.error.flatten().fieldErrors 
        });
      }
      const block = moveBlockToDay(
        req.params.blockId,
        parsed.data.newDayDate,
        parsed.data.newSortOrder
      );
      if (!block) {
        return res.status(404).json({ error: "Block not found" });
      }
      res.json(block);
    } catch (error) {
      res.status(500).json({ error: "Failed to move block" });
    }
  });

  return httpServer;
}
