"use client"

import { useState } from "react"
import { Play, Plane, Sparkles, Loader2, Volume2 } from "lucide-react"
import { DayNavigation } from "@/components/day-navigation"
import { Timeline } from "@/components/timeline"
import { IntelligencePanel } from "@/components/intelligence-panel"
import type { TripData } from "@/lib/trip-types"
import { generateTripBriefing, playAudio } from "@/services/elevenlabs/tts"
import { formatCurrency } from "@/lib/trip-utils"

const adaptationChips = [
  "Make it cheaper",
  "Less walking",
]

interface DashboardProps {
  tripData: TripData
  selectedDay: number
  onDaySelect: (day: number) => void
  systemLogs: string[]
  onAdapt: (action: string, newTripData?: TripData) => void
  onReset: () => void
  sendToBrain: (text: string) => Promise<any>
  loading: boolean
  isReady: boolean
  error: string | null
}

export function Dashboard({
  tripData,
  selectedDay,
  onDaySelect,
  systemLogs,
  onAdapt,
  onReset,
  sendToBrain,
  loading,
  isReady,
  error,
}: DashboardProps) {
  const [isBriefingLoading, setIsBriefingLoading] = useState(false)
  const currentDay = tripData.days.find((d) => d.day === selectedDay) || tripData.days[0]

  const handleBriefing = async () => {
    if (isBriefingLoading) return
    
    setIsBriefingLoading(true)
    try {
      const audioBlob = await generateTripBriefing(tripData)
      try {
        await playAudio(audioBlob)
      } catch (playError) {
        console.error('Audio playback failed:', playError)
        // If playback fails (common due to browser policies), we can still offer a way to play it
        // but at least we know the generation succeeded
        alert('Briefing generated, but browser blocked autoplay. Please try clicking again or check your browser settings.')
      }
    } catch (error) {
      console.error('Briefing generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to generate voice briefing: ${errorMessage}\n\nPlease check your ElevenLabs API key and voice settings.`)
    } finally {
      setIsBriefingLoading(false)
    }
  }

  // Calculate budget breakdown by category
  const budgetBreakdown = tripData.days.reduce(
    (acc, day) => {
      day.events.forEach((event) => {
        if (event.type === "food") acc.food += event.cost
        else if (event.type === "activity") acc.activity += event.cost
        else if (event.type === "transport") acc.travel += event.cost
      })
      return acc
    },
    { food: 0, activity: 0, travel: 0 }
  )

  const totalSpent = budgetBreakdown.food + budgetBreakdown.activity + budgetBreakdown.travel

  const budget = {
    total: tripData.totalBudget,
    spent: totalSpent,
    breakdown: budgetBreakdown,
    currency: tripData.currency || "USD",
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200">
      {/* Subtle radial vignette */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-60" />
      
      {/* Top Header Bar */}
      <header className="h-12 flex items-center justify-center gap-6 relative z-10 bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-800/30 animate-fade-in">
        {/* Logo */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-4 h-4 rounded-[3px] bg-white flex items-center justify-center shadow-md shadow-white/10 group-hover:shadow-emerald-400/20 transition-all duration-300 group-hover:scale-110">
            <div className="w-2 h-2 rounded-[2px] bg-neutral-900" />
          </div>
          <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors duration-300">Trip OS</span>
        </div>

        <div className="w-px h-5 bg-neutral-800/60" />

        {/* Briefing Button */}
        <button
          type="button"
          onClick={handleBriefing}
          disabled={isBriefingLoading}
          className={`flex items-center gap-2 text-sm transition-all duration-300 cursor-pointer group ${
            isBriefingLoading ? "text-emerald-400" : "text-neutral-500 hover:text-emerald-400"
          }`}
        >
          {isBriefingLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Play className="w-3 h-3 fill-current group-hover:scale-110 transition-transform duration-300" />
          )}
          <span>{isBriefingLoading ? "Generating..." : "Briefing"}</span>
        </button>

        <div className="w-px h-5 bg-neutral-800/60" />

        {/* Location with Icon */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <Plane className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400 transition-colors duration-300" />
          <span className="text-sm text-neutral-200 group-hover:text-white transition-colors duration-300">{tripData.destination}</span>
        </div>
      </header>

      {/* 3-Column OS Layout */}
      <div className="h-[calc(100vh-48px)] grid grid-cols-1 lg:grid-cols-[200px_1fr_320px] relative z-10">
        {/* Left: Day Navigation */}
        <aside className="hidden lg:flex flex-col bg-neutral-950/40">
          <DayNavigation
            days={tripData.days}
            selectedDay={selectedDay}
            onDaySelect={onDaySelect}
          />
        </aside>

        {/* Center: Timeline with subtle gradient background */}
        <main className="flex flex-col overflow-hidden relative">
          {/* Subtle gradient behind timeline */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.03)_0%,transparent_60%)] pointer-events-none" />
          
          {/* Mobile Day Selector */}
          <div className="lg:hidden p-4 relative z-10">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory">
              {tripData.days.map((day) => (
                <button
                  key={day.day}
                  type="button"
                  onClick={() => onDaySelect(day.day)}
                  className={`shrink-0 px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 cursor-pointer snap-start ${
                    selectedDay === day.day
                      ? "bg-emerald-500/10 text-emerald-400 shadow-md shadow-emerald-500/10 scale-105"
                      : "bg-neutral-900/60 text-neutral-400 hover:bg-neutral-800/60 hover:scale-105"
                  }`}
                >
                  Day {day.day}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin relative z-10 pb-32 lg:pb-0">
            <Timeline day={currentDay} />
          </div>
        </main>

        {/* Right: Intelligence Panel */}
        <aside className="hidden lg:flex flex-col bg-linear-to-b from-neutral-950/60 to-neutral-950/90">
          <IntelligencePanel
            onAdapt={onAdapt}
            tripData={tripData}
            budget={budget}
            onReset={onReset}
            sendToBrain={sendToBrain}
            loading={loading}
            isReady={isReady}
            error={error}
          />
        </aside>
      </div>

      {/* Mobile Intelligence Panel - Fixed Bottom */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-neutral-950/95 backdrop-blur-lg border-t border-neutral-800/50 shadow-2xl">
        <div className="p-4 space-y-3">
          {/* Budget Summary */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" />
              <span className="text-sm font-medium text-neutral-200">Budget: {formatCurrency(budget.spent, budget.currency)}</span>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors duration-300 cursor-pointer"
            >
              New Trip
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            {adaptationChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => onAdapt(chip)}
                className="flex-1 px-3 py-2 rounded-md bg-neutral-900/60 hover:bg-neutral-800/70 text-xs text-neutral-400 hover:text-neutral-200 transition-all duration-300 cursor-pointer border border-neutral-800/30"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
