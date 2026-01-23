export type EventType = "activity" | "food" | "transport" | "accommodation" | "rest"

export interface TripEvent {
  id: string
  time: string
  title: string
  description: string
  type: EventType
  location?: string
  cost: number
  duration?: string
}

export interface TripDay {
  day: number
  date: string
  title: string
  totalCost: number
  events: TripEvent[]
}

export interface Budget {
  total: number
  spent: number
  breakdown: {
    food: number
    activity: number
    travel: number
  }
  currency: string
}

export interface TripData {
  destination: string
  duration: string
  totalBudget: number
  currency?: string
  days: TripDay[]
}
