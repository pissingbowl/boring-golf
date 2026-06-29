import type { Tournament, Team, Round, Score, Leaderboard, LeaderboardEntry, GameDefinition, GolfGroup, GameReadiness, GameReadinessError, HoleChallengeConfig, HoleEventResult, GameChallengeState } from '@shared/domain';

// Helper to get dates relative to "now" for realistic demo
function getRelativeDate(daysFromNow: number, hours = 0, minutes = 0): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export const mockTournaments: Tournament[] = [
  {
    id: 'tourn-001',
    tripId: 'trip-001',
    name: 'Pinehurst Ryder Cup',
    format: 'ryder_cup',
    rules: 'Team match play over 3 rounds. Points awarded for match wins (1), halves (0.5). Team with most points wins.',
    handicapMethod: '80% of course handicap',
    prizePool: 500,
    isActive: true,
  },
];

export const mockTeams: Team[] = [
  {
    id: 'team-red',
    tournamentId: 'tourn-001',
    name: 'Team Red',
    color: '#DC2626',
    memberIds: ['member-001', 'member-002', 'member-005'], // Marcus, Jake, Tommy
  },
  {
    id: 'team-blue',
    tournamentId: 'tourn-001',
    name: 'Team Blue',
    color: '#2563EB',
    memberIds: ['member-003', 'member-004', 'member-006'], // Devon, Ryan, Alex
  },
];

export const mockRounds: Round[] = [
  {
    id: 'round-001',
    tournamentId: 'tourn-001',
    name: 'Round 1 - Pinehurst No. 2',
    courseName: 'Pinehurst No. 2',
    courseRating: 75.3,
    slopeRating: 136,
    parByHole: [4, 4, 4, 4, 5, 3, 4, 3, 4, 4, 5, 4, 4, 4, 3, 4, 3, 5],
    date: getRelativeDate(0, 10, 30),
    isComplete: false,
  },
  {
    id: 'round-002',
    tournamentId: 'tourn-001',
    name: 'Round 2 - Pinehurst No. 4',
    courseName: 'Pinehurst No. 4',
    courseRating: 73.8,
    slopeRating: 131,
    parByHole: [4, 5, 3, 4, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 4],
    date: getRelativeDate(1, 8, 30),
    isComplete: false,
  },
  {
    id: 'round-003',
    tournamentId: 'tourn-001',
    name: 'Final Round - Pinehurst No. 2',
    courseName: 'Pinehurst No. 2',
    courseRating: 75.3,
    slopeRating: 136,
    parByHole: [4, 4, 4, 4, 5, 3, 4, 3, 4, 4, 5, 4, 4, 4, 3, 4, 3, 5],
    date: getRelativeDate(2, 9, 0),
    isComplete: false,
  },
];

