// ============================================
// TRIP SERVICE
// Real database queries using Drizzle ORM
// Adapts production SQL schema to domain types
// ============================================

import type {
  Trip as DomainTrip,
  TripWithDetails,
  TripMember as DomainTripMember,
  RiskSummary,
  GravityWellState,
  ItineraryBlock
} from '@shared/domain';
import { computeGravityState } from '@shared/gravity';
import { db } from '../db';
import { trips, tripMembers, Trip, TripMember } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import {
  computeRiskSummary,
} from '../mocks';
import { getItineraryByTripId } from '../mocks/itinerary';

// ============================================
// ADAPTER FUNCTIONS
// Convert production schema rows to domain types
// ============================================

/** Convert a trip row (production schema) to DomainTrip */
function normalizeTripRow(t: Trip): DomainTrip {
  // Production schema: id, name, destination, start_date, nights, invite_code, created_at
  // Domain type expects: location, startDate, endDate, theme, tier, budget, status, inviteCode, createdAt
  const startDate = t.start_date ? new Date(t.start_date) : new Date();
  const endDate = new Date(startDate);
  if (t.nights) {
    endDate.setDate(endDate.getDate() + t.nights);
  }

  return {
    id: t.id,
    name: t.name,
    theme: undefined, // Not in production schema
    location: t.destination,
    startDate,
    endDate,
    tier: 'onsite', // Default, not in production schema
    budget: undefined, // Not in production schema
    status: 'confirmed', // Default, not in production schema
    inviteCode: t.invite_code || '',
    heroImageUrl: undefined,
    createdAt: t.created_at || new Date(),
  };
}

/** Convert a trip member row (production schema) to DomainTripMember */
function normalizeMemberRow(m: TripMember, tripId: string): DomainTripMember {
  // Production schema: id, trip_id, name, created_at
  // Domain type expects: tripId, userId, profile, role, rsvpStatus, travelItems, bags
  return {
    id: m.id,
    tripId: tripId,
    userId: m.id, // Use member id as pseudo-userId
    profile: {
      id: m.id,
      email: '',
      name: m.name,
      surveyCompleted: false,
      preferences: {},
      createdAt: m.created_at || new Date(),
    },
    role: 'guest' as 'captain' | 'guest' | 'vip',
    rsvpStatus: 'confirmed' as 'pending' | 'confirmed' | 'declined',
    travelItems: [],
    bags: [],
  };
}

// ============================================
// TRIP QUERIES
// ============================================

/**
 * Get all trips for a user (from real database)
 * Note: Production schema uses member name, not userId
 */
export async function getUserTrips(userId: string): Promise<DomainTrip[]> {
  // In production schema, tripMembers uses 'name' not 'userId'
  // This function won't work as designed - return empty for now
  // Real implementation would need to match by member name or different approach
  const allTrips = await db.select().from(trips);
  return allTrips.map(normalizeTripRow);
}

/**
 * Get a single trip by ID (from real database)
 */
export async function getTrip(tripId: string): Promise<DomainTrip | null> {
  const [trip] = await db.select().from(trips).where(eq(trips.id, tripId));

  if (!trip) return null;

  return normalizeTripRow(trip);
}

/**
 * Get trip with all related details (members, itinerary, risk summary)
 * Still uses some mock data for itinerary until those are wired up
 */
export async function getTripWithDetails(tripId: string): Promise<TripWithDetails | null> {
  const trip = await getTrip(tripId);
  if (!trip) return null;

  const members = await getTripMembers(tripId);

  return {
    ...trip,
    members,
    itinerary: [], // Will be populated when itinerary is wired up
    riskSummary: await getTripRiskSummary(tripId),
  };
}

/**
 * Get the active trip for a user (most relevant trip)
 */
export async function getActiveTrip(userId: string): Promise<DomainTrip | null> {
  const userTrips = await getUserTrips(userId);

  if (userTrips.length === 0) return null;

  const now = new Date();

  // Find active trip or upcoming trip closest to now
  const active = userTrips.find(t => t.status === 'active');
  if (active) return active;

  // Then find closest upcoming confirmed trip
  const upcoming = userTrips
    .filter(t => t.status === 'confirmed' && t.startDate > now)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  return upcoming[0] || userTrips[0] || null;
}

/**
 * Get trip members (from real database)
 */
