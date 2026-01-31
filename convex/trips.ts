import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { TripState } from "../types/trip";

/**
 * Query: Get all trips
 * Returns an array of all trip documents, sorted by createdAt descending.
 */
export const listTrips = query({
  args: {
    userId: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!args.userId) return [];
    
    const trips = await ctx.db
      .query("trips")
      .withIndex("by_user_id", (q) => q.eq("userId", args.userId!))
      .order("desc")
      .collect();
    
    return trips.map(trip => ({
      ...trip,
      id: trip._id,
    })) as TripState[];
  },
});

/**
 * Query: Get a trip by ID
 * Returns the full trip document or null if not found.
 */
export const getTrip = query({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return null;
    // Map Convex _id to id for TripState type
    return {
      ...trip,
      id: trip._id,
    } as TripState;
  },
});

/**
 * Mutation: Create a new trip
 * Auto-generates createdAt and updatedAt timestamps.
 * Returns the created trip's ID.
 */
export const createTrip = mutation({
  args: {
    userId: v.string(),
    destination: v.string(),
    title: v.string(),
    summary: v.string(),
    days: v.any(), // JSON array of TripDay objects
    budget: v.any(), // JSON TripBudget object
    logs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const tripId = await ctx.db.insert("trips", {
      userId: args.userId,
      destination: args.destination,
      title: args.title,
      summary: args.summary,
      days: args.days,
      budget: args.budget,
      logs: args.logs || [],
      createdAt: now,
      updatedAt: now,
    });
    return tripId;
  },
});

/**
 * Mutation: Update a trip with a partial patch
 * Merges the patch into the existing document and updates updatedAt timestamp.
 */
export const updateTrip = mutation({
  args: {
    tripId: v.id("trips"),
    patch: v.any(), // Partial<TripState> as JSON
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.tripId);
    if (!existing) {
      throw new Error(`Trip with id ${args.tripId} not found`);
    }

    // Merge patch, excluding _id, createdAt, and updatedAt from patch
    const { _id, id, createdAt, ...patchWithoutId } = args.patch as any;
    const updated = {
      ...existing,
      ...patchWithoutId,
      updatedAt: Date.now(), // Always update timestamp
    };

    await ctx.db.patch(args.tripId, updated);
  },
});

/**
 * Mutation: Append a log message to a trip's logs array
 * Updates the updatedAt timestamp.
 */
export const appendLog = mutation({
  args: {
    tripId: v.id("trips"),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error(`Trip with id ${args.tripId} not found`);
    }

    const currentLogs = (trip.logs as string[]) || [];
    const updatedLogs = [...currentLogs, args.message];

    await ctx.db.patch(args.tripId, {
      logs: updatedLogs,
      updatedAt: Date.now(), // Always update timestamp
    });
  },
});

/**
 * Mutation: Delete a trip
 * Removes the trip document from the database.
 */
export const deleteTrip = mutation({
  args: {
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.tripId);
    if (!existing) {
      throw new Error(`Trip with id ${args.tripId} not found`);
    }
    await ctx.db.delete(args.tripId);
  },
});
