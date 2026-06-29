import type { 
  ItineraryBlock, BlockFirmness, BlockType, BlockStatus,
  ItineraryBuilderBlock, ItineraryBlockType, ItineraryBlockCategory, ItineraryBlockStatus,
  BLOCK_DEFAULTS 
} from '@shared/domain';

// Helper to get dates relative to "now" for realistic demo
function getRelativeDate(daysFromNow: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Helper to get YYYY-MM-DD for days relative to today
function getRelativeDateString(daysFromNow: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

// Comprehensive itinerary with LOCKED, SOFT, and OPEN blocks
export const mockItinerary: ItineraryBlock[] = [
  // ========== DAY 1 (Today) ==========
  {
    id: 'block-001',
    tripId: 'trip-001',
    type: 'meal',
    title: 'Welcome Breakfast',
    description: 'Casual breakfast as group assembles',
    location: 'Carolina Dining Room',
    mapLink: 'https://maps.google.com/?q=pinehurst+carolina+hotel',
    startTime: getRelativeDate(0, 7, 30),
    endTime: getRelativeDate(0, 9, 0),
    bufferBefore: 0,
    bufferAfter: 30,
    status: 'complete',
    firmness: 'soft',
    confirmation: undefined,
    cost: 0,
    notes: 'Included with lodging',
    participants: undefined,
    dependsOn: undefined,
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-002',
    tripId: 'trip-001',
    type: 'tee_time',
    title: 'Round 1: Pinehurst No. 2',
    description: 'The flagship course. Walking only, caddies assigned.',
    location: 'Pinehurst No. 2',
    mapLink: 'https://maps.google.com/?q=pinehurst+no+2',
    startTime: getRelativeDate(0, 10, 30),
    endTime: getRelativeDate(0, 15, 30),
    bufferBefore: 45,
    bufferAfter: 30,
    status: 'upcoming',
    firmness: 'locked',
    vendorId: 'vendor-pinehurst',
    confirmation: 'PH2-2024-1847',
    cost: 850,
    notes: 'Tee times in 8-minute intervals. Group photo at 1st tee.',
    participants: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    dependsOn: undefined,
    visibleToGuests: true,
    requiresAction: true,
    actionLabel: 'View Tee Times',
  },
  {
    id: 'block-003',
    tripId: 'trip-001',
    type: 'meal',
    title: 'Dinner at The Deuce',
    description: 'Upscale casual. Smart casual dress code.',
    location: 'The Deuce at Pinehurst',
    mapLink: 'https://maps.google.com/?q=deuce+pinehurst',
    startTime: getRelativeDate(0, 19, 0),
    endTime: getRelativeDate(0, 21, 30),
    bufferBefore: 30,
    bufferAfter: 0,
    status: 'upcoming',
    firmness: 'soft',
    vendorId: 'vendor-deuce',
    confirmation: 'DEUCE-8847',
    cost: 95,
    notes: 'Window time 7-7:30pm. Final headcount needed by 4pm.',
    participants: undefined,
    dependsOn: 'block-002',
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-004',
    tripId: 'trip-001',
    type: 'activity',
    title: 'Ryder Room Cigars & Cards',
    description: 'Late night hang in the private lounge',
    location: 'Ryder Room, Manor Building',
    startTime: getRelativeDate(0, 21, 30),
    endTime: getRelativeDate(0, 24, 0),
    bufferBefore: 0,
    bufferAfter: 0,
    status: 'upcoming',
    firmness: 'open',
    notes: 'Optional. Cigars provided, BYOB after hours.',
    participants: ['member-001', 'member-002', 'member-004', 'member-006'],
    visibleToGuests: true,
    requiresAction: false,
  },

  // ========== DAY 2 (Tomorrow) ==========
  {
    id: 'block-005',
    tripId: 'trip-001',
    type: 'meal',
    title: 'Breakfast',
    description: 'Full breakfast before golf',
    location: 'Carolina Dining Room',
    startTime: getRelativeDate(1, 6, 30),
    endTime: getRelativeDate(1, 8, 0),
    bufferBefore: 0,
    bufferAfter: 30,
    status: 'upcoming',
    firmness: 'soft',
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-006',
    tripId: 'trip-001',
    type: 'tee_time',
    title: 'Round 2: Pinehurst No. 4',
    description: 'Gil Hanse design. Carts available.',
    location: 'Pinehurst No. 4',
    mapLink: 'https://maps.google.com/?q=pinehurst+no+4',
    startTime: getRelativeDate(1, 8, 30),
    endTime: getRelativeDate(1, 13, 0),
    bufferBefore: 30,
    bufferAfter: 30,
    status: 'upcoming',
    firmness: 'locked',
    vendorId: 'vendor-pinehurst',
    confirmation: 'PH4-2024-2931',
    cost: 425,
    notes: 'Closest to the pin contest on holes 5, 11, 17',
    participants: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    visibleToGuests: true,
    requiresAction: true,
    actionLabel: 'View Tee Times',
  },
  {
    id: 'block-007',
    tripId: 'trip-001',
    type: 'free_time',
    title: 'Afternoon Free Time',
    description: 'Pool, spa, putting green, or rest',
    location: 'Resort Grounds',
    startTime: getRelativeDate(1, 13, 30),
    endTime: getRelativeDate(1, 17, 30),
    bufferBefore: 0,
    bufferAfter: 0,
    status: 'upcoming',
    firmness: 'open',
    notes: 'Spa appointments available - book through concierge',
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-007a',
    tripId: 'trip-001',
    type: 'activity',
    title: 'VIP Putting Lesson',
    description: 'Private putting lesson with resort pro',
    location: 'Thistle Dhu Practice Facility',
    mapLink: 'https://maps.google.com/?q=pinehurst+thistle+dhu',
    startTime: getRelativeDate(1, 14, 0),
    endTime: getRelativeDate(1, 15, 30),
    bufferBefore: 15,
    bufferAfter: 0,
    status: 'upcoming',
    firmness: 'locked',
    vendorId: 'vendor-pinehurst-pro',
    confirmation: 'PRO-VIP-441',
    cost: 200,
    notes: 'Private lesson for VIP guests only',
    participants: ['member-001', 'member-006'],
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-007b',
    tripId: 'trip-001',
    type: 'activity',
    title: 'Team Red Strategy Session',
    description: 'Tournament strategy discussion over drinks',
    location: 'Ryder Cup Lounge',
    startTime: getRelativeDate(1, 16, 0),
    endTime: getRelativeDate(1, 17, 30),
    bufferBefore: 0,
    bufferAfter: 30,
    status: 'upcoming',
    firmness: 'soft',
    notes: 'Team captains discuss pairings for final round',
    participants: ['member-001', 'member-002', 'member-005'],
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-008',
    tripId: 'trip-001',
    type: 'meal',
    title: 'Group Dinner at 1895 Grille',
    description: 'Fine dining. Jacket suggested for gentlemen.',
    location: '1895 Grille',
    mapLink: 'https://maps.google.com/?q=1895+grille+pinehurst',
    startTime: getRelativeDate(1, 19, 30),
    endTime: getRelativeDate(1, 22, 0),
    bufferBefore: 30,
    bufferAfter: 0,
    status: 'upcoming',
    firmness: 'locked',
    vendorId: 'vendor-1895',
    confirmation: '1895-GRP-441',
    cost: 150,
    notes: 'Private dining room reserved. Prix fixe menu.',
    visibleToGuests: true,
    requiresAction: false,
  },

  // ========== DAY 3 ==========
  {
    id: 'block-009',
    tripId: 'trip-001',
    type: 'meal',
    title: 'Breakfast',
    location: 'Carolina Dining Room',
    startTime: getRelativeDate(2, 7, 0),
    endTime: getRelativeDate(2, 8, 30),
    bufferBefore: 0,
    bufferAfter: 30,
    status: 'upcoming',
    firmness: 'soft',
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-010',
    tripId: 'trip-001',
    type: 'tee_time',
    title: 'Final Round: Pinehurst No. 2',
    description: 'Championship round. Walking, caddie required.',
    location: 'Pinehurst No. 2',
    mapLink: 'https://maps.google.com/?q=pinehurst+no+2',
    startTime: getRelativeDate(2, 9, 0),
    endTime: getRelativeDate(2, 14, 0),
    bufferBefore: 30,
    bufferAfter: 60,
    status: 'upcoming',
    firmness: 'locked',
    vendorId: 'vendor-pinehurst',
    confirmation: 'PH2-2024-1893',
    cost: 850,
    notes: 'Tournament scoring applies. Awards at 19th hole.',
    participants: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    visibleToGuests: true,
    requiresAction: true,
    actionLabel: 'View Pairings',
  },
  {
    id: 'block-011',
    tripId: 'trip-001',
    type: 'activity',
    title: 'Awards Ceremony',
    description: 'Tournament results and prize distribution',
    location: 'Ryder Cup Lounge',
    startTime: getRelativeDate(2, 15, 0),
    endTime: getRelativeDate(2, 16, 30),
    bufferBefore: 0,
    bufferAfter: 30,
    status: 'upcoming',
    firmness: 'soft',
    notes: 'Trophies, prizes, and group photo',
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-012',
    tripId: 'trip-001',
    type: 'meal',
    title: 'Farewell Dinner',
    description: 'Casual final dinner together',
    location: 'The Tavern',
    startTime: getRelativeDate(2, 18, 30),
    endTime: getRelativeDate(2, 21, 0),
    bufferBefore: 30,
    bufferAfter: 0,
    status: 'upcoming',
    firmness: 'soft',
    confirmation: 'TAV-GRP-229',
    cost: 75,
    visibleToGuests: true,
    requiresAction: false,
  },

  // ========== DAY 4 (Departure) ==========
  {
    id: 'block-013',
    tripId: 'trip-001',
    type: 'meal',
    title: 'Grab-and-Go Breakfast',
    location: 'Manor Lobby',
    startTime: getRelativeDate(3, 6, 0),
    endTime: getRelativeDate(3, 10, 0),
    bufferBefore: 0,
    bufferAfter: 0,
    status: 'upcoming',
    firmness: 'open',
    notes: 'Coffee and pastries available for early departures',
    visibleToGuests: true,
    requiresAction: false,
  },
  {
    id: 'block-014',
    tripId: 'trip-001',
    type: 'transport',
    title: 'Airport Shuttles',
    description: 'Coordinated departures to RDU',
    location: 'Manor Entrance',
    mapLink: 'https://maps.google.com/?q=raleigh+durham+airport',
    startTime: getRelativeDate(3, 8, 0),
    endTime: getRelativeDate(3, 16, 0),
    bufferBefore: 15,
    bufferAfter: 0,
    status: 'upcoming',
    firmness: 'soft',
    notes: 'Shuttles at 8am, 10am, 12pm, 2pm based on flight times',
    visibleToGuests: true,
    requiresAction: true,
    actionLabel: 'View Shuttle',
  },
];

export function getItineraryByTripId(tripId: string): ItineraryBlock[] {
  return mockItinerary.filter(block => block.tripId === tripId);
}

export function getItineraryBlockById(blockId: string): ItineraryBlock | undefined {
  return mockItinerary.find(block => block.id === blockId);
}

// ============================================
// ITINERARY BUILDER (Drag & Drop)
// ============================================

const now = new Date();

export let mockBuilderBlocks: ItineraryBuilderBlock[] = [
  // ========== DAY 1 ==========
  {
    id: 'builder-001',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(0),
    sortOrder: 0,
    blockType: 'breakfast',
    category: 'meal',
    title: 'Welcome Breakfast',
    startTime: '07:30',
    duration: 90,
    location: 'Carolina Dining Room',
    notes: 'Casual breakfast as group assembles',
    status: 'soft',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-002',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(0),
    sortOrder: 1,
    blockType: 'tee_time',
    category: 'golf',
    title: 'Round 1: Pinehurst No. 2',
    startTime: '10:30',
    duration: 300,
    location: 'Pinehurst No. 2',
    notes: 'Walking only, caddies assigned. Tee times in 8-minute intervals.',
    confirmationNumber: 'PH2-2024-1847',
    status: 'locked',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-003',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(0),
    sortOrder: 2,
    blockType: 'dinner',
    category: 'meal',
    title: 'Dinner at The Deuce',
    startTime: '19:00',
    duration: 150,
    location: 'The Deuce at Pinehurst',
    notes: 'Smart casual dress code. Window time 7-7:30pm.',
    confirmationNumber: 'DEUCE-8847',
    status: 'soft',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-004',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(0),
    sortOrder: 3,
    blockType: 'cigars',
    category: 'activity',
    title: 'Ryder Room Cigars & Cards',
    startTime: '21:30',
    duration: 150,
    location: 'Ryder Room, Manor Building',
    notes: 'Optional. Cigars provided, BYOB after hours.',
    status: 'open',
    createdAt: now,
    updatedAt: now,
  },

  // ========== DAY 2 ==========
  {
    id: 'builder-005',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(1),
    sortOrder: 0,
    blockType: 'breakfast',
    category: 'meal',
    title: 'Breakfast',
    startTime: '06:30',
    duration: 90,
    location: 'Carolina Dining Room',
    notes: 'Full breakfast before golf',
    status: 'soft',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-006',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(1),
    sortOrder: 1,
    blockType: 'tee_time',
    category: 'golf',
    title: 'Round 2: Pinehurst No. 4',
    startTime: '08:30',
    duration: 270,
    location: 'Pinehurst No. 4',
    notes: 'Gil Hanse design. Carts available.',
    confirmationNumber: 'PH4-2024-2931',
    status: 'locked',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-007',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(1),
    sortOrder: 2,
    blockType: 'free_time',
    category: 'logistics',
    title: 'Afternoon Free Time',
    startTime: '13:30',
    duration: 240,
    location: 'Resort Grounds',
    notes: 'Pool, spa, putting green, or rest',
    status: 'open',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-008',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(1),
    sortOrder: 3,
    blockType: 'dinner',
    category: 'meal',
    title: 'Group Dinner at 1895 Grille',
    startTime: '19:30',
    duration: 150,
    location: '1895 Grille',
    notes: 'Fine dining. Jacket suggested for gentlemen.',
    confirmationNumber: '1895-GRP-441',
    status: 'locked',
    createdAt: now,
    updatedAt: now,
  },

  // ========== DAY 3 ==========
  {
    id: 'builder-009',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(2),
    sortOrder: 0,
    blockType: 'breakfast',
    category: 'meal',
    title: 'Breakfast',
    startTime: '07:00',
    duration: 90,
    location: 'Carolina Dining Room',
    status: 'soft',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-010',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(2),
    sortOrder: 1,
    blockType: 'tee_time',
    category: 'golf',
    title: 'Final Round: Pinehurst No. 2',
    startTime: '09:00',
    duration: 300,
    location: 'Pinehurst No. 2',
    notes: 'Championship round. Walking, caddie required.',
    confirmationNumber: 'PH2-2024-1893',
    status: 'locked',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-011',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(2),
    sortOrder: 2,
    blockType: 'group_meeting',
    category: 'logistics',
    title: 'Awards Ceremony',
    startTime: '15:00',
    duration: 90,
    location: 'Ryder Cup Lounge',
    notes: 'Tournament results and prize distribution',
    status: 'soft',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-012',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(2),
    sortOrder: 3,
    blockType: 'dinner',
    category: 'meal',
    title: 'Farewell Dinner',
    startTime: '18:30',
    duration: 150,
    location: 'The Tavern',
    notes: 'Casual final dinner together',
    confirmationNumber: 'TAV-GRP-229',
    status: 'soft',
    createdAt: now,
    updatedAt: now,
  },

  // ========== DAY 4 (Departure) ==========
  {
    id: 'builder-013',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(3),
    sortOrder: 0,
    blockType: 'breakfast',
    category: 'meal',
    title: 'Grab-and-Go Breakfast',
    startTime: '06:00',
    duration: 240,
    location: 'Manor Lobby',
    notes: 'Coffee and pastries available for early departures',
    status: 'open',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-014',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(3),
    sortOrder: 1,
    blockType: 'check_out',
    category: 'lodging',
    title: 'Check Out',
    startTime: '11:00',
    duration: 30,
    location: 'Manor Entrance',
    status: 'soft',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'builder-015',
    tripId: 'trip-001',
    dayDate: getRelativeDateString(3),
    sortOrder: 2,
    blockType: 'shuttle',
    category: 'transport',
    title: 'Airport Shuttles',
    startTime: '08:00',
    duration: 480,
    location: 'Manor Entrance to RDU',
    notes: 'Shuttles at 8am, 10am, 12pm, 2pm based on flight times',
    status: 'soft',
    createdAt: now,
    updatedAt: now,
  },
];

// Builder block CRUD operations
export function getBuilderBlocksByTrip(tripId: string): ItineraryBuilderBlock[] {
  return mockBuilderBlocks
    .filter(block => block.tripId === tripId)
    .sort((a, b) => {
      // Sort by day first, then by sortOrder
      if (a.dayDate !== b.dayDate) {
        return a.dayDate.localeCompare(b.dayDate);
      }
      return a.sortOrder - b.sortOrder;
    });
}

export function createBuilderBlock(
  tripId: string,
  block: Omit<ItineraryBuilderBlock, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>
): ItineraryBuilderBlock {
  // Shift existing blocks at or after the insertion position
  mockBuilderBlocks
    .filter(b => b.dayDate === block.dayDate && b.sortOrder >= block.sortOrder)
    .forEach(b => {
      b.sortOrder += 1;
    });
  
  const newBlock: ItineraryBuilderBlock = {
    ...block,
    id: `builder-${Date.now()}`,
    tripId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockBuilderBlocks.push(newBlock);
  
  // Re-index to normalize sort orders
  mockBuilderBlocks
    .filter(b => b.dayDate === block.dayDate)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((b, idx) => {
      b.sortOrder = idx;
    });
  
  return newBlock;
}

export function updateBuilderBlock(
  blockId: string,
  updates: Partial<Omit<ItineraryBuilderBlock, 'id' | 'tripId' | 'createdAt'>>
): ItineraryBuilderBlock | null {
  const index = mockBuilderBlocks.findIndex(b => b.id === blockId);
  if (index === -1) return null;
  
  mockBuilderBlocks[index] = {
    ...mockBuilderBlocks[index],
    ...updates,
    updatedAt: new Date(),
  };
  return mockBuilderBlocks[index];
}

export function deleteBuilderBlock(blockId: string): boolean {
  const index = mockBuilderBlocks.findIndex(b => b.id === blockId);
  if (index === -1) return false;
  mockBuilderBlocks.splice(index, 1);
  return true;
}

export function reorderBuilderBlocks(
  tripId: string,
  dayDate: string,
  blockIds: string[]
): ItineraryBuilderBlock[] {
  // Update sortOrder for each block in the provided list
  // This handles both same-day reordering and cross-day moves
  blockIds.forEach((id, index) => {
    const block = mockBuilderBlocks.find(b => b.id === id);
    if (block) {
      block.dayDate = dayDate;  // Update day (for cross-day moves)
      block.sortOrder = index;  // Update order within day
      block.updatedAt = new Date();
    }
  });
  
  return getBuilderBlocksByTrip(tripId);
}

// Move a single block to a different day at a specific position
// This pushes existing blocks at that position down
export function moveBlockToDay(
  blockId: string,
  newDayDate: string,
  newSortOrder: number
): ItineraryBuilderBlock | null {
  const block = mockBuilderBlocks.find(b => b.id === blockId);
  if (!block) return null;
  
  const oldDayDate = block.dayDate;
  const oldSortOrder = block.sortOrder;
  
  // First, remove the block from its current position (re-index old day)
  if (oldDayDate !== newDayDate) {
    mockBuilderBlocks
      .filter(b => b.dayDate === oldDayDate && b.id !== blockId)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .forEach((b, idx) => {
        b.sortOrder = idx;
      });
  }
  
  // Shift blocks in the target day at or after the insertion point
  mockBuilderBlocks
    .filter(b => b.dayDate === newDayDate && b.id !== blockId && b.sortOrder >= newSortOrder)
    .forEach(b => {
      b.sortOrder += 1;
    });
  
  // Insert the block at the target position
  block.dayDate = newDayDate;
  block.sortOrder = newSortOrder;
  block.updatedAt = new Date();
  
  // Re-index to clean up any gaps (normalize sort orders)
  mockBuilderBlocks
    .filter(b => b.dayDate === newDayDate)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((b, idx) => {
      b.sortOrder = idx;
    });
  
  return block;
}
