"use client";

/**
 * Disposable Convex Test Component
 * 
 * This component tests all Convex operations:
 * - Creating trips
 * - Fetching trips
 * - Updating trips
 * - Appending logs
 * 
 * Can be deleted after testing is complete.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTrip, useCreateTrip, useUpdateTrip, useAppendLog } from "@/hooks/useTrip";
import type { Id } from "@/convex/_generated/dataModel";
import type { TripState } from "@/types/trip";
import { formatCurrency } from "@/lib/trip-utils";

export function ConvexTest() {
  const [tripId, setTripId] = useState<Id<"trips"> | undefined>(undefined);
  const trip = useTrip(tripId);
  const createTrip = useCreateTrip();
  const updateTrip = useUpdateTrip();
  const appendLog = useAppendLog();

  const [status, setStatus] = useState<string>("Ready");

  // Quick test data
  const quickTestTrip: Omit<TripState, "id" | "createdAt" | "updatedAt"> = {
    destination: "Paris, France",
    title: "Weekend in Paris",
    summary: "A quick 2-day trip to explore the City of Light",
    days: [
      {
        id: "day-1",
        label: "Day 1",
        date: "2026-05-20",
        focus: "Arrival and Eiffel Tower",
        events: [
          {
            id: "event-1",
            time: "10:00",
            title: "Arrive at CDG Airport",
            description: "Flight landing",
            type: "transport",
            location: "Charles de Gaulle Airport",
            cost: { amount: 0, currency: "EUR" },
          },
          {
            id: "event-2",
            time: "14:00",
            title: "Eiffel Tower Visit",
            description: "Climb to the top",
            type: "activity",
            location: "Eiffel Tower",
            cost: { amount: 29, currency: "EUR" },
          },
          {
            id: "event-3",
            time: "19:00",
            title: "Dinner at Le Comptoir",
            description: "Traditional French cuisine",
            type: "food",
            location: "Le Comptoir",
            cost: { amount: 85, currency: "EUR" },
          },
        ],
      },
      {
        id: "day-2",
        label: "Day 2",
        date: "2026-05-21",
        focus: "Louvre and Departure",
        events: [
          {
            id: "event-4",
            time: "09:00",
            title: "Louvre Museum",
            description: "Morning visit to see the Mona Lisa",
            type: "activity",
            location: "Louvre Museum",
            cost: { amount: 17, currency: "EUR" },
          },
        ],
      },
    ],
    budget: {
      currency: "EUR",
      total: 500,
      perDay: 250,
      delta: 0,
    },
    logs: ["[System] Test trip created"],
  };

  const handleCreate = async () => {
    setStatus("Creating trip...");
    try {
      const newTripId = await createTrip({
        destination: quickTestTrip.destination,
        title: quickTestTrip.title,
        summary: quickTestTrip.summary,
        days: quickTestTrip.days,
        budget: quickTestTrip.budget,
        logs: quickTestTrip.logs,
      });
      setTripId(newTripId);
      setStatus(`Trip created! ID: ${newTripId}`);
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Create error:", error);
    }
  };

  const handleUpdate = async () => {
    if (!tripId) return;
    setStatus("Updating trip...");
    try {
      await updateTrip({
        tripId,
        patch: {
          title: "Weekend in Paris (Updated)",
          summary: "Updated: A quick 2-day trip to explore the City of Light with new details",
        },
      });
      setStatus("Trip updated successfully!");
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Update error:", error);
    }
  };

  const handleAppendLog = async () => {
    if (!tripId) return;
    setStatus("Appending log...");
    try {
      await appendLog({
        tripId,
        message: `[${new Date().toLocaleTimeString()}] Test log entry added`,
      });
      setStatus("Log appended successfully!");
    } catch (error) {
      setStatus(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
      console.error("Append log error:", error);
    }
  };

  const handleReset = () => {
    setTripId(undefined);
    setStatus("Reset - ready for new test");
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Convex Integration Test</CardTitle>
          <CardDescription>
            Test all Convex operations: Create, Read, Update, Append Log
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCreate} disabled={tripId !== undefined}>
              Create Test Trip
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={tripId === undefined}
              variant="outline"
            >
              Update Trip Title
            </Button>
            <Button
              onClick={handleAppendLog}
              disabled={tripId === undefined}
              variant="outline"
            >
              Append Log
            </Button>
            <Button onClick={handleReset} variant="ghost" size="sm">
              Reset
            </Button>
          </div>

          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-muted-foreground text-xs font-medium">Status:</p>
            <p className="font-mono text-sm text-foreground">{status}</p>
          </div>

          {tripId && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-muted-foreground text-xs font-medium">Trip ID:</p>
              <p className="font-mono text-xs text-foreground break-all">{tripId}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {trip === undefined && tripId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-sm">Loading trip data...</p>
          </CardContent>
        </Card>
      )}

      {trip === null && tripId && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-destructive text-sm">Trip not found</p>
          </CardContent>
        </Card>
      )}

      {trip && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Trip Data</CardTitle>
              <CardDescription>Current trip state from Convex</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-muted-foreground text-xs">Title</p>
                <p className="font-medium text-foreground">{trip.title}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Destination</p>
                <p className="text-foreground text-sm">{trip.destination}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Summary</p>
                <p className="text-foreground text-sm">{trip.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-3">
                <div>
                  <p className="text-muted-foreground text-xs">Days</p>
                  <p className="font-medium text-foreground">
                    {Array.isArray(trip.days) ? trip.days.length : 0}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Budget</p>
                  <p className="font-medium text-foreground">
                    {typeof trip.budget === "object" && "currency" in trip.budget && "total" in trip.budget
                      ? formatCurrency(trip.budget.total as number, trip.budget.currency as string)
                      : "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-muted-foreground text-xs">
              Updated: {new Date(trip.updatedAt).toLocaleString()}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>
                {Array.isArray(trip.logs) ? trip.logs.length : 0} log entries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-3 font-mono text-xs">
                {Array.isArray(trip.logs) && trip.logs.length > 0 ? (
                  trip.logs.map((log, index) => (
                    <div
                      key={index}
                      className="text-muted-foreground border-b border-border/30 pb-1 last:border-0"
                    >
                      {String(log)}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No logs</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Raw JSON</CardTitle>
              <CardDescription>Full trip object (for debugging)</CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="overflow-auto rounded-lg border border-border bg-muted/20 p-3 text-xs">
                {JSON.stringify(trip, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
