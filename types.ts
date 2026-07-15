export enum OutingType {
  FRIENDS = 'FRIENDS',
  COUPLE = 'COUPLE',
  COUPLES_GROUP = 'COUPLES_GROUP'
}

export enum PlanStatus {
  DRAFT = 'DRAFT',
  COLLECTING_PREFS = 'COLLECTING_PREFS',
  GENERATING = 'GENERATING',
  VOTING = 'VOTING',
  CONFIRMED = 'CONFIRMED',
  COORDINATING = 'COORDINATING',
  HOME_SAFE = 'HOME_SAFE',
  COMPLETED = 'COMPLETED'
}

export interface Participant {
  id: string;
  name: string;
  budgetMax: number;
  dietaryRestrictions: string[];
  likedCuisines: string[];
  activityInterests: string[];
  hardBoundaries: string[];
  maxDistance: number;
}

export interface PlanDetails {
  name: string;
  type: OutingType;
  date: string;
  location: string;
  preferredStartTime: string;
  latestEndTime: string;
  expectedSize: number;
  preferredRadiusMiles: number;
}

export interface Venue {
  id: string;
  name: string;
  type: 'RESTAURANT' | 'ACTIVITY';
  categories: string[]; // e.g., ['Italian', 'Vegetarian-Friendly'] or ['Comedy', 'Indoor']
  costPerPerson: number;
  address: string;
  distanceMiles: number;
  description: string;
  violatesBoundaries: string[]; // e.g., ['nightclub']
}

export interface Agenda {
  id: string;
  restaurant: Venue;
  activity: Venue;
  totalCostEstimate: number;
  totalDistance: number;
  score: number;
  whyItFits: string;
}

export interface Vote {
  participantId: string;
  firstChoiceId: string;
  secondChoiceId: string;
  thirdChoiceId: string;
}

export interface AppState {
  status: PlanStatus;
  details: PlanDetails | null;
  participants: Participant[];
  agendas: Agenda[];
  votes: Vote[];
  winningAgendaId: string | null;
  error: string | null;
  assemblyPoint?: string;
  assemblyTime?: string;
  designatedDriverId?: string;
  homeSafeCheckIns: string[];
}
