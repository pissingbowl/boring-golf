import type { Issue, Task, Announcement } from '@shared/domain';

// Helper to get dates relative to "now" for realistic demo
function getRelativeDate(daysFromNow: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export const mockIssues: Issue[] = [
  {
    id: 'issue-001',
    tripId: 'trip-001',
    guestId: 'member-003',
    title: "Devon's golf bag delayed",
    description: 'FedEx showing bag stuck in Charlotte hub',
    severity: 'medium',
    status: 'in_progress',
    owner: 'Marcus Chen',
    playbook: 'Contact carrier, arrange backup clubs if needed',
    createdAt: getRelativeDate(0, 5, 0),
  },
  {
    id: 'issue-002',
    tripId: 'trip-001',
    guestId: 'member-005',
    title: 'Tommy merch shipment address issue',
    description: 'UPS requires address verification for delivery',
    severity: 'low',
    status: 'open',
    owner: undefined,
    playbook: 'Contact guest for address confirmation',
    createdAt: getRelativeDate(-1, 14, 0),
  },
  {
    id: 'issue-003',
    tripId: 'trip-001',
    title: 'Dinner reservation time conflict',
    description: '1895 Grille can only seat us at 8pm, not 7:30pm',
    severity: 'low',
    status: 'resolved',
    owner: 'Marcus Chen',
    resolution: 'Adjusted dinner time to 8pm, updated itinerary',
    createdAt: getRelativeDate(-3, 10, 0),
    resolvedAt: getRelativeDate(-3, 11, 30),
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    tripId: 'trip-001',
    title: 'Confirm final headcount for Deuce dinner',
    description: 'Call restaurant by 4pm to confirm 6 guests',
    owner: 'Marcus Chen',
    dueDate: getRelativeDate(0, 16, 0),
    status: 'pending',
    priority: 1,
    checklist: [
      { id: 'c1', text: 'Verify all dietary restrictions communicated', completed: true },
      { id: 'c2', text: 'Confirm private table reservation', completed: true },
      { id: 'c3', text: 'Call to confirm headcount', completed: false },
    ],
  },
  {
    id: 'task-002',
    tripId: 'trip-001',
    title: 'Arrange backup clubs for Devon',
    description: 'In case bag does not arrive in time',
    owner: 'Marcus Chen',
    dueDate: getRelativeDate(0, 9, 0),
    status: 'in_progress',
    priority: 0,
    checklist: [
      { id: 'c1', text: 'Check pro shop rental availability', completed: true },
      { id: 'c2', text: 'Get club specs from Devon', completed: false },
      { id: 'c3', text: 'Reserve backup set', completed: false },
    ],
    dependsOn: undefined,
  },
  {
    id: 'task-003',
    tripId: 'trip-001',
    title: 'Collect caddie preferences',
    description: 'Get walking speed and yardage preference from each player',
    owner: undefined,
    dueDate: getRelativeDate(0, 8, 0),
    status: 'completed',
    priority: 2,
  },
  {
    id: 'task-004',
    tripId: 'trip-001',
    title: 'Set up tournament scoring sheet',
    description: 'Create team pairings and scoring format',
    owner: 'Marcus Chen',
    dueDate: getRelativeDate(0, 9, 30),
    status: 'pending',
    priority: 1,
  },
  {
    id: 'task-005',
    tripId: 'trip-001',
    title: 'Coordinate departure shuttles',
    description: 'Match shuttle times to flight departures',
    owner: undefined,
    dueDate: getRelativeDate(2, 18, 0),
    status: 'pending',
    priority: 3,
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'ann-001',
    tripId: 'trip-001',
    message: 'Welcome to Pinehurst! Check in at the Manor front desk. Your room keys and welcome packets are ready.',
    createdAt: getRelativeDate(0, 6, 0),
    sentBy: 'Marcus Chen',
  },
  {
    id: 'ann-002',
    tripId: 'trip-001',
    message: 'Round 1 tee times: First group off at 10:30am. Please be at the No. 2 starter area by 10:00am.',
    createdAt: getRelativeDate(0, 7, 30),
    sentBy: 'Marcus Chen',
  },
  {
    id: 'ann-003',
    tripId: 'trip-001',
    message: 'Dinner tonight at The Deuce - 7pm. Smart casual. See you there!',
    createdAt: getRelativeDate(0, 15, 0),
    sentBy: 'Marcus Chen',
  },
];

export function getIssuesByTrip(tripId: string): Issue[] {
  return mockIssues.filter(i => i.tripId === tripId);
}

export function getTasksByTrip(tripId: string): Task[] {
  return mockTasks.filter(t => t.tripId === tripId);
}

export function getAnnouncementsByTrip(tripId: string): Announcement[] {
  return mockAnnouncements.filter(a => a.tripId === tripId);
}
