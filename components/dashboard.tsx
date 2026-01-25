"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { Play, Plane, Sparkles, Loader2, Volume2, Pause, X, MessageCircle, Send, ChevronUp, ChevronDown } from "lucide-react"
import { DayNavigation } from "@/components/day-navigation"
import { Timeline } from "@/components/timeline"
import { IntelligencePanel } from "@/components/intelligence-panel"
import type { TripData } from "@/lib/trip-types"
import { generateTripBriefing, createAudioURL, revokeAudioURL } from "@/services/elevenlabs/tts"
import { formatCurrency, extractTripJson, mapBotpressToTripData, isValidTripData } from "@/lib/trip-utils"

const adaptationChips = [
  "Make it cheaper",
  "Less walking",
]

// Voice Wave Animation Component
function VoiceWaves({ isPlaying }: { isPlaying: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1 h-16">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className={`w-1.5 bg-gradient-to-t from-emerald-500 to-emerald-300 rounded-full transition-all duration-150 ${
            isPlaying ? 'animate-voice-wave' : 'h-2'
          }`}
          style={{
            animationDelay: isPlaying ? `${i * 0.08}s` : '0s',
            height: isPlaying ? undefined : '8px',
          }}
        />
      ))}
    </div>
  )
}

// Audio Player Overlay Component
function AudioPlayerOverlay({
  isOpen,
  isPlaying,
  isLoading,
  onPlayPause,
  onClose,
  destination,
}: {
  isOpen: boolean
  isPlaying: boolean
  isLoading: boolean
  onPlayPause: () => void
  onClose: () => void
  destination: string
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Blur backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-950/80 backdrop-blur-xl"
        onClick={onClose}
      />
      
      {/* Player card */}
      <div className="relative z-10 bg-neutral-900/90 border border-neutral-800/50 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl shadow-black/50">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-700 transition-all duration-300"
        >
          <X className="w-4 h-4" />
        </button>
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-4">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">Voice Briefing</span>
          </div>
          <h3 className="text-xl font-semibold text-white mb-1">{destination}</h3>
          <p className="text-sm text-neutral-500">Your personalized trip briefing</p>
        </div>
        
        {/* Voice waves */}
        <div className="mb-8">
          <VoiceWaves isPlaying={isPlaying && !isLoading} />
        </div>
        
        {/* Play/Pause button */}
        <div className="flex justify-center">
          <button
            onClick={onPlayPause}
            disabled={isLoading}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
              isLoading
                ? 'bg-neutral-800 text-neutral-500'
                : isPlaying
                ? 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30'
                : 'bg-emerald-500 text-neutral-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/30'
            }`}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6 ml-1" />
            )}
          </button>
        </div>
        
        {/* Status text */}
        <p className="text-center text-sm text-neutral-500 mt-4">
          {isLoading ? 'Generating briefing...' : isPlaying ? 'Playing...' : 'Tap to play'}
        </p>
      </div>
    </div>
  )
}

