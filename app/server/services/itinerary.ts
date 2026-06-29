// ============================================
// ITINERARY SERVICE
// Data access functions that can be swapped to Supabase
// ============================================

import type { ItineraryBlock } from '@shared/domain';
import { getItineraryByTripId, getItineraryBlockById, mockItinerary } from '../mocks';

/**
 * Get full itinerary for a trip
 */
export async function getTripItinerary(tripId: string): Promise<ItineraryBlock[]> {
  // TODO: Replace with Supabase query
  const blocks = getItineraryByTripId(tripId);
  
  // Normalize dates
  return blocks.map(block => ({
    ...block,
    startTime: new Date(block.startTime),
    endTime: new Date(block.endTime),
  }));
}

/**
 * Get a single itinerary block
 */
export async function getItineraryBlock(blockId: string): Promise<ItineraryBlock | null> {
  // TODO: Replace with Supabase query
  const block = getItineraryBlockById(blockId);
  if (!block) return null;
  
  return {
    ...block,
    startTime: new Date(block.startTime),
    endTime: new Date(block.endTime),
  };
}

/**
 * Get itinerary blocks for a specific day
 */
export async function getItineraryForDay(tripId: string, date: Date): Promise<ItineraryBlock[]> {
  const itinerary = await getTripItinerary(tripId);
  
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return itinerary.filter(block => {
    const blockStart = new Date(block.startTime);
    return blockStart >= startOfDay && blockStart <= endOfDay;
  });
}

/**
 * Get upcoming blocks (visible to guests)
 */
export async function getUpcomingBlocks(
  tripId: string, 
  limit: number = 5
): Promise<ItineraryBlock[]> {
  const itinerary = await getTripItinerary(tripId);
  const now = new Date();
  
  return itinerary
    .filter(block => 
      block.visibleToGuests && 
      block.status !== 'cancelled' &&
      new Date(block.endTime) > now
    )
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, limit);
}

/**
 * Get blocks that require action
 */
export async function getActionRequiredBlocks(tripId: string): Promise<ItineraryBlock[]> {
  const itinerary = await getTripItinerary(tripId);
  const now = new Date();
  
  return itinerary.filter(block => 
    block.requiresAction && 
    block.status !== 'complete' &&
    new Date(block.endTime) > now
  );
}

/**
 * Get blocks by type
 */
export async function getBlocksByType(
  tripId: string, 
  type: ItineraryBlock['type']
): Promise<ItineraryBlock[]> {
  const itinerary = await getTripItinerary(tripId);
  return itinerary.filter(block => block.type === type);
}

/**
 * Create a new itinerary block
 */
export async function createItineraryBlock(
  block: Omit<ItineraryBlock, 'id'>
): Promise<ItineraryBlock> {
  // TODO: Replace with Supabase insert
  const newBlock: ItineraryBlock = {
    ...block,
    id: `block-${Date.now()}`,
  };
  
  return newBlock;
}

/**
 * Update an itinerary block
 */
export async function updateItineraryBlock(
  blockId: string,
  updates: Partial<ItineraryBlock>
): Promise<ItineraryBlock | null> {
  // TODO: Replace with Supabase update
  const block = await getItineraryBlock(blockId);
  if (!block) return null;
  
  return { ...block, ...updates };
}

/**
 * Delete an itinerary block
 */
export async function deleteItineraryBlock(blockId: string): Promise<boolean> {
  // TODO: Replace with Supabase delete
  const block = await getItineraryBlock(blockId);
  return block !== null;
}

/**
 * Get blocks that depend on a given block
 */
export async function getDependentBlocks(
  tripId: string, 
  blockId: string
): Promise<ItineraryBlock[]> {
  const itinerary = await getTripItinerary(tripId);
  return itinerary.filter(block => block.dependsOn === blockId);
}
