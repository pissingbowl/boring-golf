import type { UserProfile, SurveyResponse, UserPreferences } from '@shared/domain';

// Primary user with completed survey and archetype
export const primaryUser: UserProfile = {
  id: 'user-001',
  email: 'jake.morrison@email.com',
  name: 'Jake Morrison',
  phone: '+1 (512) 555-0147',
  avatarUrl: undefined,
  surveyCompleted: true,
  archetype: 'the_golfer',
  preferences: {
    handicap: 14,
    ghin: '2847591',
    tshirtSize: 'L',
    hatSize: '7 1/4',
    dietaryRestrictions: undefined,
    emergencyContactName: 'Sarah Morrison',
    emergencyContactPhone: '+1 (512) 555-0148',
    preferredTeeTime: 'early',
    drinkPreference: 'Bourbon, neat',
  },
  createdAt: new Date('2024-03-15T10:00:00Z'),
};

export const primaryUserSurvey: SurveyResponse = {
  userId: 'user-001',
  responses: {
    'golf_importance': 5,
    'planning_preference': 2,
    'social_priority': 3,
    'competition_interest': 4,
    'local_exploration': 2,
    'schedule_flexibility': 3,
  },
  completedAt: new Date('2024-03-15T10:30:00Z'),
  computedArchetype: 'the_golfer',
};

// All mock users (for trip members)
export const mockUsers: UserProfile[] = [
  primaryUser,
  {
    id: 'user-002',
    email: 'marcus.chen@email.com',
    name: 'Marcus Chen',
    phone: '+1 (415) 555-0234',
    surveyCompleted: true,
    archetype: 'the_planner',
    preferences: {
      handicap: 8,
      ghin: '1928374',
      tshirtSize: 'M',
      hatSize: '7',
      dietaryRestrictions: 'Vegetarian',
      preferredTeeTime: 'mid',
    },
    createdAt: new Date('2024-02-20T08:00:00Z'),
  },
  {
    id: 'user-003',
    email: 'devon.williams@email.com',
    name: 'Devon Williams',
    phone: '+1 (310) 555-0891',
    surveyCompleted: true,
    archetype: 'the_socializer',
    preferences: {
      handicap: 22,
      tshirtSize: 'XL',
      hatSize: '7 3/8',
      preferredTeeTime: 'late',
      drinkPreference: 'IPA',
    },
    createdAt: new Date('2024-01-10T14:00:00Z'),
  },
  {
    id: 'user-004',
    email: 'ryan.oconnor@email.com',
    name: "Ryan O'Connor",
    phone: '+1 (617) 555-0456',
    surveyCompleted: true,
    archetype: 'the_competitor',
    preferences: {
      handicap: 4,
      ghin: '8473920',
      tshirtSize: 'L',
      hatSize: '7 1/8',
      dietaryRestrictions: 'Gluten-free',
      preferredTeeTime: 'early',
    },
    createdAt: new Date('2024-04-01T09:00:00Z'),
  },
  {
    id: 'user-005',
    email: 'tommy.nguyen@email.com',
    name: 'Tommy Nguyen',
    phone: '+1 (214) 555-0789',
    surveyCompleted: true,
    archetype: 'the_easy_going',
    preferences: {
      handicap: 18,
      tshirtSize: 'M',
      hatSize: '7',
      preferredTeeTime: 'mid',
      drinkPreference: 'Tequila soda',
    },
    createdAt: new Date('2024-03-01T11:00:00Z'),
  },
  {
    id: 'user-006',
    email: 'alex.hartman@email.com',
    name: 'Alex Hartman',
    phone: '+1 (303) 555-0321',
    surveyCompleted: true,
    archetype: 'the_explorer',
    preferences: {
      handicap: 16,
      ghin: '5738291',
      tshirtSize: 'L',
      hatSize: '7 1/4',
      preferredTeeTime: 'mid',
    },
    createdAt: new Date('2024-02-15T16:00:00Z'),
  },
];

export function getMockUserById(userId: string): UserProfile | undefined {
  return mockUsers.find(u => u.id === userId);
}
