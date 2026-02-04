// ============================================
// BORING GOLF - Ledger Mock Data
// ============================================

import type { 
  LedgerEntry, 
  LedgerBalance, 
  LedgerSummary,
  Settlement,
  PaymentMethod 
} from '../../shared/domain';
import { tripMembers } from './trips';

export const mockPaymentMethods: PaymentMethod[] = [
  { id: 'pm-1', type: 'venmo', label: 'Venmo', details: '@golf-ops' },
  { id: 'pm-2', type: 'zelle', label: 'Zelle', details: 'golfops@email.com' },
  { id: 'pm-3', type: 'cash', label: 'Cash' },
  { id: 'pm-4', type: 'card', label: 'Card on File' },
];

export const mockLedgerEntries: LedgerEntry[] = [
  {
    id: 'ledger-001',
    tripId: 'trip-001',
    memberId: 'member-001',
    type: 'expense',
    category: 'food',
    description: 'Welcome Dinner at The Deuce',
    amount: 95,
    date: new Date('2025-12-29T21:00:00Z'),
    createdAt: new Date('2025-12-29T21:30:00Z'),
  },
  {
    id: 'ledger-002',
    tripId: 'trip-001',
    memberId: 'member-002',
    type: 'expense',
    category: 'food',
    description: 'Welcome Dinner at The Deuce',
    amount: 95,
    date: new Date('2025-12-29T21:00:00Z'),
    createdAt: new Date('2025-12-29T21:30:00Z'),
  },
  {
    id: 'ledger-003',
    tripId: 'trip-001',
    memberId: 'member-003',
    type: 'expense',
    category: 'food',
    description: 'Welcome Dinner at The Deuce',
    amount: 95,
    date: new Date('2025-12-29T21:00:00Z'),
    createdAt: new Date('2025-12-29T21:30:00Z'),
  },
  {
    id: 'ledger-004',
    tripId: 'trip-001',
    memberId: 'member-004',
    type: 'expense',
    category: 'food',
    description: 'Welcome Dinner at The Deuce',
    amount: 95,
    date: new Date('2025-12-29T21:00:00Z'),
    createdAt: new Date('2025-12-29T21:30:00Z'),
  },
  {
    id: 'ledger-005',
    tripId: 'trip-001',
    memberId: 'member-005',
    type: 'expense',
    category: 'food',
    description: 'Welcome Dinner at The Deuce',
    amount: 95,
    date: new Date('2025-12-29T21:00:00Z'),
    createdAt: new Date('2025-12-29T21:30:00Z'),
  },
  {
    id: 'ledger-006',
    tripId: 'trip-001',
    memberId: 'member-006',
    type: 'expense',
    category: 'food',
    description: 'Welcome Dinner at The Deuce',
    amount: 95,
    date: new Date('2025-12-29T21:00:00Z'),
    createdAt: new Date('2025-12-29T21:30:00Z'),
  },
  {
    id: 'ledger-007',
    tripId: 'trip-001',
    memberId: 'member-001',
    type: 'expense',
    category: 'golf',
    description: 'Day 1 Skins Buy-In',
    amount: 20,
    relatedId: 'game-001',
    date: new Date('2025-12-29T10:00:00Z'),
    createdAt: new Date('2025-12-29T10:00:00Z'),
  },
  {
    id: 'ledger-008',
    tripId: 'trip-001',
    memberId: 'member-002',
    type: 'expense',
    category: 'golf',
    description: 'Day 1 Skins Buy-In',
    amount: 20,
    relatedId: 'game-001',
    date: new Date('2025-12-29T10:00:00Z'),
    createdAt: new Date('2025-12-29T10:00:00Z'),
  },
  {
    id: 'ledger-009',
    tripId: 'trip-001',
    memberId: 'member-003',
    type: 'expense',
    category: 'golf',
    description: 'Day 1 Skins Buy-In',
    amount: 20,
    relatedId: 'game-001',
    date: new Date('2025-12-29T10:00:00Z'),
    createdAt: new Date('2025-12-29T10:00:00Z'),
  },
  {
    id: 'ledger-010',
    tripId: 'trip-001',
    memberId: 'member-004',
    type: 'expense',
    category: 'golf',
    description: 'Day 1 Skins Buy-In',
    amount: 20,
    relatedId: 'game-001',
    date: new Date('2025-12-29T10:00:00Z'),
    createdAt: new Date('2025-12-29T10:00:00Z'),
  },
  {
    id: 'ledger-011',
    tripId: 'trip-001',
    memberId: 'member-005',
    type: 'expense',
    category: 'golf',
    description: 'Day 1 Skins Buy-In',
    amount: 20,
    relatedId: 'game-001',
    date: new Date('2025-12-29T10:00:00Z'),
    createdAt: new Date('2025-12-29T10:00:00Z'),
  },
  {
    id: 'ledger-012',
    tripId: 'trip-001',
    memberId: 'member-006',
    type: 'expense',
    category: 'golf',
    description: 'Day 1 Skins Buy-In',
    amount: 20,
    relatedId: 'game-001',
    date: new Date('2025-12-29T10:00:00Z'),
    createdAt: new Date('2025-12-29T10:00:00Z'),
  },
  {
    id: 'ledger-013',
    tripId: 'trip-001',
    memberId: 'member-004',
    type: 'winning',
    category: 'side_game_winnings',
    description: 'Day 1 Skins - 3 skins won',
    amount: -60,
    relatedId: 'game-001',
    date: new Date('2025-12-29T16:00:00Z'),
    createdAt: new Date('2025-12-29T16:00:00Z'),
  },
  {
    id: 'ledger-014',
    tripId: 'trip-001',
    memberId: 'member-001',
    type: 'winning',
    category: 'side_game_winnings',
    description: 'Day 1 Skins - 2 skins won',
    amount: -40,
    relatedId: 'game-001',
    date: new Date('2025-12-29T16:00:00Z'),
    createdAt: new Date('2025-12-29T16:00:00Z'),
  },
  {
    id: 'ledger-015',
    tripId: 'trip-001',
    memberId: 'member-002',
    type: 'winning',
    category: 'side_game_winnings',
    description: 'Day 1 Skins - 1 skin won',
    amount: -20,
    relatedId: 'game-001',
    date: new Date('2025-12-29T16:00:00Z'),
    createdAt: new Date('2025-12-29T16:00:00Z'),
  },
  {
    id: 'ledger-016',
    tripId: 'trip-001',
    memberId: 'member-001',
    type: 'expense',
    category: 'entertainment',
    description: 'Cigars - Ryder Room',
    amount: 45,
    date: new Date('2025-12-29T22:00:00Z'),
    createdAt: new Date('2025-12-29T22:00:00Z'),
  },
  {
    id: 'ledger-017',
    tripId: 'trip-001',
    memberId: 'member-002',
    type: 'expense',
    category: 'entertainment',
    description: 'Cigars - Ryder Room',
    amount: 45,
    date: new Date('2025-12-29T22:00:00Z'),
    createdAt: new Date('2025-12-29T22:00:00Z'),
  },
  {
    id: 'ledger-018',
    tripId: 'trip-001',
    memberId: 'member-004',
    type: 'expense',
    category: 'entertainment',
    description: 'Cigars - Ryder Room',
    amount: 45,
    date: new Date('2025-12-29T22:00:00Z'),
    createdAt: new Date('2025-12-29T22:00:00Z'),
  },
  {
    id: 'ledger-019',
    tripId: 'trip-001',
    memberId: 'member-006',
    type: 'expense',
    category: 'entertainment',
    description: 'Cigars - Ryder Room',
    amount: 45,
    date: new Date('2025-12-29T22:00:00Z'),
    createdAt: new Date('2025-12-29T22:00:00Z'),
  },
  {
    id: 'ledger-020',
    tripId: 'trip-001',
    memberId: 'member-003',
    type: 'expense',
    category: 'food',
    description: 'Bar Tab - Ryder Cup Lounge',
    amount: 68,
    date: new Date('2025-12-29T23:00:00Z'),
    createdAt: new Date('2025-12-29T23:00:00Z'),
  },
  {
    id: 'ledger-021',
    tripId: 'trip-001',
    memberId: 'member-005',
    type: 'expense',
    category: 'food',
    description: 'Bar Tab - Ryder Cup Lounge',
    amount: 52,
    date: new Date('2025-12-29T23:00:00Z'),
    createdAt: new Date('2025-12-29T23:00:00Z'),
  },
];

