// ============================================
// BORING GOLF - Services Index
// Central export for all data access functions
// These are the functions that will be swapped to Supabase
// ============================================

// User services
export {
  getCurrentUser,
  getUserProfile,
  getCurrentUserId,
  hasCompletedSurvey,
  getUserSurvey,
  updateUserProfile,
  submitSurvey,
} from './users';

// Trip services
export {
  getUserTrips,
  getTrip,
  getTripWithDetails,
  getActiveTrip,
  getTripMembers,
  getTripMember,
  getMemberIdForUser,
  getTripRiskSummary,
  getTripGravityState,
  getTripByInviteCode,
  createTrip,
  updateTrip,
} from './trips';

// Itinerary services
export {
  getTripItinerary,
  getItineraryBlock,
  getItineraryForDay,
  getUpcomingBlocks,
  getActionRequiredBlocks,
  getBlocksByType,
  createItineraryBlock,
  updateItineraryBlock,
  deleteItineraryBlock,
  getDependentBlocks,
} from './itinerary';

// Expense services
export {
  getTripExpenses,
  getTripExpenseSummary,
  getExpense,
  getMemberExpenses,
  getMemberBalance,
  createExpense,
  updateExpense,
  settleExpense,
  deleteExpense,
  getUnsettledExpenses,
  getExpensesByCategory,
} from './expenses';

// Re-export types for convenience
export type { 
  UserProfile,
  Trip,
  TripWithDetails,
  TripMember,
  ItineraryBlock,
  Expense,
  ExpenseSummary,
  GravityWellState,
} from '@shared/domain';
