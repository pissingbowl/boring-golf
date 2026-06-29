// ============================================
// BORING GOLF - Mock Data Index
// Central export for all mock data
// ============================================

// Users & Profiles
export { 
  primaryUser, 
  primaryUserSurvey, 
  mockUsers, 
  getMockUserById 
} from './users';

// Trips & Members
export { 
  activeTrip, 
  tripMembers, 
  allTrips,
  computeRiskSummary, 
  getTripWithDetails,
  inviteMember,
  updateMember,
  removeMember,
  changeMemberRole
} from './trips';

// Itinerary
export { 
  mockItinerary, 
  getItineraryByTripId, 
  getItineraryBlockById,
  // Builder (drag-and-drop)
  mockBuilderBlocks,
  getBuilderBlocksByTrip,
  createBuilderBlock,
  updateBuilderBlock,
  deleteBuilderBlock,
  reorderBuilderBlocks,
  moveBlockToDay
} from './itinerary';

// Logistics (Travel & Bags)
export { 
  mockTravelItems, 
  mockBags, 
  mockShipments,
  getTravelItemsByMember, 
  getBagsByMember, 
  getShipmentsByTrip 
} from './logistics';

// Expenses
export { 
  mockExpenses, 
  getExpensesByTrip, 
  computeExpenseSummary 
} from './expenses';

// Issues, Tasks & Announcements
export { 
  mockIssues, 
  mockTasks, 
  mockAnnouncements,
  getIssuesByTrip, 
  getTasksByTrip, 
  getAnnouncementsByTrip 
} from './issues';

// Tournaments
export { 
  mockTournaments, 
  mockTeams, 
  mockRounds, 
  mockScores,
  computeLeaderboard,
  getTournamentsByTrip, 
  getTeamsByTournament, 
  getRoundsByTournament, 
  getScoresByRound,
  mockGames,
  getGamesByTrip,
  createGame,
  updateGame,
  deleteGame,
  mockGolfGroups,
  getGroupsByGame,
  getGroupsByTrip,
  createGroup,
  updateGroup,
  deleteGroup,
  validateGameReadiness
} from './tournaments';

// Ledger & Payments
export {
  mockLedgerEntries,
  mockPaymentMethods,
  getLedgerEntriesByTrip,
  getLedgerBalances,
  getLedgerSummary,
  getSettlementsByTrip,
  createSettlement,
  getPaymentMethods,
  resetSettlements
} from './ledger';