// Partial scores (round in progress)
export const mockScores: Score[] = [
  // Round 1 scores (in progress through hole 6)
  {
    id: 'score-001',
    roundId: 'round-001',
    guestId: 'member-001', // Marcus (hdcp 8)
    teamId: 'team-red',
    holeScores: [4, 5, 4, 4, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalStrokes: 25,
    netScore: -1,
    points: 0,
    confirmed: false,
    submittedAt: getRelativeDate(0, 12, 45),
  },
  {
    id: 'score-002',
    roundId: 'round-001',
    guestId: 'member-002', // Jake (hdcp 14)
    teamId: 'team-red',
    holeScores: [5, 5, 5, 5, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalStrokes: 30,
    netScore: 1,
    points: 0,
    confirmed: false,
    submittedAt: getRelativeDate(0, 12, 45),
  },
  {
    id: 'score-003',
    roundId: 'round-001',
    guestId: 'member-003', // Devon (hdcp 22)
    teamId: 'team-blue',
    holeScores: [6, 6, 5, 5, 7, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalStrokes: 33,
    netScore: 0,
    points: 0,
    confirmed: false,
    submittedAt: getRelativeDate(0, 12, 50),
  },
  {
    id: 'score-004',
    roundId: 'round-001',
    guestId: 'member-004', // Ryan (hdcp 4)
    teamId: 'team-blue',
    holeScores: [4, 4, 4, 3, 5, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalStrokes: 23,
    netScore: -2,
    points: 0,
    confirmed: false,
    submittedAt: getRelativeDate(0, 12, 40),
  },
  {
    id: 'score-005',
    roundId: 'round-001',
    guestId: 'member-005', // Tommy (hdcp 18)
    teamId: 'team-red',
    holeScores: [5, 6, 5, 5, 6, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalStrokes: 31,
    netScore: 1,
    points: 0,
    confirmed: false,
    submittedAt: getRelativeDate(0, 12, 48),
  },
  {
    id: 'score-006',
    roundId: 'round-001',
    guestId: 'member-006', // Alex (hdcp 16)
    teamId: 'team-blue',
    holeScores: [5, 5, 5, 4, 6, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    totalStrokes: 28,
    netScore: -1,
    points: 0,
    confirmed: false,
    submittedAt: getRelativeDate(0, 12, 42),
  },
];

export function computeLeaderboard(tournamentId: string): Leaderboard {
  const tournament = mockTournaments.find(t => t.id === tournamentId);
  if (!tournament) {
    return { tournamentId, format: 'scramble', entries: [], lastUpdated: new Date() };
  }

  // For Ryder Cup format, compute team totals
  const teamScores: Record<string, { totalNet: number; name: string; color: string }> = {};
  
  mockTeams.filter(t => t.tournamentId === tournamentId).forEach(team => {
    teamScores[team.id] = { totalNet: 0, name: team.name, color: team.color || '#888' };
  });

  mockScores.forEach(score => {
    if (score.teamId && teamScores[score.teamId]) {
      teamScores[score.teamId].totalNet += score.netScore || 0;
    }
  });

  const entries: LeaderboardEntry[] = Object.entries(teamScores)
    .map(([teamId, data], index) => ({
      rank: 0,
      entityId: teamId,
      entityName: data.name,
      isTeam: true,
      totalScore: data.totalNet,
      roundScores: [data.totalNet],
      thru: 6,
      today: data.totalNet,
    }))
    .sort((a, b) => a.totalScore - b.totalScore);

  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return {
    tournamentId,
    format: tournament.format,
    entries,
    lastUpdated: new Date(),
  };
}

export function getTournamentsByTrip(tripId: string): Tournament[] {
  return mockTournaments.filter(t => t.tripId === tripId);
}

export function getTeamsByTournament(tournamentId: string): Team[] {
  return mockTeams.filter(t => t.tournamentId === tournamentId);
}

export function getRoundsByTournament(tournamentId: string): Round[] {
  return mockRounds.filter(r => r.tournamentId === tournamentId);
}

export function getScoresByRound(roundId: string): Score[] {
  return mockScores.filter(s => s.roundId === roundId);
}

// ============================================
// GAMES (Extended Tournament Designer)
// ============================================

// ============================================
// HOLE CHALLENGE CONFIGURATIONS
// ============================================

// Hole challenges for skins game
const skinsHoleChallenges: HoleChallengeConfig[] = Array.from({ length: 18 }, (_, i) => ({
  id: `challenge-skins-${i + 1}`,
  gameId: 'game-001',
  roundId: 'round-001',
  hole: i + 1,
  challengeType: 'skins' as const,
  prizeAmount: 10, // Each skin worth $10
  description: `Skin - Hole ${i + 1}`,
}));

// Add long drive on par 5s (holes 5, 11, 18 per course rating)
const longDriveChallenges: HoleChallengeConfig[] = [
  { id: 'challenge-ld-5', gameId: 'game-001', roundId: 'round-001', hole: 5, challengeType: 'long_drive', prizeAmount: 20, description: 'Long Drive Contest - Hole 5' },
  { id: 'challenge-ld-11', gameId: 'game-001', roundId: 'round-001', hole: 11, challengeType: 'long_drive', prizeAmount: 20, description: 'Long Drive Contest - Hole 11' },
  { id: 'challenge-ld-18', gameId: 'game-001', roundId: 'round-001', hole: 18, challengeType: 'long_drive', prizeAmount: 20, description: 'Long Drive Contest - Hole 18' },
];

// CTP on par 3s (holes 6, 8, 15, 17 are par 3s)
const ctpChallenges: HoleChallengeConfig[] = [
  { id: 'challenge-ctp-6', gameId: 'game-002', roundId: 'round-001', hole: 6, challengeType: 'closest_to_pin', prizeAmount: 15, description: 'Closest to Pin - Hole 6' },
  { id: 'challenge-ctp-8', gameId: 'game-002', roundId: 'round-001', hole: 8, challengeType: 'closest_to_pin', prizeAmount: 15, description: 'Closest to Pin - Hole 8' },
  { id: 'challenge-ctp-15', gameId: 'game-002', roundId: 'round-001', hole: 15, challengeType: 'closest_to_pin', prizeAmount: 15, description: 'Closest to Pin - Hole 15' },
  { id: 'challenge-ctp-17', gameId: 'game-002', roundId: 'round-001', hole: 17, challengeType: 'closest_to_pin', prizeAmount: 15, description: 'Closest to Pin - Hole 17' },
];

// Snake game tracking (applies to all holes - tracks three-putts)
const snakeChallenges: HoleChallengeConfig[] = Array.from({ length: 18 }, (_, i) => ({
  id: `challenge-snake-${i + 1}`,
  gameId: 'game-004',
  roundId: 'round-001',
  hole: i + 1,
  challengeType: 'snake' as const,
  description: `Snake Tracking - Hole ${i + 1}`,
}));

// BBB challenges (all holes)
const bbbChallenges: HoleChallengeConfig[] = Array.from({ length: 18 }, (_, i) => ({
  id: `challenge-bbb-${i + 1}`,
  gameId: 'game-005',
  roundId: 'round-001',
  hole: i + 1,
  challengeType: 'bingo_bango_bongo' as const,
  prizeAmount: 3, // 1 point per position, $1 per point
  description: `Bingo Bango Bongo - Hole ${i + 1}`,
}));

export const mockGames: GameDefinition[] = [
  {
    id: 'game-001',
    tripId: 'trip-001',
    name: 'Day 1 Skins',
    category: 'side_game',
    style: 'skins',
    description: 'Classic skins game with carryovers',
    rules: 'Tie on a hole carries value to next. All ties push to final hole.',
    handicapMethod: 'percentage_80',
    playerIds: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    buyIn: 20,
    prizePool: 120,
    linkedRoundIds: ['round-001'],
    isActive: true,
    createdAt: getRelativeDate(-1, 10, 0),
    holeChallenges: [...skinsHoleChallenges, ...longDriveChallenges],
    challengeState: {
      gameId: 'game-001',
      skinsCarryover: 0,
      bbbPoints: {},
    },
  },
  {
    id: 'game-002',
    tripId: 'trip-001',
    name: 'CTP Challenge',
    category: 'side_game',
    style: 'closest_to_pin',
    description: 'Closest to pin on all par 3s',
    rules: 'Holes 6, 8, 15, 17. One winner per hole. Ties split.',
    handicapMethod: 'none',
    playerIds: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    buyIn: 10,
    prizePool: 60,
    isActive: true,
    createdAt: getRelativeDate(-1, 10, 0),
    holeChallenges: ctpChallenges,
  },
  {
    id: 'game-003',
    tripId: 'trip-001',
    name: 'Nassau Match',
    category: 'game',
    style: 'nassau',
    description: 'Classic Nassau format',
    rules: 'Front 9, Back 9, and Total. Automatic 2-down press.',
    handicapMethod: 'full',
    playerIds: ['member-001', 'member-004'],
    buyIn: 50,
    isActive: true,
    createdAt: getRelativeDate(-1, 9, 0),
  },
  {
    id: 'game-004',
    tripId: 'trip-001',
    name: 'Snake',
    category: 'side_game',
    style: 'snake',
    description: 'Three-putt tracker - last to three-putt holds the snake',
    rules: 'Three-putt and you hold the snake. Person holding at end of round pays everyone.',
    handicapMethod: 'none',
    playerIds: ['member-001', 'member-002', 'member-003', 'member-004', 'member-005', 'member-006'],
    buyIn: 10,
    prizePool: 50,
    linkedRoundIds: ['round-001'],
    isActive: true,
    createdAt: getRelativeDate(-1, 10, 0),
    holeChallenges: snakeChallenges,
    challengeState: {
      gameId: 'game-004',
      snakeHolderId: undefined,
      skinsCarryover: 0,
      bbbPoints: {},
    },
  },
  {
    id: 'game-005',
    tripId: 'trip-001',
    name: 'Bingo Bango Bongo',
    category: 'side_game',
    style: 'bingo_bango_bongo',
    description: 'Points for first on green, closest when all on, first in hole',
    rules: 'Bingo: First on green. Bango: Closest to pin once all on green. Bongo: First to hole out.',
    handicapMethod: 'none',
    playerIds: ['member-001', 'member-002', 'member-003', 'member-004'],
    buyIn: 15,
    prizePool: 60,
    linkedRoundIds: ['round-001'],
    isActive: true,
    createdAt: getRelativeDate(-1, 10, 0),
    holeChallenges: bbbChallenges,
    challengeState: {
      gameId: 'game-005',
      skinsCarryover: 0,
      bbbPoints: {},
    },
  },
];

// In-memory store for new games (for demo purposes)
let gamesStore = [...mockGames];

export function getGamesByTrip(tripId: string): GameDefinition[] {
  return gamesStore.filter(g => g.tripId === tripId);
}

export function createGame(tripId: string, gameData: Omit<GameDefinition, 'id' | 'tripId' | 'isActive' | 'createdAt'>): GameDefinition {
  const newGame: GameDefinition = {
    ...gameData,
    id: `game-${Date.now()}`,
    tripId,
    isActive: true,
    createdAt: new Date(),
  };
  gamesStore.push(newGame);
  return newGame;
}

export function updateGame(gameId: string, updates: Partial<GameDefinition>): GameDefinition | null {
  const index = gamesStore.findIndex(g => g.id === gameId);
  if (index === -1) return null;
  gamesStore[index] = { ...gamesStore[index], ...updates };
  return gamesStore[index];
}

export function deleteGame(gameId: string): boolean {
  const index = gamesStore.findIndex(g => g.id === gameId);
  if (index === -1) return false;
  gamesStore.splice(index, 1);
  return true;
}

// ============================================
// GOLF GROUPS (Foursomes/Threesomes)
// ============================================

// Mock groups - intentionally incomplete for game-001 to demonstrate validation
export const mockGolfGroups: GolfGroup[] = [
  {
    id: 'group-001',
    gameId: 'game-001',
    tripId: 'trip-001',
    date: getRelativeDate(0, 10, 30),
    teeTime: '10:30 AM',
    name: 'Group 1',
    memberIds: ['member-001', 'member-002', 'member-003'], // Only 3 of 6 players assigned
    scorekeeperId: 'member-001', // Marcus is scorekeeper
    displayName: 'The Sharks',
    iconType: 'lucide',
    iconValue: 'Waves',
  },
  // Note: game-001 has 6 players but only 3 are in groups - this creates a validation error
  
  // game-002 has all players in groups
  {
    id: 'group-002',
    gameId: 'game-002',
    tripId: 'trip-001',
    date: getRelativeDate(0, 10, 30),
    teeTime: '10:30 AM',
    name: 'CTP Group 1',
    memberIds: ['member-001', 'member-002', 'member-003', 'member-004'],
    scorekeeperId: 'member-002', // Jake is scorekeeper
    displayName: 'Pin Seekers',
    iconType: 'lucide',
    iconValue: 'Target',
  },
  {
    id: 'group-003',
    gameId: 'game-002',
    tripId: 'trip-001',
    date: getRelativeDate(0, 10, 38),
    teeTime: '10:38 AM',
    name: 'CTP Group 2',
    memberIds: ['member-005', 'member-006'],
    scorekeeperId: 'member-005', // Tommy is scorekeeper
    // No displayName yet - scorekeeper hasn't customized
  },
  
  // game-003 is a head-to-head Nassau - both players grouped
  {
    id: 'group-004',
    gameId: 'game-003',
    tripId: 'trip-001',
    date: getRelativeDate(0, 11, 0),
    teeTime: '11:00 AM',
    name: 'Nassau Match',
    memberIds: ['member-001', 'member-004'],
    scorekeeperId: 'member-004', // Ryan is scorekeeper
    displayName: 'Money Match',
    iconType: 'lucide',
    iconValue: 'DollarSign',
  },
];

let groupsStore = [...mockGolfGroups];

export function getGroupsByGame(gameId: string): GolfGroup[] {
  return groupsStore.filter(g => g.gameId === gameId);
}

export function getGroupsByTrip(tripId: string): GolfGroup[] {
  return groupsStore.filter(g => g.tripId === tripId);
}

export function createGroup(groupData: Omit<GolfGroup, 'id'>): GolfGroup {
  const newGroup: GolfGroup = {
    ...groupData,
    id: `group-${Date.now()}`,
  };
  groupsStore.push(newGroup);
  return newGroup;
}

export function updateGroup(groupId: string, updates: Partial<GolfGroup>): GolfGroup | null {
  const index = groupsStore.findIndex(g => g.id === groupId);
  if (index === -1) return null;
  groupsStore[index] = { ...groupsStore[index], ...updates };
  return groupsStore[index];
}

export function deleteGroup(groupId: string): boolean {
  const index = groupsStore.findIndex(g => g.id === groupId);
  if (index === -1) return false;
  groupsStore.splice(index, 1);
  return true;
}

// ============================================
// GAME READINESS VALIDATION
// ============================================

// Mock member names for error messages
const mockMemberNames: Record<string, string> = {
  'member-001': 'Marcus Chen',
  'member-002': 'Jake Thompson',
  'member-003': 'Devon Miller',
  'member-004': 'Ryan Cooper',
  'member-005': 'Tommy Nakamura',
  'member-006': 'Alex Vasquez',
};

export function validateGameReadiness(gameId: string): GameReadiness {
  const game = gamesStore.find(g => g.id === gameId);
  if (!game) {
    return {
      isReady: false,
      errors: [{
        code: 'no_groups_created',
        message: 'Game not found',
      }],
    };
  }

  const groups = getGroupsByGame(gameId);
  const errors: GameReadinessError[] = [];

  // Check if any groups exist
  if (groups.length === 0) {
    errors.push({
      code: 'no_groups_created',
      message: 'No groups have been created. Assign all golfers to groups before starting.',
    });
    return { isReady: false, errors };
  }

  // Get all member IDs that are in groups
  const groupedMemberIds = new Set<string>();
  groups.forEach(group => {
    group.memberIds.forEach(id => groupedMemberIds.add(id));
  });

  // Find players who are not assigned to any group
  const unassignedPlayerIds = game.playerIds.filter(id => !groupedMemberIds.has(id));

  if (unassignedPlayerIds.length > 0) {
    const unassignedNames = unassignedPlayerIds.map(id => mockMemberNames[id] || id);
    errors.push({
      code: 'missing_group_assignment',
      message: `${unassignedPlayerIds.length} golfer${unassignedPlayerIds.length > 1 ? 's are' : ' is'} not assigned to a group`,
      affectedMemberIds: unassignedPlayerIds,
      affectedMemberNames: unassignedNames,
    });
  }

  return {
    isReady: errors.length === 0,
    errors,
  };
}
