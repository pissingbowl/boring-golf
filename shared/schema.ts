/**
 * SCHEMA TRUTH: The raw SQL tables in server/routes.ts are the production source of truth.
 * The 6 trip-domain tables below (trips, trip_members, rounds, itinerary_blocks, expenses, expense_splits)
 * are aligned to match production SQL exactly. DO NOT drift from the raw SQL.
 */

import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, pgEnum, date, numeric, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const tripStatusEnum = pgEnum("trip_status", ["draft", "planning", "confirmed", "active", "completed", "cancelled"]);
export const tripTierEnum = pgEnum("trip_tier", ["ghost", "onsite", "signature"]);
export const memberRoleEnum = pgEnum("member_role", ["owner", "organizer", "member"]);
export const guestRoleEnum = pgEnum("guest_role", ["captain", "guest", "vip"]);
export const rsvpStatusEnum = pgEnum("rsvp_status", ["pending", "confirmed", "declined"]);
export const blockTypeEnum = pgEnum("block_type", ["tee_time", "meal", "transport", "lodging", "activity", "free_time"]);
export const blockStatusEnum = pgEnum("block_status", ["upcoming", "boarding", "in_progress", "complete", "changed", "cancelled"]);
export const taskStatusEnum = pgEnum("task_status", ["pending", "in_progress", "completed", "blocked"]);
export const shipmentStatusEnum = pgEnum("shipment_status", ["invite_sent", "address_confirmed", "label_created", "in_transit", "delivered", "received", "issue"]);
export const tournamentFormatEnum = pgEnum("tournament_format", ["scramble", "best_ball", "match_play", "stableford", "skins", "ryder_cup"]);
export const merchStatusEnum = pgEnum("merch_status", ["collecting", "ordered", "shipped", "delivered", "staged"]);
export const issueStatusEnum = pgEnum("issue_status", ["open", "in_progress", "resolved"]);
export const issueSeverityEnum = pgEnum("issue_severity", ["low", "medium", "high", "critical"]);

// Trips table - matches production SQL: id, name, destination, start_date, nights, invite_code, created_at
export const trips = pgTable("trips", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  start_date: date("start_date"),
  nights: integer("nights"),
  invite_code: varchar("invite_code").unique().default(sql`gen_random_uuid()`),
  created_at: timestamp("created_at").defaultNow(),
});

// Trip members - matches production SQL: id, trip_id, name, created_at with UNIQUE(trip_id, name)
export const tripMembers = pgTable("trip_members", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trip_id: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  created_at: timestamp("created_at").defaultNow(),
}, (table) => [
  unique().on(table.trip_id, table.name),
]);

// Guests table
export const guests = pgTable("guests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: guestRoleEnum("role").default("guest"),
  rsvpStatus: rsvpStatusEnum("rsvp_status").default("pending"),
  dietary: text("dietary"),
  tshirtSize: text("tshirt_size"),
  hatSize: text("hat_size"),
  handicap: integer("handicap"),
  ghin: text("ghin"),
  arrivalDate: timestamp("arrival_date"),
  departureDate: timestamp("departure_date"),
  roomAssignment: text("room_assignment"),
  emergencyContact: text("emergency_contact"),
  teamId: varchar("team_id"),
});

// Itinerary blocks - matches production SQL: id, trip_id, date, start_time, title, type, notes, round_id, created_at
export const itineraryBlocks = pgTable("itinerary_blocks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trip_id: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  date: date("date"),
  start_time: text("start_time"),
  title: text("title").notNull(),
  type: text("type").notNull(),
  notes: text("notes"),
  round_id: varchar("round_id").references(() => rounds.id),
  created_at: timestamp("created_at").defaultNow(),
});

// Tasks
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  owner: text("owner"),
  dueDate: timestamp("due_date"),
  status: taskStatusEnum("status").default("pending"),
  priority: integer("priority").default(0),
  checklist: jsonb("checklist"),
  dependsOn: varchar("depends_on"),
});

// Shipments
export const shipments = pgTable("shipments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  guestId: varchar("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  carrier: text("carrier"),
  trackingNumber: text("tracking_number"),
  shipTo: text("ship_to"),
  eta: timestamp("eta"),
  status: shipmentStatusEnum("status").default("invite_sent"),
  itemDescription: text("item_description"),
  issues: text("issues"),
});

// Tournaments
export const tournaments = pgTable("tournaments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  format: tournamentFormatEnum("format").notNull(),
  rules: text("rules"),
  handicapMethod: text("handicap_method"),
  prizePool: integer("prize_pool"),
  isActive: boolean("is_active").default(true),
});

