/**
 * Trip OS - Shared TypeScript Types
 * 
 * These types define the structure of tripState, the single source of truth
 * for all trip data in the Trip OS application.
 */

export type EventType = "activity" | "food" | "transport" | "accommodation" | "rest";

export interface TripEvent {
  id: string;
  time: string;
  title: string;
  description: string;
  type: EventType;
  location?: string;
  cost: number;
  duration?: string;
}

export interface TripDay {
  day: number;
  date: string;
  title: string;
  totalCost: number;
  events: TripEvent[];
}

export interface TripBudget {
  currency: string;
  total: number;
  spent: number;
  breakdown: {
    food: number;
    activity: number;
    travel: number;
  };
}

export interface TripState {
  id: string; // Convex doc id (will be set by Convex)
  destination: string;
  title: string;
  summary: string;
  days: TripDay[];
  budget: TripBudget;
  logs: string[]; // OS-style change log lines
  createdAt: number; // Date.now() timestamp
  updatedAt: number; // Date.now() timestamp
}
