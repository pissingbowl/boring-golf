// ============================================
// BORING GOLF - Domain Types
// Pure TypeScript interfaces for mock-first architecture
// These will map directly to Supabase tables later
// ============================================

// ============================================
// ENUMS
// ============================================

export type TripStatus = 'draft' | 'planning' | 'confirmed' | 'active' | 'completed' | 'cancelled';
export type TripTier = 'ghost' | 'onsite' | 'signature';
export type GuestRole = 'captain' | 'guest' | 'vip';
export type RsvpStatus = 'pending' | 'confirmed' | 'declined';
export type BlockType = 'tee_time' | 'meal' | 'transport' | 'lodging' | 'activity' | 'free_time';
export type BlockStatus = 'upcoming' | 'boarding' | 'in_progress' | 'complete' | 'changed' | 'cancelled';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'blocked';
export type ShipmentStatus = 'invite_sent' | 'address_confirmed' | 'label_created' | 'in_transit' | 'delivered' | 'received' | 'issue';
export type TournamentFormat = 'scramble' | 'best_ball' | 'match_play' | 'stableford' | 'skins' | 'ryder_cup';

// Game category determines the scope and structure
export type GameCategory = 'tournament' | 'game' | 'side_game';

// Game styles available per category
export type TournamentStyle = 'ryder_cup' | 'stroke_play' | 'match_play' | 'scramble_tournament';
export type GameStyle = 'scramble' | 'best_ball' | 'alternate_shot' | 'shamble' | 'stableford' | 'nassau';
export type SideGameStyle = 'skins' | 'closest_to_pin' | 'long_drive' | 'wolf' | 'bingo_bango_bongo' | 'snake';

// Union type for all game styles
export type AnyGameStyle = TournamentStyle | GameStyle | SideGameStyle;
export type MerchStatus = 'collecting' | 'ordered' | 'shipped' | 'delivered' | 'staged';
export type IssueStatus = 'open' | 'in_progress' | 'resolved';
export type IssueSeverity = 'low' | 'medium' | 'high' | 'critical';

// NEW: Block firmness for Gravity Well
export type BlockFirmness = 'locked' | 'soft' | 'open';

// NEW: Guest archetypes from survey
export type GuestArchetype = 
  | 'the_planner'      // Wants to know everything in advance
  | 'the_golfer'       // Here for the golf, rest is noise
  | 'the_socializer'   // Here for the hang, golf is bonus
  | 'the_competitor'   // Wants to win, tracks everything
  | 'the_explorer'     // Interested in local experiences
  | 'the_easy_going';  // Whatever the group wants

// NEW: Bag types
export type BagType = 'primary' | 'backup' | 'carry_on';
export type BagStatus = 'at_home' | 'in_transit' | 'at_destination' | 'with_guest' | 'lost';

// NEW: Expense categories
export type ExpenseCategory = 'golf' | 'lodging' | 'food' | 'transport' | 'entertainment' | 'merch' | 'tips' | 'other';
export type ExpenseSplitType = 'equal' | 'per_person' | 'custom' | 'paid';

// ============================================
// USER & PROFILE
// ============================================

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatarUrl?: string;
  surveyCompleted: boolean;
  archetype?: GuestArchetype;
  preferences: UserPreferences;
  createdAt: Date;
}

export interface UserPreferences {
  handicap?: number;
  ghin?: string;
  tshirtSize?: string;
  hatSize?: string;
  dietaryRestrictions?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  preferredTeeTime?: 'early' | 'mid' | 'late';
  drinkPreference?: string;
}

export interface SurveyResponse {
  userId: string;
  responses: Record<string, string | number | boolean>;
  completedAt: Date;
  computedArchetype: GuestArchetype;
}

// ============================================
// TRIPS
// ============================================

export interface Trip {
  id: string;
  name: string;
  theme?: string;
  location: string;
  startDate: Date;
  endDate: Date;
  tier: TripTier;
  budget?: number;
  status: TripStatus;
  inviteCode: string;
  heroImageUrl?: string;
  createdAt: Date;
}

