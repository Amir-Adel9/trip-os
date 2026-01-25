"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import type { Id } from "../convex/_generated/dataModel";
import type { TripState } from "@/types/trip";

/**
 * Hook to fetch all trips
 * Returns an array of trips or undefined while loading.
 */
import { useSession } from "./useSession";

/**
 * Hook to fetch all trips
 * Returns an array of trips or undefined while loading.
 */
export function useListTrips() {
  const userId = useSession();
  return useQuery(api.trips.listTrips, { userId: userId ?? undefined });
}

/**
 * Hook to fetch a trip by ID
 * Returns the trip data or undefined while loading, or null if not found.
 */
export function useTrip(tripId: Id<"trips"> | undefined) {
  return useQuery(
    api.trips.getTrip,
    tripId === undefined ? "skip" : { tripId }
  );
}

/**
 * Hook to create a new trip
 * Returns a mutation function that accepts trip data (without id, createdAt, updatedAt).
 */
export function useCreateTrip() {
  const userId = useSession();
  const mutation = useMutation(api.trips.createTrip);
  
  return async (args: Omit<Parameters<typeof mutation>[0], "userId">) => {
    if (!userId) throw new Error("User session not initialized");
    return mutation({ ...args, userId });
  };
}

/**
 * Hook to update a trip with a partial patch
 * Returns a mutation function that accepts tripId and a partial TripState patch.
 */
export function useUpdateTrip() {
  return useMutation(api.trips.updateTrip);
}

/**
 * Hook to append a log message to a trip's logs array
 * Returns a mutation function that accepts tripId and a message string.
 */
export function useAppendLog() {
  return useMutation(api.trips.appendLog);
}
