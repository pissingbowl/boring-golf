// ============================================
// USER SERVICE
// Data access functions that can be swapped to Supabase
// ============================================

import type { UserProfile, SurveyResponse } from '@shared/domain';
import { primaryUser, primaryUserSurvey, mockUsers, getMockUserById } from '../mocks';

// Current logged-in user ID (mock)
const CURRENT_USER_ID = 'user-001';

/**
 * Get the currently authenticated user's profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  // TODO: Replace with Supabase auth.getUser() + profile fetch
  return primaryUser;
}

/**
 * Get a user profile by ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  // TODO: Replace with Supabase query
  const user = getMockUserById(userId);
  return user || null;
}

/**
 * Get the current user's ID
 */
export function getCurrentUserId(): string {
  // TODO: Replace with Supabase auth.getUser()
  return CURRENT_USER_ID;
}

/**
 * Check if user has completed their survey
 */
export async function hasCompletedSurvey(userId: string): Promise<boolean> {
  const user = await getUserProfile(userId);
  return user?.surveyCompleted ?? false;
}

/**
 * Get user's survey response
 */
export async function getUserSurvey(userId: string): Promise<SurveyResponse | null> {
  // TODO: Replace with Supabase query
  if (userId === primaryUser.id) {
    return primaryUserSurvey;
  }
  return null;
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string, 
  updates: Partial<UserProfile>
): Promise<UserProfile | null> {
  // TODO: Replace with Supabase update
  const user = await getUserProfile(userId);
  if (!user) return null;
  
  // In mock mode, just return merged object (not persisted)
  return { ...user, ...updates };
}

/**
 * Submit survey and compute archetype
 */
export async function submitSurvey(
  userId: string,
  responses: Record<string, string | number | boolean>
): Promise<SurveyResponse> {
  // TODO: Replace with Supabase insert + archetype computation
  const archetype = computeArchetype(responses);
  
  return {
    userId,
    responses,
    completedAt: new Date(),
    computedArchetype: archetype,
  };
}

/**
 * Compute archetype from survey responses
 * This logic can be shared with Edge Functions
 */
function computeArchetype(
  responses: Record<string, string | number | boolean>
): UserProfile['archetype'] {
  // Simple scoring algorithm - in production this would be more sophisticated
  const golfImportance = Number(responses['golf_importance'] || 3);
  const planningPref = Number(responses['planning_preference'] || 3);
  const socialPriority = Number(responses['social_priority'] || 3);
  const competitionInterest = Number(responses['competition_interest'] || 3);
  const localExploration = Number(responses['local_exploration'] || 3);
  const scheduleFlexibility = Number(responses['schedule_flexibility'] || 3);
  
  // Determine dominant trait
  const traits = [
    { archetype: 'the_golfer' as const, score: golfImportance + (5 - socialPriority) },
    { archetype: 'the_planner' as const, score: planningPref + (5 - scheduleFlexibility) },
    { archetype: 'the_socializer' as const, score: socialPriority + (5 - golfImportance) },
    { archetype: 'the_competitor' as const, score: competitionInterest + golfImportance },
    { archetype: 'the_explorer' as const, score: localExploration + scheduleFlexibility },
    { archetype: 'the_easy_going' as const, score: scheduleFlexibility + (5 - planningPref) },
  ];
  
  traits.sort((a, b) => b.score - a.score);
  return traits[0].archetype;
}