// Teams (for tournaments)
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tournamentId: varchar("tournament_id").notNull().references(() => tournaments.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color"),
  members: text("members").array(),
});

// Rounds - matches production SQL: id, trip_id, course_name, date, notes, created_at
export const rounds = pgTable("rounds", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trip_id: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  course_name: text("course_name").notNull(),
  date: date("date"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Scores
export const scores = pgTable("scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roundId: varchar("round_id").notNull().references(() => rounds.id, { onDelete: "cascade" }),
  guestId: varchar("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  teamId: varchar("team_id"),
  holeScores: jsonb("hole_scores"),
  totalStrokes: integer("total_strokes"),
  netScore: integer("net_score"),
  points: integer("points"),
  confirmed: boolean("confirmed").default(false),
});

// Merch orders
export const merchOrders = pgTable("merch_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  designName: text("design_name").notNull(),
  items: jsonb("items"),
  sizeRuns: jsonb("size_runs"),
  status: merchStatusEnum("status").default("collecting"),
  deadline: timestamp("deadline"),
  cost: integer("cost"),
  notes: text("notes"),
});

// Guest merch selections
export const guestMerch = pgTable("guest_merch", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  merchOrderId: varchar("merch_order_id").notNull().references(() => merchOrders.id, { onDelete: "cascade" }),
  guestId: varchar("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  selections: jsonb("selections"),
  submittedAt: timestamp("submitted_at"),
});

// Issues / Incidents
export const issues = pgTable("issues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  guestId: varchar("guest_id").references(() => guests.id),
  title: text("title").notNull(),
  description: text("description"),
  severity: issueSeverityEnum("severity").default("medium"),
  status: issueStatusEnum("status").default("open"),
  owner: text("owner"),
  playbook: text("playbook"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Announcements
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tripId: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  sentBy: text("sent_by"),
});

// Expenses - matches production SQL: id, trip_id, paid_by, amount, description, category, expense_date, created_at
export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trip_id: varchar("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
  paid_by: varchar("paid_by").notNull(),
  amount: numeric("amount").notNull(),
  description: text("description"),
  category: text("category"),
  expense_date: date("expense_date"),
  created_at: timestamp("created_at").defaultNow(),
});

// Expense splits - matches production SQL: id, expense_id, member, amount_owed, is_paid, created_at
export const expenseSplits = pgTable("expense_splits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  expense_id: varchar("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  member: varchar("member").notNull(),
  amount_owed: numeric("amount_owed").notNull(),
  is_paid: boolean("is_paid").default(false),
  created_at: timestamp("created_at").defaultNow(),
});

// Relations
export const tripsRelations = relations(trips, ({ many }) => ({
  members: many(tripMembers),
  guests: many(guests),
  itineraryBlocks: many(itineraryBlocks),
  rounds: many(rounds),
  expenses: many(expenses),
  tasks: many(tasks),
  shipments: many(shipments),
  tournaments: many(tournaments),
  merchOrders: many(merchOrders),
  issues: many(issues),
  announcements: many(announcements),
}));

export const tripMembersRelations = relations(tripMembers, ({ one }) => ({
  trip: one(trips, { fields: [tripMembers.trip_id], references: [trips.id] }),
}));

export const guestsRelations = relations(guests, ({ one, many }) => ({
  trip: one(trips, { fields: [guests.tripId], references: [trips.id] }),
  shipments: many(shipments),
  scores: many(scores),
  guestMerch: many(guestMerch),
}));

export const itineraryBlocksRelations = relations(itineraryBlocks, ({ one }) => ({
  trip: one(trips, { fields: [itineraryBlocks.trip_id], references: [trips.id] }),
  round: one(rounds, { fields: [itineraryBlocks.round_id], references: [rounds.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  trip: one(trips, { fields: [tasks.tripId], references: [trips.id] }),
}));

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  trip: one(trips, { fields: [shipments.tripId], references: [trips.id] }),
  guest: one(guests, { fields: [shipments.guestId], references: [guests.id] }),
}));

export const tournamentsRelations = relations(tournaments, ({ one, many }) => ({
  trip: one(trips, { fields: [tournaments.tripId], references: [trips.id] }),
  teams: many(teams),
  rounds: many(rounds),
}));

export const teamsRelations = relations(teams, ({ one }) => ({
  tournament: one(tournaments, { fields: [teams.tournamentId], references: [tournaments.id] }),
}));

export const roundsRelations = relations(rounds, ({ one, many }) => ({
  trip: one(trips, { fields: [rounds.trip_id], references: [trips.id] }),
  itineraryBlocks: many(itineraryBlocks),
}));

