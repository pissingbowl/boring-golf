import type { Trip, TripMember, TripWithDetails, RiskSummary } from '@shared/domain';
import { mockUsers } from './users';
import { mockItinerary } from './itinerary';
import { mockTravelItems, mockBags } from './logistics';
import { mockIssues } from './issues';

// Helper to get dates relative to "now" for realistic demo
function getRelativeDate(daysFromNow: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Active trip - Pinehurst Invitational
export const activeTrip: Trip = {
  id: 'trip-001',
  name: 'Pinehurst Invitational',
  theme: 'The Donald Ross Experience',
  location: 'Pinehurst, NC',
  startDate: getRelativeDate(0, 6, 0), // Started today at 6 AM
  endDate: getRelativeDate(3, 18, 0),  // Ends in 3 days
  tier: 'signature',
  budget: 12000,
  status: 'active',
  inviteCode: 'PINE2024',
  heroImageUrl: undefined,
  createdAt: new Date('2024-09-01T10:00:00Z'),
};

// Trip members with full details
export const tripMembers: TripMember[] = [
  {
    id: 'member-001',
    tripId: 'trip-001',
    userId: 'user-002',
    profile: mockUsers[1], // Marcus Chen
    role: 'captain',
    rsvpStatus: 'confirmed',
    arrivalDate: getRelativeDate(-1, 14, 0),
    departureDate: getRelativeDate(4, 10, 0),
    roomAssignment: 'Manor 201',
    teamId: 'team-red',
    travelItems: mockTravelItems.filter(t => t.tripMemberId === 'member-001'),
    bags: mockBags.filter(b => b.tripMemberId === 'member-001'),
  },
  {
    id: 'member-002',
    tripId: 'trip-001',
    userId: 'user-001',
    profile: mockUsers[0], // Jake Morrison (primary user)
    role: 'guest',
    rsvpStatus: 'confirmed',
    arrivalDate: getRelativeDate(0, 8, 30),
    departureDate: getRelativeDate(3, 16, 0),
    roomAssignment: 'Manor 203',
    teamId: 'team-red',
    travelItems: mockTravelItems.filter(t => t.tripMemberId === 'member-002'),
    bags: mockBags.filter(b => b.tripMemberId === 'member-002'),
  },
  {
    id: 'member-003',
    tripId: 'trip-001',
    userId: 'user-003',
    profile: mockUsers[2], // Devon Williams
    role: 'guest',
    rsvpStatus: 'confirmed',
    arrivalDate: getRelativeDate(0, 10, 15),
    departureDate: getRelativeDate(3, 14, 0),
    roomAssignment: 'Manor 205',
    teamId: 'team-blue',
    travelItems: mockTravelItems.filter(t => t.tripMemberId === 'member-003'),
    bags: mockBags.filter(b => b.tripMemberId === 'member-003'),
  },
  {
    id: 'member-004',
    tripId: 'trip-001',
    userId: 'user-004',
    profile: mockUsers[3], // Ryan O'Connor
    role: 'guest',
    rsvpStatus: 'confirmed',
    arrivalDate: getRelativeDate(-1, 18, 0),
    departureDate: getRelativeDate(4, 8, 0),
    roomAssignment: 'Manor 207',
    teamId: 'team-blue',
    travelItems: mockTravelItems.filter(t => t.tripMemberId === 'member-004'),
    bags: mockBags.filter(b => b.tripMemberId === 'member-004'),
  },
  {
    id: 'member-005',
    tripId: 'trip-001',
    userId: 'user-005',
    profile: mockUsers[4], // Tommy Nguyen
    role: 'guest',
    rsvpStatus: 'confirmed',
    arrivalDate: getRelativeDate(0, 9, 45),
    departureDate: getRelativeDate(3, 15, 30),
    roomAssignment: 'Manor 209',
    teamId: 'team-red',
    travelItems: mockTravelItems.filter(t => t.tripMemberId === 'member-005'),
    bags: mockBags.filter(b => b.tripMemberId === 'member-005'),
  },
  {
    id: 'member-006',
    tripId: 'trip-001',
    userId: 'user-006',
    profile: mockUsers[5], // Alex Hartman
    role: 'vip',
    rsvpStatus: 'confirmed',
    arrivalDate: getRelativeDate(0, 11, 0),
    departureDate: getRelativeDate(3, 12, 0),
    roomAssignment: 'Manor Suite A',
    teamId: 'team-blue',
    travelItems: mockTravelItems.filter(t => t.tripMemberId === 'member-006'),
    bags: mockBags.filter(b => b.tripMemberId === 'member-006'),
  },
];

// Risk summary for dashboard
export function computeRiskSummary(tripId: string): RiskSummary {
  const tripIssues = mockIssues.filter(i => i.tripId === tripId && i.status !== 'resolved');
  
  return {
    totalRisks: tripIssues.length,
    criticalCount: tripIssues.filter(i => i.severity === 'critical').length,
    highCount: tripIssues.filter(i => i.severity === 'high').length,
    mediumCount: tripIssues.filter(i => i.severity === 'medium').length,
    lowCount: tripIssues.filter(i => i.severity === 'low').length,
    recentIssues: tripIssues.slice(0, 3),
    pendingTasks: 4,
    shipmentIssues: 1,
  };
}

export function getTripWithDetails(tripId: string): TripWithDetails | undefined {
  if (tripId !== activeTrip.id) return undefined;
  
  return {
    ...activeTrip,
    members: tripMembers,
    itinerary: mockItinerary,
    riskSummary: computeRiskSummary(tripId),
  };
}

export const allTrips: Trip[] = [activeTrip];

// ============================================
// MEMBER MANAGEMENT FUNCTIONS
// ============================================

let memberIdCounter = 100;

export function inviteMember(
  tripId: string, 
  email: string, 
  name?: string, 
  role: 'guest' | 'captain' = 'guest'
): TripMember {
  memberIdCounter++;
  const memberId = `member-${memberIdCounter}`;
  const userId = `user-${memberIdCounter}`;
  
  const newMember: TripMember = {
    id: memberId,
    tripId,
    userId,
    profile: {
      id: userId,
      email,
      name: name || email.split('@')[0],
      surveyCompleted: false,
      preferences: {},
      createdAt: new Date(),
    },
    role,
    rsvpStatus: 'pending',
    travelItems: [],
    bags: [],
  };
  
  tripMembers.push(newMember);
  return newMember;
}

export function updateMember(
  memberId: string, 
  updates: { roomAssignment?: string; role?: 'guest' | 'captain' | 'vip'; rsvpStatus?: 'pending' | 'confirmed' | 'declined' }
): TripMember | undefined {
  const memberIndex = tripMembers.findIndex(m => m.id === memberId);
  if (memberIndex === -1) return undefined;
  
  if (updates.roomAssignment !== undefined) {
    tripMembers[memberIndex].roomAssignment = updates.roomAssignment;
  }
  if (updates.role !== undefined) {
    tripMembers[memberIndex].role = updates.role;
  }
  if (updates.rsvpStatus !== undefined) {
    tripMembers[memberIndex].rsvpStatus = updates.rsvpStatus;
  }
  
  return tripMembers[memberIndex];
}

export function removeMember(memberId: string): boolean {
  const memberIndex = tripMembers.findIndex(m => m.id === memberId);
  if (memberIndex === -1) return false;
  
  tripMembers.splice(memberIndex, 1);
  return true;
}

export function changeMemberRole(memberId: string, newRole: 'guest' | 'captain' | 'vip'): TripMember | undefined {
  const member = tripMembers.find(m => m.id === memberId);
  if (!member) return undefined;
  
  member.role = newRole;
  return member;
}
