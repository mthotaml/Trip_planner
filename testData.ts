import { OutingType, PlanDetails, Participant } from './types.ts';

export interface TestScenario {
  name: string;
  details: PlanDetails;
  participants: Participant[];
}

export const TEST_SCENARIOS: TestScenario[] = [
  {
    name: "PRD: Irvine 6-Person (Strict Constraints)",
    details: {
      name: "Saturday Night in Irvine",
      type: OutingType.FRIENDS,
      date: "2024-10-26",
      location: "Irvine, CA",
      preferredStartTime: "18:00",
      latestEndTime: "23:00",
      expectedSize: 6,
      preferredRadiusMiles: 20
    },
    participants: [
      { id: 'p1', name: 'Alice', budgetMax: 100, maxDistance: 20, dietaryRestrictions: ['Vegetarian'], likedCuisines: ['Italian', 'Mexican'], activityInterests: ['Comedy', 'Escape Room'], hardBoundaries: ['no_nightclubs'] },
      { id: 'p2', name: 'Bob', budgetMax: 120, maxDistance: 25, dietaryRestrictions: [], likedCuisines: ['American', 'Steak'], activityInterests: ['Bowling', 'Movies'], hardBoundaries: ['no_nightclubs'] },
      { id: 'p3', name: 'Charlie', budgetMax: 90, maxDistance: 15, dietaryRestrictions: [], likedCuisines: ['Chinese', 'Japanese'], activityInterests: ['Comedy', 'Live Music'], hardBoundaries: ['no_nightclubs'] },
      { id: 'p4', name: 'Diana', budgetMax: 150, maxDistance: 30, dietaryRestrictions: [], likedCuisines: ['Italian', 'Vegan'], activityInterests: ['Escape Room', 'Dancing'], hardBoundaries: ['no_nightclubs'] },
      { id: 'p5', name: 'Eve', budgetMax: 100, maxDistance: 20, dietaryRestrictions: [], likedCuisines: ['Mexican', 'Indian'], activityInterests: ['Bowling', 'Comedy'], hardBoundaries: ['no_nightclubs'] },
      { id: 'p6', name: 'Frank', budgetMax: 110, maxDistance: 20, dietaryRestrictions: [], likedCuisines: ['American', 'Chinese'], activityInterests: ['Movies', 'Escape Room'], hardBoundaries: ['no_nightclubs'] }
    ]
  },
  {
    name: "Date Night: High Budget",
    details: {
      name: "Anniversary Dinner",
      type: OutingType.COUPLE,
      date: "2024-11-02",
      location: "Newport Beach",
      preferredStartTime: "19:00",
      latestEndTime: "23:30",
      expectedSize: 2,
      preferredRadiusMiles: 15
    },
    participants: [
      { id: 'p1', name: 'Romeo', budgetMax: 200, maxDistance: 15, dietaryRestrictions: [], likedCuisines: ['Steak', 'Italian'], activityInterests: ['Live Music', 'Comedy', 'Dancing'], hardBoundaries: [] },
      { id: 'p2', name: 'Juliet', budgetMax: 200, maxDistance: 15, dietaryRestrictions: [], likedCuisines: ['Italian', 'Japanese'], activityInterests: ['Live Music', 'Dancing'], hardBoundaries: [] }
    ]
  },
  {
    name: "Cheap Casual Hangout",
    details: {
      name: "Friday Chill",
      type: OutingType.FRIENDS,
      date: "2024-10-25",
      location: "Costa Mesa",
      preferredStartTime: "18:30",
      latestEndTime: "22:00",
      expectedSize: 4,
      preferredRadiusMiles: 10
    },
    participants: [
      { id: 'p1', name: 'Sam', budgetMax: 50, maxDistance: 10, dietaryRestrictions: [], likedCuisines: ['Mexican', 'American'], activityInterests: ['Bowling', 'Movies'], hardBoundaries: ['no_alcohol'] },
      { id: 'p2', name: 'Alex', budgetMax: 45, maxDistance: 15, dietaryRestrictions: [], likedCuisines: ['Mexican', 'Chinese'], activityInterests: ['Bowling', 'Arcade'], hardBoundaries: [] },
      { id: 'p3', name: 'Jordan', budgetMax: 50, maxDistance: 10, dietaryRestrictions: ['Vegan'], likedCuisines: ['Vegan', 'Mexican'], activityInterests: ['Movies', 'Comedy'], hardBoundaries: [] },
      { id: 'p4', name: 'Casey', budgetMax: 45, maxDistance: 10, dietaryRestrictions: [], likedCuisines: ['American', 'Italian'], activityInterests: ['Bowling', 'Trivia'], hardBoundaries: [] }
    ]
  },
  {
    name: "Impossible Constraints (Test Error State)",
    details: {
      name: "Mission Impossible",
      type: OutingType.FRIENDS,
      date: "2024-10-31",
      location: "Irvine",
      preferredStartTime: "18:00",
      latestEndTime: "23:00",
      expectedSize: 2,
      preferredRadiusMiles: 5
    },
    participants: [
      { id: 'p1', name: 'Broke Vegan', budgetMax: 10, maxDistance: 5, dietaryRestrictions: ['Vegan'], likedCuisines: ['Vegan'], activityInterests: ['Movies'], hardBoundaries: [] },
      { id: 'p2', name: 'Steak Lover', budgetMax: 100, maxDistance: 20, dietaryRestrictions: [], likedCuisines: ['Steak'], activityInterests: ['Bowling'], hardBoundaries: [] }
    ]
  }
];