export interface TripWithDetails extends Trip {
  members: TripMember[];
  itinerary: ItineraryBlock[];
  riskSummary: RiskSummary;
}

export interface RiskSummary {
  totalRisks: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  recentIssues: Issue[];
  pendingTasks: number;
  shipmentIssues: number;
}

// ============================================
// TRIP MEMBERS (enhanced Guest)
// ============================================

export interface TripMember {
  id: string;
  tripId: string;
  userId: string;
  profile: UserProfile;
  role: GuestRole;
  rsvpStatus: RsvpStatus;
  arrivalDate?: Date;
  departureDate?: Date;
  roomAssignment?: string;
  teamId?: string;
  travelItems: TravelItem[];
  bags: Bag[];
}

// ============================================
// ITINERARY
// ============================================

export interface ItineraryBlock {
  id: string;
  tripId: string;
  type: BlockType;
  title: string;
  description?: string;
  location?: string;
  mapLink?: string;
  startTime: Date;
  endTime: Date;
  bufferBefore: number;
  bufferAfter: number;
  status: BlockStatus;
  firmness: BlockFirmness;
  vendorId?: string;
  confirmation?: string;
  cost?: number;
  notes?: string;
  participants?: string[];
  dependsOn?: string;
  visibleToGuests: boolean;
  requiresAction?: boolean;
  actionLabel?: string;
}

// ============================================
// TRAVEL & LOGISTICS
// ============================================

export interface TravelItem {
  id: string;
  tripMemberId: string;
  type: 'flight' | 'rental_car' | 'shuttle' | 'rideshare' | 'train' | 'other';
  direction: 'inbound' | 'outbound';
  carrier?: string;
  flightNumber?: string;
  confirmationNumber?: string;
  departureLocation: string;
  arrivalLocation: string;
  departureTime: Date;
  arrivalTime: Date;
  notes?: string;
  needsPickup: boolean;
  pickupAssigned?: boolean;
  pickupAssignee?: string;
}

export interface Bag {
  id: string;
  tripMemberId: string;
  type: BagType;
  description: string;
  carrier?: string;
  trackingNumber?: string;
  status: BagStatus;
  lastLocation?: string;
  lastUpdated?: Date;
  contents?: string[];
  value?: number;
}

export interface Shipment {
  id: string;
  tripId: string;
  guestId: string;
  carrier?: string;
  trackingNumber?: string;
  shipTo: string;
  eta?: Date;
  status: ShipmentStatus;
  itemDescription?: string;
  issues?: string;
}

// ============================================
// EXPENSES
// ============================================

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  category: ExpenseCategory;
  amount: number;
  paidBy: string;
  splitType: ExpenseSplitType;
  splitAmong?: string[];
  customSplits?: Record<string, number>;
  receiptUrl?: string;
  vendorName?: string;
  date: Date;
  settled: boolean;
  createdAt: Date;
}

export interface MemberBalance {
  memberId: string;
  memberName: string;
  paid: number;
  owes: number;
  balance: number;
}

export interface ExpenseSummary {
  tripId: string;
  totalExpenses: number;
  byCategory: Record<ExpenseCategory, number>;
  memberBalances: MemberBalance[];
  unsettledAmount: number;
}

// ============================================
// TOURNAMENTS & SCORING
// ============================================

export interface Tournament {
  id: string;
  tripId: string;
  name: string;
  format: TournamentFormat;
  rules?: string;
  handicapMethod?: string;
  prizePool?: number;
  isActive: boolean;
}

// Extended game definition for the tournament designer
export interface GameDefinition {
  id: string;
  tripId: string;
  name: string;
  category: GameCategory;
  style: AnyGameStyle;
  description?: string;
  rules?: string;
  handicapMethod?: 'full' | 'percentage_80' | 'percentage_90' | 'none';
  playerIds: string[];
  teamIds?: string[];
  prizePool?: number;
  buyIn?: number;
  linkedRoundIds?: string[];
  isActive: boolean;
  createdAt: Date;
  // Contextual challenge configs per hole
  holeChallenges?: HoleChallengeConfig[];
  // Current game state for ongoing challenges
  challengeState?: GameChallengeState;
}

