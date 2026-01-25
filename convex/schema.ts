import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Convex Schema for Trip OS
 * 
 * Defines the trips table structure. Complex fields (days, budget, logs)
 * are stored as JSON for flexibility.
 */
export default defineSchema({
  trips: defineTable({
    destination: v.string(),
    userId: v.optional(v.string()),
    title: v.string(),
    summary: v.string(),
    days: v.any(), // JSON array of TripDay objects
    budget: v.any(), // JSON TripBudget object
    logs: v.any(), // JSON array of strings
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user_id", ["userId"]),
});
