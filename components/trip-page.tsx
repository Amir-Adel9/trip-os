"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Dashboard } from "@/components/dashboard"
import { useTrip, useUpdateTrip } from "@/hooks/useTrip"
import { useBotpressBrain } from "@/hooks/useBotpressBrain"
import { useSession } from "@/hooks/useSession"
import type { TripData } from "@/lib/trip-types"
import type { Id } from "@/convex/_generated/dataModel"

export function TripPage() {
  const params = useParams()
  const router = useRouter()
  const tripId = params.id as Id<"trips">
  const userId = useSession()
  
  const trip = useTrip(tripId)
  const updateTrip = useUpdateTrip()
  // We might still need createTrip if we were to fork a trip, but for now updates go to existing
  
  const [selectedDay, setSelectedDay] = useState(1)
  const [systemLogs, setSystemLogs] = useState<string[]>([])
  
  // Compute tripData early so it can be passed to the hook
  const tripData: TripData | undefined = useMemo(() => {
    if (!trip) return undefined
    return {
      destination: trip.destination,
      duration: `${trip.days.length} days`,
      totalBudget: trip.budget.total,
      days: trip.days
    }
  }, [trip])
  
  // Pass tripData to the hook - context will be sent when both conversation and tripData are ready
  // userId enables persistent Botpress identity across browser sessions
  const { sendToBrain, messages, loading: botpressLoading, error: botpressError, isReady } = useBotpressBrain(tripId, tripData, userId ?? undefined)

  if (trip === undefined) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white">
        {/* Background gradients */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
        <div className="fixed top-0 left-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl" />
        <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl" />
        
        {/* Logo with animation */}
        <div className="relative z-10 flex flex-col items-center animate-pulse">
          {/* Logo Icon */}
          <div className="relative mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white to-neutral-300 flex items-center justify-center shadow-2xl shadow-white/20">
              <div className="w-8 h-8 rounded-lg bg-neutral-900" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-white/30 blur-xl -z-10" />
          </div>
          
          {/* Logo Text */}
          <span className="font-mono text-sm tracking-[0.3em] text-neutral-400 uppercase font-medium mb-6">
            Trip OS
          </span>
          
          {/* Loading indicator */}
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    )
  }


  if (trip === null) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-white gap-4">
        <div>Trip not found</div>
        <button 
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-neutral-800 rounded hover:bg-neutral-700"
        >
          Return Home
        </button>
      </div>
    )
  }

  // tripData is guaranteed to be defined here since we returned early if trip was null/undefined
  // TypeScript assertion for safety
  if (!tripData) return null

  const handleAdaptation = async (action: string, newTripData?: TripData) => {
    const timestamp = new Date().toLocaleTimeString()
    
    if (newTripData) {
      setSystemLogs((prev) => [
        ...prev,
        `[${timestamp}] New itinerary received`,
        `[${timestamp}] Updating dashboard...`,
      ])
      
      try {
        await updateTrip({
          tripId,
          patch: {
            destination: newTripData.destination,
            days: newTripData.days,
            budget: {
              total: newTripData.totalBudget,
              spent: trip.budget.spent, // Keep existing spent
              breakdown: trip.budget.breakdown, // Keep existing breakdown/logic? Or should this update?
              currency: "USD"
            }
          }
        })
      } catch (err) {
        console.error('[Convex] Failed to save updated trip:', err)
      }
    } else {
      setSystemLogs((prev) => [
        ...prev,
        `[${timestamp}] Adaptation requested: "${action}"`,
        `[${timestamp}] Recalculating itinerary...`,
        `[${timestamp}] Updates applied.`,
      ])
    }
  }

  const handleReset = () => {
    router.push('/')
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 text-white">
      {/* Shared gradient background - keeping consistent with home */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl" />

      <div className="relative z-10">
        <Dashboard
          tripData={tripData}
          selectedDay={selectedDay}
          onDaySelect={setSelectedDay}
          systemLogs={systemLogs}
          onAdapt={handleAdaptation}
          onReset={handleReset}
          sendToBrain={sendToBrain}
          messages={messages}
          loading={botpressLoading}
          isReady={isReady}
          error={botpressError}
        />
      </div>
    </div>
  )
}
