import { 
  trips, guests, itineraryBlocks, tasks, shipments, tournaments, teams, rounds, scores, merchOrders, guestMerch, issues, announcements,
  type Trip, type InsertTrip, type Guest, type InsertGuest, type ItineraryBlock, type InsertItineraryBlock,
  type Task, type InsertTask, type Shipment, type InsertShipment, type Tournament, type InsertTournament,
  type Team, type InsertTeam, type Round, type InsertRound, type Score, type InsertScore,
  type MerchOrder, type InsertMerchOrder, type GuestMerch, type InsertGuestMerch, type Issue, type InsertIssue,
  type Announcement, type InsertAnnouncement
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Trips
  getTrips(): Promise<Trip[]>;
  getTrip(id: string): Promise<Trip | undefined>;
  getTripByInviteCode(inviteCode: string): Promise<Trip | undefined>;
  createTrip(trip: InsertTrip): Promise<Trip>;
  updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | undefined>;
  
  // Guests
  getGuestsByTrip(tripId: string): Promise<Guest[]>;
  getGuest(id: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: string, updates: Partial<Guest>): Promise<Guest | undefined>;
  
  // Itinerary Blocks
  getBlocksByTrip(tripId: string): Promise<ItineraryBlock[]>;
  getBlock(id: string): Promise<ItineraryBlock | undefined>;
  createBlock(block: InsertItineraryBlock): Promise<ItineraryBlock>;
  updateBlock(id: string, updates: Partial<ItineraryBlock>): Promise<ItineraryBlock | undefined>;
  deleteBlock(id: string): Promise<void>;
  
  // Tasks
  getTasksByTrip(tripId: string): Promise<Task[]>;
  getTask(id: string): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<void>;
  
  // Shipments
  getShipmentsByTrip(tripId: string): Promise<Shipment[]>;
  getShipment(id: string): Promise<Shipment | undefined>;
  createShipment(shipment: InsertShipment): Promise<Shipment>;
  updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment | undefined>;
  
  // Tournaments
  getTournamentsByTrip(tripId: string): Promise<Tournament[]>;
  getTournament(id: string): Promise<Tournament | undefined>;
  createTournament(tournament: InsertTournament): Promise<Tournament>;
  updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined>;
  
  // Teams
  getTeamsByTournament(tournamentId: string): Promise<Team[]>;
  getTeamsByTrip(tripId: string): Promise<Team[]>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Rounds
  getRoundsByTournament(tournamentId: string): Promise<Round[]>;
  getRoundsByTrip(tripId: string): Promise<Round[]>;
  createRound(round: InsertRound): Promise<Round>;
  
  // Scores
  getScoresByRound(roundId: string): Promise<Score[]>;
  getScoresByTrip(tripId: string): Promise<Score[]>;
  createScore(score: InsertScore): Promise<Score>;
  updateScore(id: string, updates: Partial<Score>): Promise<Score | undefined>;
  
  // Merch Orders
  getMerchOrdersByTrip(tripId: string): Promise<MerchOrder[]>;
  getMerchOrder(id: string): Promise<MerchOrder | undefined>;
  createMerchOrder(order: InsertMerchOrder): Promise<MerchOrder>;
  updateMerchOrder(id: string, updates: Partial<MerchOrder>): Promise<MerchOrder | undefined>;
  
  // Guest Merch
  getGuestMerchByTrip(tripId: string): Promise<GuestMerch[]>;
  createGuestMerch(guestMerch: InsertGuestMerch): Promise<GuestMerch>;
  
  // Issues
  getIssuesByTrip(tripId: string): Promise<Issue[]>;
  createIssue(issue: InsertIssue): Promise<Issue>;
  updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | undefined>;
  
  // Announcements
  getAnnouncementsByTrip(tripId: string): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
}

export class DatabaseStorage implements IStorage {
  // Trips
  async getTrips(): Promise<Trip[]> {
    return db.select().from(trips);
  }

