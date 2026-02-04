// ============================================
// BORING GOLF - Gravity Well Engine
// Pure TypeScript utility for computing NOW/NEXT/LATER
// Can be reused in server routes or Edge Functions
// ============================================

import type { 
  ItineraryBlock, 
  GravityWellState, 
  GravityItem, 
  VisibilityWindow,
  Trip
} from './domain';

// Default visibility windows by block type
const DEFAULT_VISIBILITY_WINDOWS: Record<string, VisibilityWindow> = {
  tee_time: {
    showAsNowMinutesBefore: 45,   // Show as NOW 45 min before tee time
    showAsNextMinutesBefore: 180, // Show as NEXT up to 3 hours before
    hideAfterComplete: true,
  },
  meal: {
    showAsNowMinutesBefore: 30,
    showAsNextMinutesBefore: 120,
    hideAfterComplete: true,
  },
  transport: {
    showAsNowMinutesBefore: 60,   // Earlier for transport - need buffer
    showAsNextMinutesBefore: 240,
    hideAfterComplete: true,
  },
  lodging: {
    showAsNowMinutesBefore: 30,
    showAsNextMinutesBefore: 120,
    hideAfterComplete: false,
  },
  activity: {
    showAsNowMinutesBefore: 30,
    showAsNextMinutesBefore: 120,
    hideAfterComplete: true,
  },
  free_time: {
    showAsNowMinutesBefore: 15,
    showAsNextMinutesBefore: 60,
    hideAfterComplete: true,
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getVisibilityWindow(blockType: string): VisibilityWindow {
  return DEFAULT_VISIBILITY_WINDOWS[blockType] || DEFAULT_VISIBILITY_WINDOWS.activity;
}

function getMinutesDifference(time1: Date, time2: Date): number {
  return Math.round((time2.getTime() - time1.getTime()) / (1000 * 60));
}

function formatTimeUntil(minutes: number): string {
  if (minutes < 0) {
    const absMinutes = Math.abs(minutes);
    if (absMinutes < 60) return `${absMinutes}m ago`;
    const hours = Math.floor(absMinutes / 60);
    const mins = absMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}m ago` : `${hours}h ago`;
  }
  
  if (minutes === 0) return 'Now';
  if (minutes < 60) return `in ${minutes}m`;
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    if (remainingHours > 0) return `in ${days}d ${remainingHours}h`;
    return `in ${days}d`;
  }
  
  return mins > 0 ? `in ${hours}h ${mins}m` : `in ${hours}h`;
}

function formatDisplayTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function formatDisplayDate(date: Date, currentDate: Date): string | undefined {
  const blockDay = new Date(date).setHours(0, 0, 0, 0);
  const today = new Date(currentDate).setHours(0, 0, 0, 0);
  const tomorrow = today + 24 * 60 * 60 * 1000;
  
  if (blockDay === today) return undefined; // Same day, no date needed
  if (blockDay === tomorrow) return 'Tomorrow';
  
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}

function determineUrgency(minutesUntil: number): 'immediate' | 'soon' | 'upcoming' | 'later' {
  if (minutesUntil <= 0) return 'immediate';
  if (minutesUntil <= 30) return 'soon';
  if (minutesUntil <= 120) return 'upcoming';
  return 'later';
}

function isBlockVisible(block: ItineraryBlock): boolean {
  return block.visibleToGuests && block.status !== 'cancelled';
}

function isBlockComplete(block: ItineraryBlock, currentTime: Date): boolean {
  return block.status === 'complete' || currentTime > block.endTime;
}

function isBlockInProgress(block: ItineraryBlock, currentTime: Date): boolean {
  return currentTime >= block.startTime && currentTime <= block.endTime;
}

function getTripDay(currentTime: Date, tripStart: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = currentTime.getTime() - tripStart.getTime();
  return Math.floor(diff / msPerDay) + 1;
}

function getTotalDays(tripStart: Date, tripEnd: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = tripEnd.getTime() - tripStart.getTime();
  return Math.ceil(diff / msPerDay) + 1;
}

// ============================================
// STATE SENTENCE GENERATION
// ============================================

function generateStateSentence(
  now: GravityItem | null,
  next: GravityItem | null,
  tripDay: number,
  totalDays: number,
  currentTime: Date
): string {
  const hour = currentTime.getHours();
  
  // Early morning
  if (hour < 7) {
    return 'Rest up. The day ahead awaits.';
  }
  
  // If we have a NOW item
  if (now) {
    if (now.block.type === 'tee_time') {
      if (now.urgency === 'immediate') {
        return `On the tee. ${now.block.title.replace('Round ', 'R')}`;
      }
      return `Heading to the first tee. ${now.timeUntil}`;
    }
    
    if (now.block.type === 'meal') {
      if (now.urgency === 'immediate') {
        return `At ${now.block.location || 'dinner'}`;
      }
      return `${now.block.title} ${now.timeUntil}`;
    }
    
    if (now.block.type === 'transport') {
      return `Transport departing ${now.timeUntil}`;
    }
    
    return now.block.title;
  }
  
  // If we have NEXT but no NOW
  if (next) {
    if (next.block.type === 'tee_time') {
      return `Next up: ${next.block.title.replace('Round ', 'R')}`;
    }
    
    if (next.block.type === 'meal') {
      return `${next.block.title} ${next.timeUntil}`;
    }
    
    return `${next.block.title} ${next.timeUntil}`;
  }
  
  // Evening wind-down
  if (hour >= 21) {
    return 'Day complete. Tomorrow awaits.';
  }
  
  // Free time / no immediate items
  if (tripDay === 1) {
    return 'Welcome to the trip. Settle in.';
  }
  
  if (tripDay === totalDays) {
    return 'Final day. Safe travels home.';
  }
  
  return 'Free time. Enjoy the grounds.';
}

// ============================================
// MAIN GRAVITY WELL COMPUTATION
// ============================================

export interface ComputeGravityWellOptions {
  currentTime?: Date;
  trip: Pick<Trip, 'startDate' | 'endDate'>;
  itinerary: ItineraryBlock[];
  userId?: string; // For participant filtering
}

export interface ComputeGravityStateOptions {
  tripStartDate?: Date;
  tripEndDate?: Date;
  userId?: string;
}

/**
 * Pure function to compute gravity state from itinerary items.
 * This is the canonical implementation used by both server and client.
 */
export function computeGravityState(
  items: ItineraryBlock[],
  now: Date,
  _timezone?: string,
  _visibilityRules?: Record<string, VisibilityWindow>,
  options?: ComputeGravityStateOptions
): GravityWellState {
  // Derive trip dates from items if not provided
  const derivedDates = items.length > 0 
    ? { 
        start: new Date(Math.min(...items.map(i => i.startTime.getTime()))),
        end: new Date(Math.max(...items.map(i => i.endTime.getTime())))
      }
    : { start: now, end: now };
  
  return computeGravityWell({
    currentTime: now,
    trip: {
      startDate: options?.tripStartDate || derivedDates.start,
      endDate: options?.tripEndDate || derivedDates.end,
    },
    itinerary: items,
    userId: options?.userId,
  });
}

/**
 * Legacy function - delegates to computeGravityState
 */
export function computeGravityWell(options: ComputeGravityWellOptions): GravityWellState {
  const { trip, itinerary, userId } = options;
  const currentTime = options.currentTime || new Date();
  
  // Filter to visible blocks
  let visibleBlocks = itinerary
    .filter(isBlockVisible)
    .filter(block => {
      // If userId provided, filter to blocks where user is participant (or no participants specified)
      if (userId && block.participants && block.participants.length > 0) {
        return block.participants.includes(userId);
      }
      return true;
    })
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  
  // Remove completed blocks based on visibility rules
  visibleBlocks = visibleBlocks.filter(block => {
    const window = getVisibilityWindow(block.type);
    if (window.hideAfterComplete && isBlockComplete(block, currentTime)) {
      return false;
    }
    return true;
  });
  
  let now: GravityItem | null = null;
  let next: GravityItem | null = null;
  const later: GravityItem[] = [];
  
  for (const block of visibleBlocks) {
    const window = getVisibilityWindow(block.type);
    const minutesUntilStart = getMinutesDifference(currentTime, block.startTime);
    const isInProgress = isBlockInProgress(block, currentTime);
    
    // Determine if this block should be NOW
    const shouldBeNow = isInProgress || 
      (minutesUntilStart >= 0 && minutesUntilStart <= window.showAsNowMinutesBefore);
    
    // Determine if this block should be NEXT
    const shouldBeNext = !shouldBeNow && 
      minutesUntilStart > 0 && 
      minutesUntilStart <= window.showAsNextMinutesBefore;
    
    const gravityItem: GravityItem = {
      block,
      displayTime: formatDisplayTime(block.startTime),
      displayDate: formatDisplayDate(block.startTime, currentTime),
      timeUntil: formatTimeUntil(minutesUntilStart),
      urgency: determineUrgency(minutesUntilStart),
      actionRequired: block.requiresAction || false,
    };
    
    if (shouldBeNow && !now) {
      now = gravityItem;
    } else if (shouldBeNext && !next) {
      next = gravityItem;
    } else if (minutesUntilStart > 0) {
      // Only add future items to LATER
      later.push(gravityItem);
    }
  }
  
  // If we don't have a NEXT, pull from LATER
  if (!next && later.length > 0) {
    next = later.shift()!;
  }
  
  const tripDay = getTripDay(currentTime, trip.startDate);
  const totalDays = getTotalDays(trip.startDate, trip.endDate);
  
  const stateSentence = generateStateSentence(now, next, tripDay, totalDays, currentTime);
  
  return {
    stateSentence,
    now,
    next,
    later,
    currentTime,
    tripDay: Math.max(1, Math.min(tripDay, totalDays)),
    totalDays,
  };
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { 
  formatTimeUntil, 
  formatDisplayTime, 
  formatDisplayDate,
  getMinutesDifference,
  getTripDay,
  getTotalDays,
  getVisibilityWindow,
};

// Type guard for checking if gravity state has content
export function hasUpcomingItems(state: GravityWellState): boolean {
  return state.now !== null || state.next !== null || state.later.length > 0;
}

// Get all items as a flat array (useful for timeline views)
export function getAllGravityItems(state: GravityWellState): GravityItem[] {
  const items: GravityItem[] = [];
  if (state.now) items.push(state.now);
  if (state.next) items.push(state.next);
  items.push(...state.later);
  return items;
}

// Check if any item requires action
export function hasActionRequired(state: GravityWellState): boolean {
  return getAllGravityItems(state).some(item => item.actionRequired);
}
