import { Venue } from './types.ts';

export const MOCK_RESTAURANTS: Venue[] = [
  { id: 'r1', name: 'Luigi\'s Trattoria', type: 'RESTAURANT', categories: ['Italian', 'Vegetarian-Friendly'], costPerPerson: 45, address: '123 Main St, Irvine', distanceMiles: 5, description: 'Cozy Italian spot with great pasta.', violatesBoundaries: [] },
  { id: 'r2', name: 'Spicy Dragon', type: 'RESTAURANT', categories: ['Chinese', 'Spicy'], costPerPerson: 30, address: '456 Oak Ave, Irvine', distanceMiles: 8, description: 'Authentic Szechuan cuisine.', violatesBoundaries: [] },
  { id: 'r3', name: 'Green Leaf Vegan', type: 'RESTAURANT', categories: ['Vegan', 'Healthy'], costPerPerson: 25, address: '789 Pine Ln, Irvine', distanceMiles: 12, description: '100% plant-based menu.', violatesBoundaries: [] },
  { id: 'r4', name: 'The Steakhouse', type: 'RESTAURANT', categories: ['Steak', 'American'], costPerPerson: 90, address: '101 High St, Newport', distanceMiles: 15, description: 'Premium cuts and fine wine.', violatesBoundaries: [] },
  { id: 'r5', name: 'Taco Fiesta', type: 'RESTAURANT', categories: ['Mexican', 'Casual'], costPerPerson: 15, address: '222 Beach Blvd, Costa Mesa', distanceMiles: 10, description: 'Lively atmosphere and great margaritas.', violatesBoundaries: [] },
];

export const MOCK_ACTIVITIES: Venue[] = [
  { id: 'a1', name: 'Irvine Improv', type: 'ACTIVITY', categories: ['Comedy', 'Indoor'], costPerPerson: 35, address: '500 Spectrum Center Dr', distanceMiles: 6, description: 'Stand-up comedy featuring local and national acts.', violatesBoundaries: [] },
  { id: 'a2', name: 'Neon Lanes Bowling', type: 'ACTIVITY', categories: ['Bowling', 'Casual'], costPerPerson: 20, address: '300 Bowl Way', distanceMiles: 4, description: 'Cosmic bowling with a full bar.', violatesBoundaries: [] },
  { id: 'a3', name: 'Escape The Room', type: 'ACTIVITY', categories: ['Escape Room', 'Puzzle'], costPerPerson: 40, address: '400 Mystery St', distanceMiles: 9, description: 'Challenging puzzles for groups.', violatesBoundaries: [] },
  { id: 'a4', name: 'Starlight Nightclub', type: 'ACTIVITY', categories: ['Dancing', 'Nightclub'], costPerPerson: 50, address: '800 Club Rd', distanceMiles: 14, description: 'Loud music and dancing until 2 AM.', violatesBoundaries: ['no_nightclubs'] },
  { id: 'a5', name: 'Regal Cinemas', type: 'ACTIVITY', categories: ['Movies', 'Indoor'], costPerPerson: 18, address: '600 Spectrum Center Dr', distanceMiles: 6, description: 'Latest blockbusters in IMAX.', violatesBoundaries: [] },
];

export const AVAILABLE_CUISINES = ['Italian', 'Chinese', 'Mexican', 'American', 'Vegan', 'Japanese', 'Indian'];
export const AVAILABLE_ACTIVITIES = ['Comedy', 'Bowling', 'Escape Room', 'Movies', 'Dancing', 'Live Music'];
export const AVAILABLE_BOUNDARIES = ['no_nightclubs', 'no_alcohol', 'no_smoking'];
export const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-Free', 'Nut Allergy'];