  async getTrip(id: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.id, id));
    return trip || undefined;
  }

  async getTripByInviteCode(inviteCode: string): Promise<Trip | undefined> {
    const [trip] = await db.select().from(trips).where(eq(trips.invite_code, inviteCode));
    return trip || undefined;
  }

  async createTrip(trip: InsertTrip): Promise<Trip> {
    const [created] = await db.insert(trips).values(trip).returning();
    return created;
  }

  async updateTrip(id: string, updates: Partial<Trip>): Promise<Trip | undefined> {
    const [updated] = await db.update(trips).set(updates).where(eq(trips.id, id)).returning();
    return updated || undefined;
  }

  // Guests
  async getGuestsByTrip(tripId: string): Promise<Guest[]> {
    return db.select().from(guests).where(eq(guests.tripId, tripId));
  }

  async getGuest(id: string): Promise<Guest | undefined> {
    const [guest] = await db.select().from(guests).where(eq(guests.id, id));
    return guest || undefined;
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const [created] = await db.insert(guests).values(guest).returning();
    return created;
  }

  async updateGuest(id: string, updates: Partial<Guest>): Promise<Guest | undefined> {
    const [updated] = await db.update(guests).set(updates).where(eq(guests.id, id)).returning();
    return updated || undefined;
  }

  // Itinerary Blocks
  async getBlocksByTrip(tripId: string): Promise<ItineraryBlock[]> {
    return db.select().from(itineraryBlocks).where(eq(itineraryBlocks.trip_id, tripId));
  }

  async getBlock(id: string): Promise<ItineraryBlock | undefined> {
    const [block] = await db.select().from(itineraryBlocks).where(eq(itineraryBlocks.id, id));
    return block || undefined;
  }

  async createBlock(block: InsertItineraryBlock): Promise<ItineraryBlock> {
    const [created] = await db.insert(itineraryBlocks).values(block).returning();
    return created;
  }

  async updateBlock(id: string, updates: Partial<ItineraryBlock>): Promise<ItineraryBlock | undefined> {
    const [updated] = await db.update(itineraryBlocks).set(updates).where(eq(itineraryBlocks.id, id)).returning();
    return updated || undefined;
  }

  async deleteBlock(id: string): Promise<void> {
    await db.delete(itineraryBlocks).where(eq(itineraryBlocks.id, id));
  }

  // Tasks
  async getTasksByTrip(tripId: string): Promise<Task[]> {
    return db.select().from(tasks).where(eq(tasks.tripId, tripId));
  }

  async getTask(id: string): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const [created] = await db.insert(tasks).values(task).returning();
    return created;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task | undefined> {
    const [updated] = await db.update(tasks).set(updates).where(eq(tasks.id, id)).returning();
    return updated || undefined;
  }

  async deleteTask(id: string): Promise<void> {
    await db.delete(tasks).where(eq(tasks.id, id));
  }

  // Shipments
  async getShipmentsByTrip(tripId: string): Promise<Shipment[]> {
    return db.select().from(shipments).where(eq(shipments.tripId, tripId));
  }

  async getShipment(id: string): Promise<Shipment | undefined> {
    const [shipment] = await db.select().from(shipments).where(eq(shipments.id, id));
    return shipment || undefined;
  }

  async createShipment(shipment: InsertShipment): Promise<Shipment> {
    const [created] = await db.insert(shipments).values(shipment).returning();
    return created;
  }

  async updateShipment(id: string, updates: Partial<Shipment>): Promise<Shipment | undefined> {
    const [updated] = await db.update(shipments).set(updates).where(eq(shipments.id, id)).returning();
    return updated || undefined;
  }

  // Tournaments
  async getTournamentsByTrip(tripId: string): Promise<Tournament[]> {
    return db.select().from(tournaments).where(eq(tournaments.tripId, tripId));
  }

  async getTournament(id: string): Promise<Tournament | undefined> {
    const [tournament] = await db.select().from(tournaments).where(eq(tournaments.id, id));
    return tournament || undefined;
  }

  async createTournament(tournament: InsertTournament): Promise<Tournament> {
    const [created] = await db.insert(tournaments).values(tournament).returning();
    return created;
  }

  async updateTournament(id: string, updates: Partial<Tournament>): Promise<Tournament | undefined> {
    const [updated] = await db.update(tournaments).set(updates).where(eq(tournaments.id, id)).returning();
    return updated || undefined;
  }

  // Teams
  async getTeamsByTournament(tournamentId: string): Promise<Team[]> {
    return db.select().from(teams).where(eq(teams.tournamentId, tournamentId));
  }

  async getTeamsByTrip(tripId: string): Promise<Team[]> {
    const tripTournaments = await this.getTournamentsByTrip(tripId);
    const allTeams: Team[] = [];
    for (const t of tripTournaments) {
      const tournamentTeams = await this.getTeamsByTournament(t.id);
      allTeams.push(...tournamentTeams);
    }
    return allTeams;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [created] = await db.insert(teams).values(team).returning();
    return created;
  }

  // Rounds - now linked directly to trips (not tournaments) per production SQL
  async getRoundsByTournament(_tournamentId: string): Promise<Round[]> {
    // Deprecated: rounds now link to trips directly, not tournaments
    return [];
  }

  async getRoundsByTrip(tripId: string): Promise<Round[]> {
    return db.select().from(rounds).where(eq(rounds.trip_id, tripId));
  }

  async createRound(round: InsertRound): Promise<Round> {
    const [created] = await db.insert(rounds).values(round).returning();
    return created;
  }

  // Scores
  async getScoresByRound(roundId: string): Promise<Score[]> {
    return db.select().from(scores).where(eq(scores.roundId, roundId));
  }

  async getScoresByTrip(tripId: string): Promise<Score[]> {
    const tripRounds = await this.getRoundsByTrip(tripId);
    const allScores: Score[] = [];
    for (const r of tripRounds) {
      const roundScores = await this.getScoresByRound(r.id);
      allScores.push(...roundScores);
    }
    return allScores;
  }

  async createScore(score: InsertScore): Promise<Score> {
    const [created] = await db.insert(scores).values(score).returning();
    return created;
  }

  async updateScore(id: string, updates: Partial<Score>): Promise<Score | undefined> {
    const [updated] = await db.update(scores).set(updates).where(eq(scores.id, id)).returning();
    return updated || undefined;
  }

  // Merch Orders
  async getMerchOrdersByTrip(tripId: string): Promise<MerchOrder[]> {
    return db.select().from(merchOrders).where(eq(merchOrders.tripId, tripId));
  }

  async getMerchOrder(id: string): Promise<MerchOrder | undefined> {
    const [order] = await db.select().from(merchOrders).where(eq(merchOrders.id, id));
    return order || undefined;
  }

  async createMerchOrder(order: InsertMerchOrder): Promise<MerchOrder> {
    const [created] = await db.insert(merchOrders).values(order).returning();
    return created;
  }

  async updateMerchOrder(id: string, updates: Partial<MerchOrder>): Promise<MerchOrder | undefined> {
    const [updated] = await db.update(merchOrders).set(updates).where(eq(merchOrders.id, id)).returning();
    return updated || undefined;
  }

  // Guest Merch
  async getGuestMerchByTrip(tripId: string): Promise<GuestMerch[]> {
    const tripMerchOrders = await this.getMerchOrdersByTrip(tripId);
    const allGuestMerch: GuestMerch[] = [];
    for (const o of tripMerchOrders) {
      const orderGuestMerch = await db.select().from(guestMerch).where(eq(guestMerch.merchOrderId, o.id));
      allGuestMerch.push(...orderGuestMerch);
    }
    return allGuestMerch;
  }

  async createGuestMerch(gm: InsertGuestMerch): Promise<GuestMerch> {
    const [created] = await db.insert(guestMerch).values(gm).returning();
    return created;
  }

  // Issues
  async getIssuesByTrip(tripId: string): Promise<Issue[]> {
    return db.select().from(issues).where(eq(issues.tripId, tripId));
  }

  async createIssue(issue: InsertIssue): Promise<Issue> {
    const [created] = await db.insert(issues).values(issue).returning();
    return created;
  }

  async updateIssue(id: string, updates: Partial<Issue>): Promise<Issue | undefined> {
    const [updated] = await db.update(issues).set(updates).where(eq(issues.id, id)).returning();
    return updated || undefined;
  }

  // Announcements
  async getAnnouncementsByTrip(tripId: string): Promise<Announcement[]> {
    return db.select().from(announcements).where(eq(announcements.tripId, tripId));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
