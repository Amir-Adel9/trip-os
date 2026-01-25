import type { TripData, TripDay, TripEvent, EventType } from "./trip-types"

/**
 * Maps Botpress response format to TripData format
 * Botpress may return data in a slightly different structure
 */
export function mapBotpressToTripData(data: Record<string, any>): TripData | null {
  console.log('[Mapping] Starting mapping for data:', data);
  try {
    if (!data || typeof data !== 'object') {
      console.error('[Mapping] Input is not an object');
      return null;
    }

    // Handle the Botpress format that includes budget object and title
    const budget = data.budget && typeof data.budget === 'object' ? data.budget : null;
    const rawDays = Array.isArray(data.days) ? data.days : [];
    
    console.log('[Mapping] Found rawDays count:', rawDays.length);

    // Calculate duration from days array if missing
    const duration = data.duration || (rawDays.length > 0 ? `${rawDays.length} days` : "0 days");
    const totalBudget = budget?.total || data.totalBudget || 0;

    const mappedDays: TripDay[] = rawDays.map((day: any, index: number) => {
      // Extract day number from "Day 1" or use index + 1
      let dayNumber = index + 1;
      if (typeof day.day === 'number') {
        dayNumber = day.day;
      } else if (day.label && typeof day.label === 'string') {
        const match = day.label.match(/\d+/);
        if (match) dayNumber = parseInt(match[0]);
      } else if (day.id && typeof day.id === 'string') {
        const match = day.id.match(/\d+/);
        if (match) dayNumber = parseInt(match[0]);
      }

      // Map events and normalize costs
      const mappedEvents: TripEvent[] = Array.isArray(day.events) ? day.events.map((event: any) => {
        // Handle cost being an object { amount: number, currency: string }
        let costValue = 0;
        if (typeof event.cost === 'number') {
          costValue = event.cost;
        } else if (event.cost && typeof event.cost === 'object' && typeof event.cost.amount === 'number') {
          costValue = event.cost.amount;
        }

        // Normalize event type to allowed types
        let eventType: EventType = "activity";
        const rawType = String(event.type || "").toLowerCase();
        if (rawType === "food" || rawType === "restaurant" || rawType === "dining") {
          eventType = "food";
        } else if (rawType === "transport" || rawType === "flight" || rawType === "train" || rawType === "bus" || rawType === "taxi") {
          eventType = "transport";
        } else if (rawType === "accommodation" || rawType === "hotel" || rawType === "stay") {
          eventType = "accommodation";
        } else if (rawType === "activity") {
          eventType = "activity";
        }

        return {
          id: String(event.id || Math.random().toString(36).substr(2, 9)),
          time: String(event.time || "00:00"),
          title: String(event.title || "Untitled Event"),
          description: String(event.description || ""),
          type: eventType,
          location: String(event.location || ""),
          cost: costValue,
          duration: String(event.duration || "1h")
        };
      }) : [];

      // Calculate total cost for the day if missing
      const totalCost = typeof day.totalCost === 'number' 
        ? day.totalCost 
        : mappedEvents.reduce((sum: number, e: TripEvent) => sum + e.cost, 0);

      const resultDay: TripDay = {
        day: dayNumber,
        date: String(day.date || (day.label ? day.label : `Day ${dayNumber}`)),
        title: String(day.title || day.focus || day.label || "Daily Itinerary"),
        totalCost: totalCost,
        events: mappedEvents
      };
      
      console.log(`[Mapping] Day ${dayNumber} mapped:`, resultDay);
      return resultDay;
    });

    // Calculate total of all event costs
    const actualTotalCost = mappedDays.reduce((sum, day) => 
      sum + day.events.reduce((eventSum, event) => eventSum + event.cost, 0), 0
    );

    // Normalize costs to match budget if needed
    const targetBudget = Number(totalBudget);
    const currency = String(budget?.currency || data.currency || "USD");
    
    if (actualTotalCost > 0 && targetBudget > 0 && Math.abs(actualTotalCost - targetBudget) > 1) {
      const scaleFactor = targetBudget / actualTotalCost;
      console.log(`[Mapping] Scaling costs by ${scaleFactor.toFixed(2)} to match budget`);
      
      mappedDays.forEach(day => {
        day.events.forEach(event => {
          event.cost = Math.round(event.cost * scaleFactor);
        });
        // Recalculate day total
        day.totalCost = day.events.reduce((sum, e) => sum + e.cost, 0);
      });
    }

    const finalResult: TripData = {
      destination: String(data.destination || "Unknown Destination"),
      duration: String(duration),
      totalBudget: targetBudget,
      currency: currency,
      days: mappedDays
    };
    
    console.log('[Mapping] Final mapped data:', finalResult);
    return finalResult;
  } catch (error) {
    console.error('[Mapping Error] Critical error during mapping:', error);
    return null;
  }
}