const initialSettlements: Settlement[] = [
  {
    id: 'settle-001',
    tripId: 'trip-001',
    fromMemberId: 'member-003',
    toMemberId: 'member-001',
    amount: 50,
    method: 'venmo',
    note: 'Partial settlement',
    status: 'completed',
    createdAt: new Date('2025-12-29T20:00:00Z'),
    completedAt: new Date('2025-12-29T20:05:00Z'),
  },
];

let sessionSettlements: Settlement[] = [];

function getSettlements(): Settlement[] {
  return [...initialSettlements, ...sessionSettlements];
}

export function getLedgerEntriesByTrip(tripId: string): LedgerEntry[] {
  return mockLedgerEntries
    .filter(e => e.tripId === tripId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getLedgerBalances(tripId: string): LedgerBalance[] {
  const entries = mockLedgerEntries.filter(e => e.tripId === tripId);
  const settlements = getSettlements().filter(s => s.tripId === tripId && s.status === 'completed');
  
  const members = tripMembers.filter(m => m.tripId === tripId);
  
  return members.map(member => {
    const memberEntries = entries.filter(e => e.memberId === member.id);
    
    const totalExpenses = memberEntries
      .filter(e => e.type === 'expense')
      .reduce((sum, e) => sum + e.amount, 0);
    
    const totalWinnings = memberEntries
      .filter(e => e.type === 'winning')
      .reduce((sum, e) => sum + Math.abs(e.amount), 0);
    
    const paidOut = settlements
      .filter(s => s.fromMemberId === member.id)
      .reduce((sum, s) => sum + s.amount, 0);
    
    const received = settlements
      .filter(s => s.toMemberId === member.id)
      .reduce((sum, s) => sum + s.amount, 0);
    
    const netBalance = totalExpenses - totalWinnings - paidOut + received;
    
    return {
      memberId: member.id,
      memberName: member.profile.name,
      avatarUrl: member.profile.avatarUrl,
      totalExpenses,
      totalWinnings,
      totalPaid: paidOut,
      netBalance,
    };
  });
}

export function getLedgerSummary(tripId: string): LedgerSummary {
  const entries = getLedgerEntriesByTrip(tripId);
  const balances = getLedgerBalances(tripId);
  
  const totalPooled = entries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);
  
  const totalWinningsDistributed = entries
    .filter(e => e.type === 'winning')
    .reduce((sum, e) => sum + Math.abs(e.amount), 0);
  
  const totalSettled = getSettlements()
    .filter(s => s.tripId === tripId && s.status === 'completed')
    .reduce((sum, s) => sum + s.amount, 0);
  
  const totalOutstanding = balances
    .filter(b => b.netBalance > 0)
    .reduce((sum, b) => sum + b.netBalance, 0);
  
  return {
    tripId,
    totalPooled,
    totalWinningsDistributed,
    totalSettled,
    totalOutstanding,
    balances,
    recentEntries: entries.slice(0, 10),
  };
}

export function getSettlementsByTrip(tripId: string): Settlement[] {
  return getSettlements()
    .filter(s => s.tripId === tripId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function createSettlement(settlement: Omit<Settlement, 'id' | 'createdAt'>): Settlement {
  const newSettlement: Settlement = {
    ...settlement,
    id: `settle-${Date.now()}`,
    createdAt: new Date(),
  };
  sessionSettlements.push(newSettlement);
  return newSettlement;
}

export function resetSettlements(): void {
  sessionSettlements = [];
}

export function getPaymentMethods(): PaymentMethod[] {
  return mockPaymentMethods;
}