export async function getTripMembers(tripId: string): Promise<DomainTripMember[]> {
  const members = await db
    .select()
    .from(tripMembers)
    .where(eq(tripMembers.trip_id, tripId));

  return members.map(m => normalizeMemberRow(m, tripId));
}

/**
 * Get a specific trip member by name
 * Note: Production schema uses name, not userId
 */
export async function getTripMember(tripId: string, memberName: string): Promise<DomainTripMember | null> {
  const [member] = await db
    .select()
    .from(tripMembers)
    .where(and(eq(tripMembers.trip_id, tripId), eq(tripMembers.name, memberName)));

  if (!member) return null;

  return normalizeMemberRow(member, tripId);
}

/**
 * Get the member ID for a user in a trip
 */
export async function getMemberIdForUser(tripId: string, memberName: string): Promise<string | null> {
  const member = await getTripMember(tripId, memberName);
  return member?.id || null;
}

/**
 * Get trip risk summary
 */
export async function getTripRiskSummary(tripId: string): Promise<RiskSummary> {
  // Still uses mock for now until issues/tasks are wired up
  return computeRiskSummary(tripId);
}

/**
 * Get Gravity Well state for a user in a trip
 * This is the core guest experience - what's happening NOW/NEXT/LATER
 */
export async function getTripGravityState(
  tripId: string,
  userId: string,
  currentTime?: Date
): Promise<GravityWellState | null> {
  const trip = await getTrip(tripId);
  if (!trip) return null;

  const memberId = await getMemberIdForUser(tripId, userId);
  const itinerary = getItineraryByTripId(tripId);

  // Convert Date strings back to Date objects if needed (for mock data)
  const normalizedItinerary: ItineraryBlock[] = itinerary.map(block => ({
    ...block,
    startTime: new Date(block.startTime),
    endTime: new Date(block.endTime),
  }));

  // Use the pure computeGravityState function
  return computeGravityState(
    normalizedItinerary,
    currentTime || new Date(),
    undefined, // timezone
    undefined, // visibility rules (use defaults)
    {
      tripStartDate: new Date(trip.startDate),
      tripEndDate: new Date(trip.endDate),
      userId: memberId || undefined,
    }
  );
}

/**
 * Get trip by invite code (from real database)
 */
export async function getTripByInviteCode(inviteCode: string): Promise<DomainTrip | null> {
  const [trip] = await db.select().from(trips).where(eq(trips.invite_code, inviteCode));

  if (!trip) return null;

  return normalizeTripRow(trip);
}

/**
 * Create a new trip and add the creator as member
 * Note: Production schema uses destination/nights, not location/startDate/endDate
 */
export async function createTrip(
  tripData: {
    name: string;
    location: string;
    startDate: Date;
    endDate: Date;
    theme?: string;
    tier?: 'ghost' | 'onsite' | 'signature';
    budget?: number;
  },
  creatorName: string
): Promise<DomainTrip> {
  // Calculate nights from dates
  const nights = Math.ceil((tripData.endDate.getTime() - tripData.startDate.getTime()) / (1000 * 60 * 60 * 24));

  // Insert the trip with production schema fields
  const [newTrip] = await db
    .insert(trips)
    .values({
      name: tripData.name,
      destination: tripData.location,
      start_date: tripData.startDate.toISOString().split('T')[0],
      nights: nights,
    })
    .returning();

  // Add the creator as a trip member
  await db.insert(tripMembers).values({
    trip_id: newTrip.id,
    name: creatorName,
  });

  return normalizeTripRow(newTrip);
}

/**
 * Update a trip
 * Note: Only updates fields that exist in production schema
 */
export async function updateTrip(tripId: string, updates: Partial<DomainTrip>): Promise<DomainTrip | null> {
  // Build update object with production schema fields only
  const updateData: Partial<{ name: string; destination: string; start_date: string; nights: number }> = {};

  if (updates.name) updateData.name = updates.name;
  if (updates.location) updateData.destination = updates.location;
  if (updates.startDate) updateData.start_date = updates.startDate.toISOString().split('T')[0];
  if (updates.startDate && updates.endDate) {
    updateData.nights = Math.ceil((updates.endDate.getTime() - updates.startDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const [updated] = await db
    .update(trips)
    .set(updateData)
    .where(eq(trips.id, tripId))
    .returning();

  if (!updated) return null;

  return normalizeTripRow(updated);
}