/**
 * Validation function to check if data matches TripData shape
 */
export function isValidTripData(data: TripData): boolean {
  if (!data || typeof data !== 'object') {
    console.warn('[Validation] Not an object:', data);
    return false;
  }
  
  // Check required top-level fields
  if (!data.destination || !data.duration || typeof data.totalBudget !== 'number') {
    console.warn('[Validation] Missing required fields:', { 
      destination: data.destination, 
      duration: data.duration, 
      totalBudget: data.totalBudget 
    });
    return false;
  }
  
  // Check days array
  if (!Array.isArray(data.days) || data.days.length === 0) {
    console.warn('[Validation] Invalid days array:', data.days);
    return false;
  }
  
  // Validate each day
  for (const day of data.days) {
    if (typeof day.day !== 'number' || !day.date || !day.title) {
      console.warn('[Validation] Invalid day structure:', day);
      return false;
    }
    if (typeof day.totalCost !== 'number') {
      console.warn('[Validation] Invalid totalCost:', day.totalCost);
      return false;
    }
    if (!Array.isArray(day.events) || day.events.length === 0) {
      console.warn('[Validation] Invalid events array:', day.events);
      return false;
    }
    
    // Validate each event
    for (const event of day.events) {
      // id, time, title, description, and type are REQUIRED
      if (!event.id || !event.time || !event.title || event.description === undefined || !event.type) {
        console.warn('[Validation] Invalid event - missing required field:', event);
        return false;
      }
      if (typeof event.cost !== 'number') {
        console.warn('[Validation] Invalid cost:', event.cost);
        return false;
      }
      // location and duration are optional but should be strings if present
      if (event.location !== undefined && typeof event.location !== 'string') {
        console.warn('[Validation] Invalid location type:', event.location);
        return false;
      }
      if (event.duration !== undefined && typeof event.duration !== 'string') {
        console.warn('[Validation] Invalid duration type:', event.duration);
        return false;
      }
    }
  }
  
  console.log('[Validation] ✅ Data is valid!');
  return true;
}

/**
 * Extracts trip JSON from a Botpress response
 */
export function extractTripJson(response: any): any | null {
  if (!response) return null;

  // 1. Check metadata for structured JSON
  if (response.metadata && typeof response.metadata === 'object' && response.metadata.type !== 'text') {
    return response.metadata;
  }

  // 2. Check reply text for JSON
  if (response.reply && typeof response.reply === 'string') {
    try {
      // Look for JSON pattern in text if it's not pure JSON
      const jsonMatch = response.reply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(response.reply);
    } catch (e) {
      // Not JSON or invalid JSON
    }
  }

  return null;
}

/**
 * Formats a number as a currency string
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    // Fallback if currency code is invalid
    const symbol = currency.toUpperCase() === 'EUR' ? '€' : 
                   currency.toUpperCase() === 'GBP' ? '£' : 
                   currency.toUpperCase() === 'JPY' ? '¥' : '$';
    return `${symbol}${amount}`;
  }
}
