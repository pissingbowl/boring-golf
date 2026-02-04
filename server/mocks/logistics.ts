import type { TravelItem, Bag, Shipment } from '@shared/domain';

// Helper to get dates relative to "now" for realistic demo
function getRelativeDate(daysFromNow: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

// Travel items - flights, shuttles, etc.
export const mockTravelItems: TravelItem[] = [
  // Jake Morrison (member-002) - Primary user
  {
    id: 'travel-001',
    tripMemberId: 'member-002',
    type: 'flight',
    direction: 'inbound',
    carrier: 'American Airlines',
    flightNumber: 'AA 1847',
    confirmationNumber: 'XKDM8P',
    departureLocation: 'Austin (AUS)',
    arrivalLocation: 'Raleigh-Durham (RDU)',
    departureTime: getRelativeDate(0, 6, 15),
    arrivalTime: getRelativeDate(0, 10, 45),
    notes: 'Connecting through DFW',
    needsPickup: true,
    pickupAssigned: true,
    pickupAssignee: 'Resort Shuttle',
  },
  {
    id: 'travel-002',
    tripMemberId: 'member-002',
    type: 'flight',
    direction: 'outbound',
    carrier: 'American Airlines',
    flightNumber: 'AA 2341',
    confirmationNumber: 'XKDM8P',
    departureLocation: 'Raleigh-Durham (RDU)',
    arrivalLocation: 'Austin (AUS)',
    departureTime: getRelativeDate(3, 14, 30),
    arrivalTime: getRelativeDate(3, 17, 45),
    needsPickup: false,
  },
  
  // Marcus Chen (member-001) - Captain
  {
    id: 'travel-003',
    tripMemberId: 'member-001',
    type: 'flight',
    direction: 'inbound',
    carrier: 'United Airlines',
    flightNumber: 'UA 892',
    confirmationNumber: 'JN8K2M',
    departureLocation: 'San Francisco (SFO)',
    arrivalLocation: 'Raleigh-Durham (RDU)',
    departureTime: getRelativeDate(-1, 8, 0),
    arrivalTime: getRelativeDate(-1, 16, 30),
    needsPickup: true,
    pickupAssigned: true,
    pickupAssignee: 'Marcus (self-drive rental)',
  },
  {
    id: 'travel-004',
    tripMemberId: 'member-001',
    type: 'rental_car',
    direction: 'inbound',
    carrier: 'Enterprise',
    confirmationNumber: 'ENT-8847291',
    departureLocation: 'RDU Airport',
    arrivalLocation: 'Pinehurst Resort',
    departureTime: getRelativeDate(-1, 16, 45),
    arrivalTime: getRelativeDate(-1, 18, 30),
    notes: 'Full-size SUV for group transport',
    needsPickup: false,
  },

  // Devon Williams (member-003)
  {
    id: 'travel-005',
    tripMemberId: 'member-003',
    type: 'flight',
    direction: 'inbound',
    carrier: 'Delta',
    flightNumber: 'DL 1123',
    confirmationNumber: 'GHTK92',
    departureLocation: 'Los Angeles (LAX)',
    arrivalLocation: 'Raleigh-Durham (RDU)',
    departureTime: getRelativeDate(0, 7, 0),
    arrivalTime: getRelativeDate(0, 14, 30),
    needsPickup: true,
    pickupAssigned: true,
    pickupAssignee: 'Resort Shuttle (2pm)',
  },

  // Ryan O'Connor (member-004)
  {
    id: 'travel-006',
    tripMemberId: 'member-004',
    type: 'flight',
    direction: 'inbound',
    carrier: 'JetBlue',
    flightNumber: 'B6 447',
    confirmationNumber: 'RYNOCC',
    departureLocation: 'Boston (BOS)',
    arrivalLocation: 'Raleigh-Durham (RDU)',
    departureTime: getRelativeDate(-1, 14, 30),
    arrivalTime: getRelativeDate(-1, 17, 15),
    needsPickup: true,
    pickupAssigned: true,
    pickupAssignee: 'Marcus Chen',
  },

  // Tommy Nguyen (member-005)
  {
    id: 'travel-007',
    tripMemberId: 'member-005',
    type: 'flight',
    direction: 'inbound',
    carrier: 'Southwest',
    flightNumber: 'WN 2847',
    confirmationNumber: 'TN8472',
    departureLocation: 'Dallas (DAL)',
    arrivalLocation: 'Raleigh-Durham (RDU)',
    departureTime: getRelativeDate(0, 7, 30),
    arrivalTime: getRelativeDate(0, 11, 45),
    needsPickup: true,
    pickupAssigned: true,
    pickupAssignee: 'Resort Shuttle (12pm)',
  },

  // Alex Hartman (member-006)
  {
    id: 'travel-008',
    tripMemberId: 'member-006',
    type: 'flight',
    direction: 'inbound',
    carrier: 'United Airlines',
    flightNumber: 'UA 1567',
    confirmationNumber: 'HART77',
    departureLocation: 'Denver (DEN)',
    arrivalLocation: 'Raleigh-Durham (RDU)',
    departureTime: getRelativeDate(0, 8, 0),
    arrivalTime: getRelativeDate(0, 13, 45),
    needsPickup: true,
    pickupAssigned: true,
    pickupAssignee: 'Resort Shuttle (2pm)',
  },
];

// Bags - primary and backup
export const mockBags: Bag[] = [
  // Jake Morrison
  {
    id: 'bag-001',
    tripMemberId: 'member-002',
    type: 'primary',
    description: 'Titleist Staff Bag - Black/Red',
    carrier: 'Ship Sticks',
    trackingNumber: 'SS-847291847',
    status: 'at_destination',
    lastLocation: 'Pinehurst Resort Pro Shop',
    lastUpdated: getRelativeDate(-1, 14, 0),
    contents: ['Full club set', 'Rain gear', 'Extra gloves'],
    value: 3500,
  },
  {
    id: 'bag-002',
    tripMemberId: 'member-002',
    type: 'carry_on',
    description: 'Away Carry-On',
    status: 'with_guest',
    contents: ['Clothes', 'Shoes', 'Toiletries'],
  },

  // Marcus Chen
  {
    id: 'bag-003',
    tripMemberId: 'member-001',
    type: 'primary',
    description: 'Sun Mountain C-130 Stand Bag',
    carrier: 'Ship Sticks',
    trackingNumber: 'SS-928374651',
    status: 'at_destination',
    lastLocation: 'Pinehurst Resort Pro Shop',
    lastUpdated: getRelativeDate(-2, 10, 0),
    value: 2800,
  },
  {
    id: 'bag-004',
    tripMemberId: 'member-001',
    type: 'backup',
    description: 'Backup wedge set + putter',
    status: 'at_destination',
    lastLocation: 'Manor 201',
  },

  // Devon Williams
  {
    id: 'bag-005',
    tripMemberId: 'member-003',
    type: 'primary',
    description: 'Ping Hoofer Lite',
    carrier: 'FedEx',
    trackingNumber: 'FX-827193847',
    status: 'in_transit',
    lastLocation: 'Charlotte Hub',
    lastUpdated: getRelativeDate(0, 4, 30),
    value: 2200,
  },

  // Ryan O'Connor
  {
    id: 'bag-006',
    tripMemberId: 'member-004',
    type: 'primary',
    description: 'TaylorMade FlexTech',
    carrier: 'Ship Sticks',
    trackingNumber: 'SS-192837465',
    status: 'at_destination',
    lastLocation: 'Pinehurst Resort Pro Shop',
    lastUpdated: getRelativeDate(-1, 16, 0),
    value: 3200,
  },

  // Tommy Nguyen
  {
    id: 'bag-007',
    tripMemberId: 'member-005',
    type: 'primary',
    description: 'Callaway Fairway C',
    carrier: 'UPS',
    trackingNumber: 'UPS-1Z8472847',
    status: 'at_destination',
    lastLocation: 'Pinehurst Resort Pro Shop',
    lastUpdated: getRelativeDate(-1, 11, 0),
    value: 2500,
  },

  // Alex Hartman
  {
    id: 'bag-008',
    tripMemberId: 'member-006',
    type: 'primary',
    description: 'Vessel Player III',
    carrier: 'Ship Sticks',
    trackingNumber: 'SS-564738291',
    status: 'at_destination',
    lastLocation: 'Pinehurst Resort Pro Shop',
    lastUpdated: getRelativeDate(-2, 9, 0),
    value: 4000,
  },
];

// Shipments (merch, etc.)
export const mockShipments: Shipment[] = [
  {
    id: 'ship-001',
    tripId: 'trip-001',
    guestId: 'member-002',
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456784',
    shipTo: 'Jake Morrison, Pinehurst Resort',
    eta: getRelativeDate(-1, 12, 0),
    status: 'delivered',
    itemDescription: 'Trip merch package',
  },
  {
    id: 'ship-002',
    tripId: 'trip-001',
    guestId: 'member-003',
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456785',
    shipTo: 'Devon Williams, Pinehurst Resort',
    eta: getRelativeDate(0, 14, 0),
    status: 'in_transit',
    itemDescription: 'Trip merch package',
  },
  {
    id: 'ship-003',
    tripId: 'trip-001',
    guestId: 'member-005',
    carrier: 'UPS',
    trackingNumber: '1Z999AA10123456786',
    shipTo: 'Tommy Nguyen, Pinehurst Resort',
    eta: getRelativeDate(0, 10, 0),
    status: 'issue',
    itemDescription: 'Trip merch package',
    issues: 'Address verification required',
  },
];

export function getTravelItemsByMember(memberId: string): TravelItem[] {
  return mockTravelItems.filter(t => t.tripMemberId === memberId);
}

export function getBagsByMember(memberId: string): Bag[] {
  return mockBags.filter(b => b.tripMemberId === memberId);
}

export function getShipmentsByTrip(tripId: string): Shipment[] {
  return mockShipments.filter(s => s.tripId === tripId);
}