export interface Team {
  id: string;
  tournamentId: string;
  name: string;
  color?: string;
  memberIds: string[];
}

export interface Round {
  id: string;
  tournamentId: string;
  name: string;
  courseName?: string;
  courseRating?: number;
  slopeRating?: number;
  parByHole?: number[];
  date?: Date;
  isComplete: boolean;
}

// Golf group (foursome/threesome) for a specific round/day
// Group icon types for customization
export type GroupIconType = 'emoji' | 'lucide' | 'custom';

export interface GolfGroup {
  id: string;
  roundId?: string;
  gameId?: string;
  tripId: string;
  date: Date;
  teeTime?: string;
  name?: string;
  memberIds: string[];
  cartAssignments?: string[][];
  // Scorekeeper assigned by trip captain
  scorekeeperId?: string;
  // Customization by scorekeeper
  displayName?: string;
  iconType?: GroupIconType;
  iconValue?: string; // emoji character, lucide icon name, or URL for custom upload
}

// Validation result for game readiness
export interface GameReadiness {
  isReady: boolean;
  errors: GameReadinessError[];
}

export interface GameReadinessError {
  code: 'missing_group_assignment' | 'no_groups_created' | 'group_size_invalid';
  message: string;
  affectedMemberIds?: string[];
  affectedMemberNames?: string[];
}

export interface Score {
  id: string;
  roundId: string;
  guestId: string;
  teamId?: string;
  holeScores: number[];
  totalStrokes: number;
  netScore?: number;
  points?: number;
  confirmed: boolean;
  submittedAt?: Date;
  syncedAt?: Date;
}

export interface Leaderboard {
  tournamentId: string;
  format: TournamentFormat;
  entries: LeaderboardEntry[];
  lastUpdated: Date;
}

export interface LeaderboardEntry {
  rank: number;
  previousRank?: number;
  entityId: string;
  entityName: string;
  isTeam: boolean;
  totalScore: number;
  netScore?: number;
  roundScores: number[];
  thru: number;
  today?: number;
}

// ============================================
// CONTEXTUAL GAME CHALLENGES
// Per-hole challenge configurations and tracking
// ============================================

// Types of challenges that can occur on specific holes
export type ChallengeType = 
  | 'long_drive'        // Longest drive contest
  | 'closest_to_pin'    // Closest to the pin (par 3s)
  | 'skins'             // Skins game - outright winner takes pot
  | 'snake'             // Three-putt tracking (holds the snake)
  | 'bingo_bango_bongo' // First on green, closest to pin, first in hole
  | 'greenies'          // Hit the green on par 3
  | 'sandies'           // Par or better from bunker
  | 'barkies';          // Par or better after hitting a tree

// Configuration for a challenge on a specific hole
export interface HoleChallengeConfig {
  id: string;
  gameId: string;
  roundId?: string;
  hole: number;
  challengeType: ChallengeType;
  prizeAmount?: number;
  eligiblePlayerIds?: string[];  // All game players if empty
  description?: string;
}

// Results of a challenge on a specific hole
export interface HoleEventResult {
  id: string;
  gameId: string;
  roundId: string;
  hole: number;
  challengeType: ChallengeType;
  winnerId?: string;              // Player who won the challenge
  winnerName?: string;
  metadata?: ChallengeMetadata;   // Type-specific data
  timestamp: Date;
  submittedBy: string;
}

// Type-specific metadata for different challenges
export interface ChallengeMetadata {
  // Long Drive
  distance?: number;             // Distance in yards
  
  // Closest to Pin
  distanceToPinFeet?: number;    // Distance from pin in feet/inches
  distanceToPinInches?: number;
  
  // Snake
  snakeHolderId?: string;        // Who currently holds the snake
  threePuttPlayerIds?: string[]; // Who three-putted on this hole
  
  // Skins
  skinWon?: boolean;             // Was the skin won outright
  carryover?: boolean;           // Does it carry to next hole
  skinValue?: number;            // Current value of the skin (with carryovers)
  
  // Bingo Bango Bongo
  firstOnGreenId?: string;       // Bingo
  closestWhenAllOnId?: string;   // Bango
  firstInHoleId?: string;        // Bongo
}