export const scoresRelations = relations(scores, ({ one }) => ({
  round: one(rounds, { fields: [scores.roundId], references: [rounds.id] }),
  guest: one(guests, { fields: [scores.guestId], references: [guests.id] }),
}));

export const merchOrdersRelations = relations(merchOrders, ({ one, many }) => ({
  trip: one(trips, { fields: [merchOrders.tripId], references: [trips.id] }),
  guestMerch: many(guestMerch),
}));

export const guestMerchRelations = relations(guestMerch, ({ one }) => ({
  merchOrder: one(merchOrders, { fields: [guestMerch.merchOrderId], references: [merchOrders.id] }),
  guest: one(guests, { fields: [guestMerch.guestId], references: [guests.id] }),
}));

export const issuesRelations = relations(issues, ({ one }) => ({
  trip: one(trips, { fields: [issues.tripId], references: [trips.id] }),
  guest: one(guests, { fields: [issues.guestId], references: [guests.id] }),
}));

export const announcementsRelations = relations(announcements, ({ one }) => ({
  trip: one(trips, { fields: [announcements.tripId], references: [trips.id] }),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  trip: one(trips, { fields: [expenses.trip_id], references: [trips.id] }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, { fields: [expenseSplits.expense_id], references: [expenses.id] }),
}));

// Insert schemas
export const insertTripSchema = createInsertSchema(trips).omit({ id: true, created_at: true, invite_code: true });
export const insertTripMemberSchema = createInsertSchema(tripMembers).omit({ id: true, created_at: true });
export const insertGuestSchema = createInsertSchema(guests).omit({ id: true });
export const insertItineraryBlockSchema = createInsertSchema(itineraryBlocks).omit({ id: true, created_at: true });
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true });
export const insertShipmentSchema = createInsertSchema(shipments).omit({ id: true });
export const insertTournamentSchema = createInsertSchema(tournaments).omit({ id: true });
export const insertTeamSchema = createInsertSchema(teams).omit({ id: true });
export const insertRoundSchema = createInsertSchema(rounds).omit({ id: true, created_at: true });
export const insertScoreSchema = createInsertSchema(scores).omit({ id: true });
export const insertMerchOrderSchema = createInsertSchema(merchOrders).omit({ id: true });
export const insertGuestMerchSchema = createInsertSchema(guestMerch).omit({ id: true });
export const insertIssueSchema = createInsertSchema(issues).omit({ id: true, createdAt: true });
export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, created_at: true });
export const insertExpenseSplitSchema = createInsertSchema(expenseSplits).omit({ id: true, created_at: true });

// Types
export type Trip = typeof trips.$inferSelect;
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type TripMember = typeof tripMembers.$inferSelect;
export type InsertTripMember = z.infer<typeof insertTripMemberSchema>;
export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;
export type ItineraryBlock = typeof itineraryBlocks.$inferSelect;
export type InsertItineraryBlock = z.infer<typeof insertItineraryBlockSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Shipment = typeof shipments.$inferSelect;
export type InsertShipment = z.infer<typeof insertShipmentSchema>;
export type Tournament = typeof tournaments.$inferSelect;
export type InsertTournament = z.infer<typeof insertTournamentSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Round = typeof rounds.$inferSelect;
export type InsertRound = z.infer<typeof insertRoundSchema>;
export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;
export type MerchOrder = typeof merchOrders.$inferSelect;
export type InsertMerchOrder = z.infer<typeof insertMerchOrderSchema>;
export type GuestMerch = typeof guestMerch.$inferSelect;
export type InsertGuestMerch = z.infer<typeof insertGuestMerchSchema>;
export type Issue = typeof issues.$inferSelect;
export type InsertIssue = z.infer<typeof insertIssueSchema>;
export type Announcement = typeof announcements.$inferSelect;
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;

// Knowledge entries for ops-back control room
export const knowledgeCategoryEnum = pgEnum("knowledge_category", ["course", "city", "history", "easter_egg", "tip", "quote"]);

export const knowledgeEntries = pgTable("knowledge_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: knowledgeCategoryEnum("category").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  relatedEntityId: varchar("related_entity_id"),
  tags: text("tags").array(),
  isActive: boolean("is_active").default(true),
  createdBy: text("created_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertKnowledgeEntrySchema = createInsertSchema(knowledgeEntries).omit({ id: true, createdAt: true, updatedAt: true });
export type KnowledgeEntry = typeof knowledgeEntries.$inferSelect;
export type InsertKnowledgeEntry = z.infer<typeof insertKnowledgeEntrySchema>;

// Re-export auth models (users and sessions tables for Replit Auth)
export * from "./models/auth";
