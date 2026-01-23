"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTrip, useCreateTrip, useAppendLog } from "@/hooks/useTrip";
import type { Id } from "@/convex/_generated/dataModel";
import type { TripState } from "@/types/trip";

/**
 * Demo page to test Convex integration
 * 
 * Demonstrates:
 * - Creating a trip with mocked data
 * - Fetching and displaying trip data
 * - Appending log messages
 * 
 * Follows Trip OS UI/UX: dark mode, OS-style panels, system-log feel
 */
export default function DebugTripPage() {
  const [tripId, setTripId] = useState<Id<"trips"> | undefined>(undefined);
  const trip = useTrip(tripId);
  const createTrip = useCreateTrip();
  const appendLog = useAppendLog();

  // Mock trip data for demo
  const mockTripData: Omit<TripState, "id" | "createdAt" | "updatedAt"> = {
    destination: "Tokyo, Japan",
    title: "Spring Adventure in Tokyo",
    summary: "A 5-day exploration of Tokyo's culture, food, and technology",
    days: [
      {
        id: "day-1",
        label: "Day 1",
        date: "2026-04-15",
        focus: "Arrival and Shibuya exploration",
        events: [
          {
            id: "event-1",
            time: "14:00",
            title: "Arrive at Narita Airport",
            description: "Flight landing and airport transfer",
            type: "transport",
            location: "Narita Airport",
            cost: { amount: 3200, currency: "JPY" },
          },
          {
            id: "event-2",
            time: "18:00",
            title: "Shibuya Crossing",
            description: "Experience the famous scramble crossing",
            type: "activity",
            location: "Shibuya",
            cost: { amount: 0, currency: "JPY" },
          },
        ],
      },
      {
        id: "day-2",
        label: "Day 2",
        date: "2026-04-16",
        focus: "Temples and traditional culture",
        events: [
          {
            id: "event-3",
            time: "09:00",
            title: "Senso-ji Temple",
            description: "Visit Tokyo's oldest temple",
            type: "activity",
            location: "Asakusa",
            cost: { amount: 0, currency: "JPY" },
          },
        ],
      },
    ],
    budget: {
      currency: "JPY",
      total: 150000,
      perDay: 30000,
      delta: 0,
    },
    logs: ["Trip created"],
  };

  const handleCreateTrip = async () => {
    try {
      const newTripId = await createTrip({
        destination: mockTripData.destination,
        title: mockTripData.title,
        summary: mockTripData.summary,
        days: mockTripData.days,
        budget: mockTripData.budget,
        logs: mockTripData.logs,
      });
      setTripId(newTripId);
    } catch (error) {
      console.error("Failed to create trip:", error);
    }
  };

  const handleAppendLog = async () => {
    if (!tripId) return;
    try {
      await appendLog({
        tripId,
        message: `[${new Date().toISOString()}] Demo log entry added`,
      });
    } catch (error) {
      console.error("Failed to append log:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">
            Trip OS - Convex Debug
          </h1>
          <p className="text-muted-foreground text-sm">
            Test Convex integration with trip state management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
            <CardDescription>
              Create a demo trip or append log messages
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button onClick={handleCreateTrip} disabled={tripId !== undefined}>
              Create Demo Trip
            </Button>
            <Button
              onClick={handleAppendLog}
              disabled={tripId === undefined}
              variant="outline"
            >
              Append Demo Log
            </Button>
          </CardContent>
        </Card>

        {trip === undefined && tripId && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-sm">Loading trip...</p>
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
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>Trip ID: {trip.id}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium text-foreground">{trip.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {trip.destination}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    {trip.summary}
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 rounded-lg border border-border bg-muted/30 p-4">
                  <div>
                    <p className="text-muted-foreground text-xs">Budget</p>
                    <p className="font-medium text-foreground">
                      {trip.budget.currency}{" "}
                      {typeof trip.budget === "object" &&
                      "total" in trip.budget
                        ? trip.budget.total.toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Days</p>
                    <p className="font-medium text-foreground">
                      {Array.isArray(trip.days) ? trip.days.length : 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Created</p>
                    <p className="font-medium text-foreground">
                      {new Date(trip.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  OS-style change log ({Array.isArray(trip.logs) ? trip.logs.length : 0} entries)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 rounded-lg border border-border bg-muted/20 p-4 font-mono text-xs">
                  {Array.isArray(trip.logs) && trip.logs.length > 0 ? (
                    trip.logs.map((log, index) => (
                      <div
                        key={index}
                        className="text-muted-foreground border-b border-border/50 pb-1 last:border-0"
                      >
                        {log}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No logs yet</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Days & Events</CardTitle>
                <CardDescription>
                  Trip itinerary breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Array.isArray(trip.days) && trip.days.length > 0 ? (
                  trip.days.map((day: any) => (
                    <div
                      key={day.id}
                      className="rounded-lg border border-border bg-muted/30 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <h4 className="font-medium text-foreground">
                          {day.label}
                        </h4>
                        {day.date && (
                          <span className="text-muted-foreground text-xs">
                            {day.date}
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-3 text-sm">
                        {day.focus}
                      </p>
                      {Array.isArray(day.events) && day.events.length > 0 && (
                        <div className="space-y-2">
                          {day.events.map((event: any) => (
                            <div
                              key={event.id}
                              className="flex items-start justify-between rounded border border-border/50 bg-background p-2 text-xs"
                            >
                              <div className="flex-1">
                                <span className="font-mono text-muted-foreground">
                                  {event.time}
                                </span>
                                <span className="ml-2 font-medium text-foreground">
                                  {event.title}
                                </span>
                                {event.location && (
                                  <span className="ml-2 text-muted-foreground">
                                    @ {event.location}
                                  </span>
                                )}
                              </div>
                              <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">
                                {event.type}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No days defined</p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