// Mobile Intelligence Panel Component
function MobileIntelligencePanel({
  budget,
  onReset,
  onAdapt,
  sendToBrain,
  loading,
  isReady,
  error,
}: {
  budget: { total: number; spent: number; breakdown: { food: number; activity: number; travel: number }; currency: string }
  onReset: () => void
  onAdapt: (action: string, newTripData?: TripData) => void
  sendToBrain: (text: string) => Promise<any>
  loading: boolean
  isReady: boolean
  error: string | null
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [commandInput, setCommandInput] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [lastCommand, setLastCommand] = useState<string | null>(null)

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commandInput.trim() || !isReady || loading) return

    const input = commandInput
    setCommandInput("")
    setLastCommand(input)
    
    const response = await sendToBrain(input)

    if (response) {
      const tripJson = extractTripJson(response)
      
      if (tripJson) {
        const mappedData = mapBotpressToTripData(tripJson)
        
        if (mappedData && isValidTripData(mappedData)) {
          setAiResponse("Itinerary updated successfully.")
          onAdapt("update_received", mappedData)
        } else {
          setAiResponse(response.reply || "Received a trip update but the format was invalid.")
        }
      } else {
        setAiResponse(response.reply || "No response text received.")
      }
    } else {
      setAiResponse("No response received. Please try again.")
    }
    
    setLastCommand(null)
  }

  const handleChipClick = async (chip: string) => {
    if (!isReady || loading) return
    
    setLastCommand(chip)
    const response = await sendToBrain(chip)
    
    if (response) {
      const tripJson = extractTripJson(response)
      if (tripJson) {
        const mappedData = mapBotpressToTripData(tripJson)
        if (mappedData && isValidTripData(mappedData)) {
          setAiResponse(`Applied: ${chip}`)
          onAdapt(chip, mappedData)
        } else {
          setAiResponse(response.reply || "Update failed.")
        }
      } else {
        setAiResponse(response.reply || "No response received.")
      }
    } else {
      setAiResponse("No response received. Please try again.")
    }
    
    setLastCommand(null)
  }

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20">
      {/* Expandable Panel */}
      <div 
        className={`bg-neutral-950/98 backdrop-blur-xl border-t border-neutral-800/50 shadow-2xl transition-all duration-300 ${
          isExpanded ? 'max-h-[70vh]' : 'max-h-[140px]'
        } overflow-hidden`}
      >
        {/* Expand/Collapse Handle */}
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full py-2 flex items-center justify-center gap-2 text-neutral-500 hover:text-neutral-300 transition-colors cursor-pointer"
        >
          <div className="w-10 h-1 rounded-full bg-neutral-700" />
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 absolute right-4" />
          ) : (
            <ChevronUp className="w-4 h-4 absolute right-4" />
          )}
        </button>

        <div className="px-4 pb-4 space-y-3">
          {/* Budget Summary Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" />
              <span className="text-sm font-medium text-neutral-200">
                Budget: {formatCurrency(budget.spent, budget.currency)}
              </span>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="text-xs text-neutral-500 hover:text-neutral-300 transition-colors duration-300 cursor-pointer"
            >
              New Trip
            </button>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <>
              {/* AI Response */}
              <div className="bg-neutral-900/60 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-md bg-orange-500/20 flex items-center justify-center shrink-0">
                    {loading ? (
                      <Loader2 className="w-3 h-3 text-orange-400 animate-spin" />
                    ) : (
                      <span className="text-[10px]">🏯</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {loading && lastCommand && (
                      <p className="text-xs text-neutral-500 italic mb-1 truncate">{lastCommand}</p>
                    )}
                    {loading ? (
                      <div className="space-y-1.5">
                        <div className="h-2.5 bg-neutral-800/50 rounded animate-pulse w-full" />
                        <div className="h-2.5 bg-neutral-800/50 rounded animate-pulse w-4/5" />
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                        {aiResponse || "Send a command to interact with Trip OS..."}
                      </p>
                    )}
                    {error && (
                      <p className="text-xs text-red-400 mt-1">{error}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Command Input */}
              <form onSubmit={handleCommand} className="relative">
                <input
                  type="text"
                  value={commandInput}
                  onChange={(e) => setCommandInput(e.target.value)}
                  placeholder={!isReady ? "Connecting..." : "Command Trip OS..."}
                  disabled={loading || !isReady}
                  className="w-full bg-neutral-900/60 rounded-lg text-sm text-neutral-200 placeholder:text-neutral-600 px-4 py-3 pr-12 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={loading || !isReady || !commandInput.trim()}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2">
            {adaptationChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleChipClick(chip)}
                disabled={loading || !isReady}
                className="flex-1 px-3 py-2 rounded-lg bg-neutral-900/60 hover:bg-neutral-800/70 text-xs text-neutral-400 hover:text-neutral-200 transition-all duration-300 cursor-pointer border border-neutral-800/30 disabled:opacity-50"
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
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const hasGeneratedRef = useRef(false)
  
  const currentDay = tripData.days.find((d) => d.day === selectedDay) || tripData.days[0]

  // Auto-generate briefing on mount
  useEffect(() => {
    if (hasGeneratedRef.current || !tripData.destination) return
    hasGeneratedRef.current = true
    
    const generateBriefing = async () => {
      setIsBriefingLoading(true)
      try {
        const audioBlob = await generateTripBriefing(tripData)
        const url = createAudioURL(audioBlob)
        setAudioBlobUrl(url)
      } catch (error) {
        console.error('Auto-briefing generation failed:', error)
      } finally {
        setIsBriefingLoading(false)
      }
    }
    
    generateBriefing()
    
    // Cleanup on unmount
    return () => {
      if (audioBlobUrl) {
        revokeAudioURL(audioBlobUrl)
      }
    }
  }, [tripData.destination])

  const handleBriefingClick = () => {
    setIsOverlayOpen(true)
    // If audio is ready and not playing, start playing
    if (audioBlobUrl && !isPlaying) {
      playAudioFromUrl()
    }
  }

  const playAudioFromUrl = useCallback(() => {
    if (!audioBlobUrl) return
    
    if (audioRef.current) {
      audioRef.current.pause()
    }
    
    const audio = new Audio(audioBlobUrl)
    audioRef.current = audio
    
    audio.onended = () => {
      setIsPlaying(false)
    }
    
    audio.onerror = () => {
      setIsPlaying(false)
      console.error('Audio playback error')
    }
    
    audio.play()
      .then(() => setIsPlaying(true))
      .catch((err) => {
        console.error('Playback failed:', err)
        setIsPlaying(false)
      })
  }, [audioBlobUrl])

  const handlePlayPause = () => {
    if (!audioBlobUrl) {
      // If no audio yet, try generating
      if (!isBriefingLoading) {
        setIsBriefingLoading(true)
        generateTripBriefing(tripData)
          .then((blob) => {
            const url = createAudioURL(blob)
            setAudioBlobUrl(url)
            setIsBriefingLoading(false)
          })
          .catch((err) => {
            console.error('Generation failed:', err)
            setIsBriefingLoading(false)
          })
      }
      return
    }
    
    if (isPlaying && audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      playAudioFromUrl()
    }
  }

  const handleCloseOverlay = () => {
    setIsOverlayOpen(false)
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlaying(false)
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
    <div className="min-h-screen flex flex-col bg-neutral-950 text-neutral-200">
      {/* Subtle radial vignette */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-60" />
      
      {/* Top Header Bar */}
      <header className="min-h-12 py-2 px-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6 relative z-10 bg-neutral-950/80 backdrop-blur-sm border-b border-neutral-800/30 animate-fade-in">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-4 h-4 rounded-[3px] bg-white flex items-center justify-center shadow-md shadow-white/10 group-hover:shadow-emerald-400/20 transition-all duration-300 group-hover:scale-110">
            <div className="w-2 h-2 rounded-[2px] bg-neutral-900" />
          </div>
          <span className="text-sm font-medium text-neutral-200 group-hover:text-white transition-colors duration-300">Trip OS</span>
        </Link>

        <div className="w-px h-5 bg-neutral-800/60 hidden sm:block" />

        {/* Briefing Button */}
        <button
          type="button"
          onClick={handleBriefingClick}
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
          <span className="hidden xs:inline">{isBriefingLoading ? "Generating..." : "Briefing"}</span>
        </button>

        <div className="w-px h-5 bg-neutral-800/60 hidden sm:block" />

        {/* Location with Icon */}
        <div className="flex items-center gap-2 group cursor-pointer">
          <Plane className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400 transition-colors duration-300" />
          <span className="text-sm text-neutral-200 group-hover:text-white transition-colors duration-300 max-w-[120px] sm:max-w-none truncate">{tripData.destination}</span>
        </div>
      </header>

      {/* 3-Column OS Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[200px_1fr_320px] relative z-10 lg:overflow-hidden">
        {/* Left: Day Navigation */}
        <aside className="hidden lg:flex flex-col bg-neutral-950/40">
          <DayNavigation
            days={tripData.days}
            selectedDay={selectedDay}
            onDaySelect={onDaySelect}
          />
        </aside>

        {/* Center: Timeline with subtle gradient background */}
        <main className="flex flex-col lg:overflow-hidden relative min-h-0">
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

          <div className="flex-1 lg:overflow-y-auto scrollbar-thin relative z-10 pb-80 lg:pb-0">
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
      <MobileIntelligencePanel
        budget={budget}
        onReset={onReset}
        onAdapt={onAdapt}
        sendToBrain={sendToBrain}
        loading={loading}
        isReady={isReady}
        error={error}
      />

      {/* Audio Player Overlay */}
      <AudioPlayerOverlay
        isOpen={isOverlayOpen}
        isPlaying={isPlaying}
        isLoading={isBriefingLoading}
        onPlayPause={handlePlayPause}
        onClose={handleCloseOverlay}
        destination={tripData.destination}
      />
    </div>
  )
}
