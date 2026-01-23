"use client"

import { useState } from "react"
import { HeroState } from "@/components/hero-state"
import { Dashboard } from "@/components/dashboard"
import { DashboardSkeleton } from "@/components/dashboard-skeleton"
import { TripGallery } from "@/components/trip-gallery"
import type { TripData, TripDay, TripEvent, EventType } from "@/lib/trip-types"
import { useBotpressBrain } from "@/hooks/useBotpressBrain"
import { useListTrips, useCreateTrip } from "@/hooks/useTrip"
import { mapBotpressToTripData, isValidTripData, extractTripJson } from "@/lib/trip-utils"
import type { TripState } from "@/types/trip"

type ViewMode = "hero" | "planning" | "dashboard"

export function TripOS() {
  const savedTrips = useListTrips()
  const createTripMutation = useCreateTrip()
  
  const [mode, setMode] = useState<ViewMode>("hero")
  const [tripData, setTripData] = useState<TripData | null>(null)
  const [selectedDay, setSelectedDay] = useState(1)
  const [systemLogs, setSystemLogs] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false) // Guard against multiple submissions

  // No longer need to switch to gallery mode automatically
  
  // Initialize Botpress hook without initial tripData
  const { sendToBrain, loading: botpressLoading, error: botpressError, isReady, isReadyRef } = useBotpressBrain()

  const handleTripSubmit = async (prompt: string) => {
    // Prevent multiple simultaneous submissions
    if (isSubmitting) {
      console.warn('[Trip Submit] Already submitting, ignoring duplicate call')
      return
    }
    
    setIsSubmitting(true)
    setMode("planning")
    const timestamp = () => new Date().toLocaleTimeString()
    
    // Add initial log
    const logs: string[] = [`[${timestamp()}] Processing request: "${prompt}"`]
    setSystemLogs([...logs])

    console.log('[Trip Submit] isReady:', isReady, 'botpressLoading:', botpressLoading, 'botpressError:', botpressError)

    // Wait for Botpress connection to be ready (simpler approach with fixed wait time)
    logs.push(`[${timestamp()}] Connecting to Botpress...`)
    setSystemLogs([...logs])
    
    // Wait up to 10 seconds for connection
    const startTime = Date.now()
    const maxWaitTime = 10000 // 10 seconds
    
    while (!isReadyRef.current && (Date.now() - startTime) < maxWaitTime) {
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('[Trip Submit] Waiting... isReadyRef.current:', isReadyRef.current, 'isReady state:', isReady)
    }
    
    if (!isReadyRef.current) {
      logs.push(`[${timestamp()}] ❌ Botpress connection timeout`)
      logs.push(`[${timestamp()}] Unable to generate trip - please try again`)
      setSystemLogs([...logs])
      console.error('[Botpress] Connection timeout after 10 seconds')
      
      // Wait a bit to show the error, then reset
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMode("hero")
      setIsSubmitting(false)
      return
    }
    
    logs.push(`[${timestamp()}] Connected to Botpress`)
    setSystemLogs([...logs])
    console.log('[Trip Submit] Connection ready, sending message...')

    // Send prompt to Botpress
    logs.push(`[${timestamp()}] Sending prompt to Botpress...`)
    setSystemLogs([...logs])

    let finalTripData: TripData | null = null

    try {
      // Call Botpress
      console.log('[Trip Submit] Calling sendToBrain with:', prompt)
      const response = await sendToBrain(prompt)
      console.log('[Trip Submit] Got response:', response)
      
      if (response) {
        const tripJson = extractTripJson(response)
        if (tripJson) {
          const mappedData = mapBotpressToTripData(tripJson)
          if (mappedData && isValidTripData(mappedData)) {
            finalTripData = mappedData
            logs.push(`[${timestamp()}] Trip data validated successfully`)
            setSystemLogs([...logs])
          } else {
            console.warn('[Botpress] Mapping or validation failed:', { original: tripJson, mapped: mappedData })
            logs.push(`[${timestamp()}] ❌ Invalid trip data format`)
            setSystemLogs([...logs])
          }
        } else {
          console.warn('[Botpress] No trip data found in response')
          logs.push(`[${timestamp()}] ❌ No trip plan found in response`)
          setSystemLogs([...logs])
        }
      } else {
        console.warn('[Botpress] No response received')
        logs.push(`[${timestamp()}] ❌ No response from Botpress`)
        setSystemLogs([...logs])
      }
    } catch (error) {
      // Error communicating with Botpress
      console.error('[Botpress Error]', error)
      logs.push(`[${timestamp()}] ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setSystemLogs([...logs])
    }

    // Use Botpress data if available
    if (finalTripData) {
      logs.push(`[${timestamp()}] Saving trip to Convex...`)
      setSystemLogs([...logs])
      
      try {
        // Create trip in Convex
        await createTripMutation({
          destination: finalTripData.destination,
          title: `${finalTripData.duration} in ${finalTripData.destination}`,
          summary: `Exploration of ${finalTripData.destination} generated by Trip OS`,
          days: finalTripData.days,
          budget: {
            total: finalTripData.totalBudget,
            spent: 0,
            breakdown: { food: 0, activity: 0, travel: 0 },
            currency: "USD"
          }
        })
        
        logs.push(`[${timestamp()}] Trip saved successfully.`)
        setSystemLogs([...logs])
      } catch (err) {
        console.error('[Convex] Failed to save trip:', err)
        logs.push(`[${timestamp()}] ⚠️ Failed to save to cloud, but loading locally...`)
        setSystemLogs([...logs])
      }

      setTripData(finalTripData)
      setMode("dashboard")
    } else {
      logs.push(`[${timestamp()}] ❌ Failed to generate trip plan`)
      setSystemLogs([...logs])
      // Wait to show error then reset
      await new Promise(resolve => setTimeout(resolve, 2000))
      setMode("hero")
    }
    
    setIsSubmitting(false)
  }

  const handleSelectTrip = (trip: TripState) => {
    setTripData({
      destination: trip.destination,
      duration: `${trip.days.length} days`,
      totalBudget: trip.budget.total,
      days: trip.days
    })
    setMode("dashboard")
  }

  const handleAdaptation = async (action: string, newTripData?: TripData) => {
    const timestamp = new Date().toLocaleTimeString()
    
    if (newTripData) {
      setSystemLogs((prev) => [
        ...prev,
        `[${timestamp}] New itinerary received`,
        `[${timestamp}] Updating dashboard...`,
      ])
      
      setTripData(newTripData)
      
      // Also save to Convex
      try {
        await createTripMutation({
          destination: newTripData.destination,
          title: `${newTripData.duration} in ${newTripData.destination} (Updated)`,
          summary: `Updated exploration of ${newTripData.destination}`,
          days: newTripData.days,
          budget: {
            total: newTripData.totalBudget,
            spent: 0,
            breakdown: { food: 0, activity: 0, travel: 0 },
            currency: "USD"
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
    setMode("hero")
    setTripData(null)
    setSelectedDay(1)
    setSystemLogs([])
  }

  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden text-white">
      {/* Shared gradient background */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)]" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl" />

      {/* Home State (Hero + Gallery) */}
      <div
        className={`absolute inset-0 z-20 transition-all duration-500 ease-out overflow-y-auto scrollbar-hide ${
          mode === "hero"
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-10 pointer-events-none"
        }`}
      >
        <HeroState onSubmit={handleTripSubmit} />
        {savedTrips && savedTrips.length > 0 && (
          <div className="pb-20">
            <TripGallery 
              trips={savedTrips} 
              onSelectTrip={handleSelectTrip} 
              onCreateNew={() => {
                const heroSection = document.querySelector('form');
                heroSection?.scrollIntoView({ behavior: 'smooth' });
              }} 
            />
          </div>
        )}
      </div>

      {/* Planning Skeleton State */}
      <div
        className={`absolute inset-0 z-10 transition-all duration-700 ease-out ${
          mode === "planning"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-16 pointer-events-none"
        }`}
      >
        <DashboardSkeleton />
      </div>

      {/* Dashboard State */}
      <div
        className={`absolute inset-0 z-10 transition-all duration-500 ease-out ${
          mode === "dashboard"
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-6 pointer-events-none"
        }`}
      >
        {tripData && (
          <Dashboard
            tripData={tripData}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            systemLogs={systemLogs}
            onAdapt={handleAdaptation}
            onReset={handleReset}
            sendToBrain={sendToBrain}
            loading={botpressLoading}
            isReady={isReady}
            error={botpressError}
          />
        )}
      </div>
    </div>
  )
}