// Game state for tracking ongoing challenges
export interface GameChallengeState {
  gameId: string;
  snakeHolderId?: string;        // Who currently holds the snake
  skinsCarryover: number;        // How many skins are carried over
  bbbPoints: Record<string, number>;  // Bingo Bango Bongo points by player
}

// ============================================
// MERCH
// ============================================

export interface MerchOrder {
  id: string;
  tripId: string;
  designName: string;
  items: MerchItem[];
  sizeRuns: Record<string, number>;
  status: MerchStatus;
  deadline?: Date;
  cost?: number;
  notes?: string;
}

export interface MerchItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  basePrice: number;
  sizes: string[];
  required: boolean;
}

export interface GuestMerchSelection {
  id: string;
  merchOrderId: string;
  guestId: string;
  selections: Record<string, string>;
  submittedAt?: Date;
}

// ============================================
// ISSUES & TASKS
// ============================================

export interface Issue {
  id: string;
  tripId: string;
  guestId?: string;
  title: string;
  description?: string;
  severity: IssueSeverity;
  status: IssueStatus;
  owner?: string;
  playbook?: string;
  resolution?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface Task {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  owner?: string;
  dueDate?: Date;
  status: TaskStatus;
  priority: number;
  checklist?: TaskChecklistItem[];
  dependsOn?: string;
}

export interface TaskChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// ============================================
// ANNOUNCEMENTS
// ============================================

export interface Announcement {
  id: string;
  tripId: string;
  message: string;
  createdAt: Date;
  sentBy?: string;
}

// ============================================
// GRAVITY WELL TYPES
// ============================================

export interface GravityWellState {
  stateSentence: string;
  now: GravityItem | null;
  next: GravityItem | null;
  later: GravityItem[];
  currentTime: Date;
  tripDay: number;
  totalDays: number;
}

export interface GravityItem {
  block: ItineraryBlock;
  displayTime: string;
  displayDate?: string;
  timeUntil: string;
  urgency: 'immediate' | 'soon' | 'upcoming' | 'later';
  actionRequired: boolean;
}

export interface VisibilityWindow {
  showAsNowMinutesBefore: number;
  showAsNextMinutesBefore: number;
  hideAfterComplete: boolean;
}

// ============================================
// LEDGER & PAYMENTS
// ============================================

export type LedgerEntryType = 'expense' | 'winning' | 'adjustment' | 'payment';
export type PaymentMethodType = 'cash' | 'venmo' | 'zelle' | 'card' | 'other';
export type SettlementStatus = 'pending' | 'completed' | 'cancelled';

export interface LedgerEntry {
  id: string;
  tripId: string;
  memberId: string;
  type: LedgerEntryType;
  category: ExpenseCategory | 'tournament_winnings' | 'game_winnings' | 'side_game_winnings';
  description: string;
  amount: number; // positive = owes, negative = credit/winnings
  relatedId?: string; // expense, game, or tournament ID
  date: Date;
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  label: string;
  details?: string; // e.g., @venmo-handle, email for zelle
  icon?: string;
}

export interface Settlement {
  id: string;
  tripId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
  method: PaymentMethodType;
  note?: string;
  status: SettlementStatus;
  createdAt: Date;
  completedAt?: Date;
}

export interface LedgerBalance {
  memberId: string;
  memberName: string;
  avatarUrl?: string;
  totalExpenses: number;    // what they owe from expenses
  totalWinnings: number;    // what they've won (credit)
  totalPaid: number;        // payments made
  netBalance: number;       // positive = owes, negative = owed to them
}

export interface LedgerSummary {
  tripId: string;
  totalPooled: number;
  totalWinningsDistributed: number;
  totalSettled: number;
  totalOutstanding: number;
  balances: LedgerBalance[];
  recentEntries: LedgerEntry[];
}

// ============================================
// LIVE FEED CARD TYPES
// ============================================

export type LiveCardType = 
  | 'hole' 
  | 'weather' 
  | 'time' 
  | 'logistics'
  | 'pga-tour'
  | 'tour-schedule'
  | 'golf-news'
  | 'history'
  | 'course-spotlight';

export interface LiveCardBase {
  id: string;
  type: LiveCardType;
}

export interface LiveCardHole extends LiveCardBase {
  type: 'hole';
  hole: number;
  par: number;
  yards: number;
  quote: string;
  tip: string;
}

export interface LiveCardWeather extends LiveCardBase {
  type: 'weather';
  temp: number;
  condition: string;
  wind: string;
}

export interface LiveCardTime extends LiveCardBase {
  type: 'time';
  countdown: string;
  event: string;
  eventDetails: string;
}

export interface LiveCardLogistics extends LiveCardBase {
  type: 'logistics';
  status: string;
  detail: string;
}

export interface LiveCardPgaTour extends LiveCardBase {
  type: 'pga-tour';
  tournamentName: string;
  location: string;
  currentLeader: string;
  leaderScore: string;
  roundStatus: string;
  leaderboardUrl?: string;
}

export interface LiveCardTourSchedule extends LiveCardBase {
  type: 'tour-schedule';
  tournamentName: string;
  dates: string;
  location: string;
  courseName: string;
}

export interface LiveCardGolfNews extends LiveCardBase {
  type: 'golf-news';
  headline: string;
  source: string;
  timeAgo: string;
  thumbnailUrl?: string;
}

export interface LiveCardHistory extends LiveCardBase {
  type: 'history';
  year: number;
  description: string;
  playerName?: string;
}

export interface LiveCardCourseSpotlight extends LiveCardBase {
  type: 'course-spotlight';
  courseName: string;
  location: string;
  par: number;
  yardage: number;
  designer: string;
  yearBuilt: number;
  funFact: string;
}

export type LiveCard = 
  | LiveCardHole
  | LiveCardWeather
  | LiveCardTime
  | LiveCardLogistics
  | LiveCardPgaTour
  | LiveCardTourSchedule
  | LiveCardGolfNews
  | LiveCardHistory
  | LiveCardCourseSpotlight;

// ============================================
// TRIPLE PHONE DEMO TYPES (Landing Page)
// ============================================

// LIVE Feed Demo Card Types
export type LiveDemoCardType = 
  | 'tee_time_countdown'
  | 'weather'
  | 'hole_info'
  | 'crew_arrival'
  | 'dinner'
  | 'bags';

export interface LiveDemoCard {
  id: string;
  type: LiveDemoCardType;
  badge: string;
  icon: string;
  value?: string;
  valueSub?: string;
  quote?: string;
  tip?: string;
  detail?: string;
  status?: {
    type: 'confirmed' | 'warning' | 'info';
    label: string;
  };
}

// Leaderboard Demo Types
export interface LeaderboardDemoPlayer {
  position: number | null;
  initials: string;
  name: string;
  todayScore: string;
  scoreClass: 'under' | 'over' | 'even';
  skinsCount: number;
  winnings?: number;
  isLeader?: boolean;
}

export interface LeaderboardDemoState {
  gameName: string;
  buyIn: string;
  currentHole: number;
  totalHoles: number;
  skinsWon: number;
  players: LeaderboardDemoPlayer[];
  stats: {
    carryover: number;
    skinsWonCount: number;
    potRemaining: number;
  };
  banner?: {
    icon: string;
    title: string;
    message: string;
  };
}

// Ledger Demo Types
export type LedgerDemoTab = 'balances' | 'activity' | 'settle';

export interface LedgerDemoBalance {
  initials: string;
  name: string;
  role?: string;
  balance: number;
  detail: string;
}

export interface LedgerDemoActivity {
  id: string;
  icon: string;
  category: string;
  title: string;
  paidBy: string;
  amount: number;
  splitCount: number;
  timeAgo: string;
}

export interface LedgerDemoSettlement {
  fromInitials: string;
  fromName: string;
  toInitials: string;
  toName: string;
  amount: number;
  reason: string;
}

export interface LedgerDemoState {
  totalExpenses: number;
  participantCount: number;
  transactionCount: number;
  balances: LedgerDemoBalance[];
  activities: LedgerDemoActivity[];
  settlements: LedgerDemoSettlement[];
}

// Combined demo payload for landing page
export interface TriplePhoneDemoData {
  tripName: string;
  tripDay: number;
  totalDays: number;
  liveCards: LiveDemoCard[];
  leaderboard: LeaderboardDemoState;
  ledger: LedgerDemoState;
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================
// CADDIE MODE TYPES
// ============================================

export type CaddieRoundStatus = 'not_started' | 'in_progress' | 'complete';

export interface CaddieRound {
  id: string;
  tripId: string;
  gameId: string;
  courseId: string;
  courseName: string;
  status: CaddieRoundStatus;
  currentHole: number;
  players: CaddieRoundPlayer[];
  startedAt: Date;
  completedAt?: Date;
}

export interface CaddieRoundPlayer {
  playerId: string;
  playerName: string;
  avatarInitials: string;
  holeScores: (number | null)[];
  runningTotal: number;
}

export interface CourseHole {
  number: number;
  par: number;
  yardage: number;
  handicap: number;
  notes?: string;
  illustration?: string;
}

export interface CourseData {
  id: string;
  name: string;
  location: string;
  holes: CourseHole[];
}

// ============================================
// ITINERARY BUILDER TYPES
// ============================================

export type ItineraryBlockType =
  // Core simplified pool (7 items)
  | 'travel'            // Travel (flights, transport)
  | 'breakfast'         // Breakfast
  | 'lunch'             // Lunch
  | 'dinner'            // Dinner
  | 'tee_time'          // Tee Time
  | 'range'             // Driving Range / Practice
  | 'custom'            // Custom event
  // Legacy types (kept for existing data)
  | 'brunch' | 'drinks' | 'late_night'
  | 'practice_round' | 'driving_range' | 'putting_green' | 'pro_shop' | 'lesson'
  | 'flight_arrival' | 'flight_departure' | 'shuttle' | 'rental_pickup' | 'rental_return'
  | 'check_in' | 'check_out' | 'extracurricular'
  | 'spa' | 'pool' | 'cigars' | 'poker' | 'casino' | 'fishing'
  | 'group_meeting' | 'bag_drop' | 'free_time';

export type ItineraryBlockCategory = 'meal' | 'golf' | 'transport' | 'lodging' | 'activity' | 'logistics';
export type ItineraryBlockStatus = 'open' | 'soft' | 'locked';

export interface ItineraryBuilderBlock {
  id: string;
  tripId: string;
  dayDate: string;           // "2025-12-29"
  sortOrder: number;         // for ordering within day
  blockType: ItineraryBlockType;
  category: ItineraryBlockCategory;
  title: string;             // display name (can override default)
  startTime?: string;        // "08:30" (24hr format)
  duration?: number;         // minutes
  location?: string;
  notes?: string;
  confirmationNumber?: string;
  status: ItineraryBlockStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface BlockDefault {
  icon: string;
  label: string;
  time: string | null;
  duration: number | null;
  category: ItineraryBlockCategory;
}

export const BLOCK_DEFAULTS: Record<ItineraryBlockType, BlockDefault> = {
  // Meals
  breakfast: { icon: '🍳', label: 'Breakfast', time: '07:00', duration: 60, category: 'meal' },
  brunch: { icon: '🥂', label: 'Brunch', time: '10:00', duration: 90, category: 'meal' },
  lunch: { icon: '🥪', label: 'Lunch', time: '12:00', duration: 60, category: 'meal' },
  dinner: { icon: '🍽️', label: 'Dinner', time: '19:00', duration: 120, category: 'meal' },
  drinks: { icon: '🍺', label: 'Drinks', time: '21:00', duration: 120, category: 'meal' },
  late_night: { icon: '🌙', label: 'Late Night', time: '23:00', duration: 120, category: 'meal' },
  // Golf
  tee_time: { icon: '⛳', label: 'Tee Time', time: '08:00', duration: 300, category: 'golf' },
  range: { icon: '📍', label: 'Range', time: null, duration: 60, category: 'golf' },
  practice_round: { icon: '🏌️', label: 'Practice Round', time: '08:00', duration: 240, category: 'golf' },
  driving_range: { icon: '🎯', label: 'Driving Range', time: null, duration: 60, category: 'golf' },
  putting_green: { icon: '🕳️', label: 'Putting Green', time: null, duration: 30, category: 'golf' },
  pro_shop: { icon: '🛍️', label: 'Pro Shop', time: null, duration: 30, category: 'golf' },
  lesson: { icon: '📋', label: 'Lesson', time: null, duration: 60, category: 'golf' },
  // Transportation
  travel: { icon: '✈️', label: 'Travel', time: null, duration: null, category: 'transport' },
  flight_arrival: { icon: '✈️', label: 'Flight Arrival', time: null, duration: null, category: 'transport' },
  flight_departure: { icon: '🛫', label: 'Flight Departure', time: null, duration: null, category: 'transport' },
  shuttle: { icon: '🚐', label: 'Shuttle', time: null, duration: 30, category: 'transport' },
  rental_pickup: { icon: '🔑', label: 'Car Pickup', time: null, duration: 30, category: 'transport' },
  rental_return: { icon: '🚗', label: 'Car Return', time: null, duration: 30, category: 'transport' },
  // Lodging
  check_in: { icon: '🏨', label: 'Check In', time: '15:00', duration: 30, category: 'lodging' },
  check_out: { icon: '🧳', label: 'Check Out', time: '11:00', duration: 30, category: 'lodging' },
  // Activities
  extracurricular: { icon: '🎯', label: 'Extracurricular', time: null, duration: 120, category: 'activity' },
  spa: { icon: '💆', label: 'Spa', time: null, duration: 120, category: 'activity' },
  pool: { icon: '🏊', label: 'Pool', time: null, duration: 120, category: 'activity' },
  cigars: { icon: '🚬', label: 'Cigars', time: '21:00', duration: 120, category: 'activity' },
  poker: { icon: '🃏', label: 'Poker Night', time: '21:00', duration: 180, category: 'activity' },
  casino: { icon: '🎰', label: 'Casino', time: '21:00', duration: 180, category: 'activity' },
  fishing: { icon: '🎣', label: 'Fishing', time: '06:00', duration: 240, category: 'activity' },
  // Logistics
  group_meeting: { icon: '👥', label: 'Group Meeting', time: null, duration: 30, category: 'logistics' },
  bag_drop: { icon: '🎒', label: 'Bag Drop', time: null, duration: 15, category: 'logistics' },
  free_time: { icon: '⏸️', label: 'Free Time', time: null, duration: null, category: 'logistics' },
  custom: { icon: '✏️', label: 'Custom Event', time: null, duration: null, category: 'logistics' },
};

export const CATEGORY_COLORS: Record<ItineraryBlockCategory, { bg: string; text: string; border: string }> = {
  meal: { bg: 'rgba(230, 126, 34, 0.1)', text: '#E67E22', border: 'rgba(230, 126, 34, 0.3)' },
  golf: { bg: 'rgba(39, 174, 96, 0.1)', text: '#27AE60', border: 'rgba(39, 174, 96, 0.3)' },
  transport: { bg: 'rgba(52, 152, 219, 0.1)', text: '#3498DB', border: 'rgba(52, 152, 219, 0.3)' },
  lodging: { bg: 'rgba(155, 89, 182, 0.1)', text: '#9B59B6', border: 'rgba(155, 89, 182, 0.3)' },
  activity: { bg: 'rgba(233, 30, 99, 0.1)', text: '#E91E63', border: 'rgba(233, 30, 99, 0.3)' },
  logistics: { bg: 'rgba(96, 125, 139, 0.1)', text: '#607D8B', border: 'rgba(96, 125, 139, 0.3)' },
};

export const STATUS_CONFIG: Record<ItineraryBlockStatus, { icon: string; label: string; color: string }> = {
  open: { icon: '🔓', label: 'Open', color: 'rgba(96, 125, 139, 0.1)' },
  soft: { icon: '🟡', label: 'Soft', color: 'rgba(201, 162, 39, 0.1)' },
  locked: { icon: '🔒', label: 'Locked', color: 'rgba(184, 55, 45, 0.1)' },
};
