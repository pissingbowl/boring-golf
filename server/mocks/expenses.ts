import type { Expense, ExpenseSummary, MemberBalance, ExpenseCategory } from '@shared/domain';

// Helper to get dates relative to "now" for realistic demo
function getRelativeDate(daysFromNow: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export const mockExpenses: Expense[] = [
  {
    id: 'exp-001',
    tripId: 'trip-001',
    title: 'Pinehurst Lodging Deposit',
    description: 'Manor rooms deposit - 4 nights',
    category: 'lodging',
    amount: 4800,
    paidBy: 'member-001', // Marcus
    splitType: 'equal',
    splitAmong: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    vendorName: 'Pinehurst Resort',
    date: getRelativeDate(-30),
    settled: false,
    createdAt: getRelativeDate(-30),
  },
  {
    id: 'exp-002',
    tripId: 'trip-001',
    title: 'Pinehurst No. 2 - Round 1',
    description: 'Green fees + caddie fees',
    category: 'golf',
    amount: 5100,
    paidBy: 'member-001', // Marcus
    splitType: 'equal',
    splitAmong: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    vendorName: 'Pinehurst Resort',
    date: getRelativeDate(-14),
    settled: false,
    createdAt: getRelativeDate(-14),
  },
  {
    id: 'exp-003',
    tripId: 'trip-001',
    title: 'Pinehurst No. 4 - Round 2',
    description: 'Green fees + cart fees',
    category: 'golf',
    amount: 2550,
    paidBy: 'member-004', // Ryan
    splitType: 'equal',
    splitAmong: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    vendorName: 'Pinehurst Resort',
    date: getRelativeDate(-14),
    settled: false,
    createdAt: getRelativeDate(-14),
  },
  {
    id: 'exp-004',
    tripId: 'trip-001',
    title: 'Trip Merch Order',
    description: 'Polos, hats, and headcovers',
    category: 'merch',
    amount: 1800,
    paidBy: 'member-001', // Marcus
    splitType: 'equal',
    splitAmong: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    vendorName: 'Birdies & Bogeys Custom',
    date: getRelativeDate(-21),
    settled: false,
    createdAt: getRelativeDate(-21),
  },
  {
    id: 'exp-005',
    tripId: 'trip-001',
    title: 'Welcome Dinner - The Deuce',
    description: 'Group dinner night 1',
    category: 'food',
    amount: 847,
    paidBy: 'member-002', // Jake
    splitType: 'equal',
    splitAmong: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    vendorName: 'The Deuce at Pinehurst',
    date: getRelativeDate(0, 21, 30),
    settled: false,
    createdAt: getRelativeDate(0, 21, 30),
  },
  {
    id: 'exp-006',
    tripId: 'trip-001',
    title: 'Cigars for Ryder Room',
    description: 'Box of Arturo Fuente',
    category: 'entertainment',
    amount: 320,
    paidBy: 'member-006', // Alex
    splitType: 'equal',
    splitAmong: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    vendorName: 'Pinehurst Cigar Lounge',
    date: getRelativeDate(-7),
    settled: false,
    createdAt: getRelativeDate(-7),
  },
  {
    id: 'exp-007',
    tripId: 'trip-001',
    title: 'Airport Shuttle Service',
    description: 'Group transfers RDU to Pinehurst',
    category: 'transport',
    amount: 450,
    paidBy: 'member-001', // Marcus
    splitType: 'equal',
    splitAmong: ['member-002', 'member-003', 'member-005', 'member-006'], // Only those using shuttle
    vendorName: 'Pinehurst Transportation',
    date: getRelativeDate(-5),
    settled: false,
    createdAt: getRelativeDate(-5),
  },
  {
    id: 'exp-008',
    tripId: 'trip-001',
    title: 'Caddie Tips - Round 1',
    description: 'Tips for Pinehurst No. 2 caddies',
    category: 'tips',
    amount: 600,
    paidBy: 'member-003', // Devon
    splitType: 'equal',
    splitAmong: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    vendorName: 'Cash',
    date: getRelativeDate(0, 15, 30),
    settled: false,
    createdAt: getRelativeDate(0, 15, 30),
  },
];

export function getExpensesByTrip(tripId: string): Expense[] {
  return mockExpenses.filter(e => e.tripId === tripId);
}

export function computeExpenseSummary(tripId: string): ExpenseSummary {
  const expenses = getExpensesByTrip(tripId);
  
  // Calculate totals by category
  const byCategory = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<ExpenseCategory, number>);

  // Calculate member balances
  const memberTotals: Record<string, { paid: number; owes: number; name: string }> = {
    'member-001': { paid: 0, owes: 0, name: 'Marcus Chen' },
    'member-002': { paid: 0, owes: 0, name: 'Jake Morrison' },
    'member-003': { paid: 0, owes: 0, name: 'Devon Williams' },
    'member-004': { paid: 0, owes: 0, name: "Ryan O'Connor" },
    'member-005': { paid: 0, owes: 0, name: 'Tommy Nguyen' },
    'member-006': { paid: 0, owes: 0, name: 'Alex Hartman' },
  };

  expenses.forEach(exp => {
    // Track what was paid
    if (memberTotals[exp.paidBy]) {
      memberTotals[exp.paidBy].paid += exp.amount;
    }

    // Track what is owed
    if (exp.splitType === 'equal' && exp.splitAmong) {
      const share = exp.amount / exp.splitAmong.length;
      exp.splitAmong.forEach(memberId => {
        if (memberTotals[memberId]) {
          memberTotals[memberId].owes += share;
        }
      });
    }
  });

  const memberBalances: MemberBalance[] = Object.entries(memberTotals).map(([memberId, totals]) => ({
    memberId,
    memberName: totals.name,
    paid: Math.round(totals.paid * 100) / 100,
    owes: Math.round(totals.owes * 100) / 100,
    balance: Math.round((totals.paid - totals.owes) * 100) / 100,
  }));

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const unsettledAmount = expenses.filter(e => !e.settled).reduce((sum, e) => sum + e.amount, 0);

  return {
    tripId,
    totalExpenses,
    byCategory,
    memberBalances,
    unsettledAmount,
  };
}
