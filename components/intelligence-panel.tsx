"use client"

import React from "react"

import { useState } from "react"
import { MessageCircle, Wallet, User, Loader2, Send } from "lucide-react"
import type { TripData } from "@/lib/trip-types"
import { extractTripJson, mapBotpressToTripData, isValidTripData, formatCurrency } from "@/lib/trip-utils"

interface Budget {
  total: number
  spent: number
  breakdown: {
    food: number
    activity: number
    travel: number
  }
  currency: string
}

interface IntelligencePanelProps {
  onAdapt: (action: string, newTripData?: TripData) => void
  tripData: TripData
  budget: Budget
  onReset: () => void
  sendToBrain: (text: string) => Promise<any>
  loading: boolean
  isReady: boolean
  error: string | null
}

export function IntelligencePanel({
  onAdapt,
  tripData,
  budget,
  sendToBrain,
  loading,
  isReady,
  error: botpressError,
}: IntelligencePanelProps) {
  const [commandInput, setCommandInput] = useState("")
  const [lastCommand, setLastCommand] = useState<string | null>(null)
  const [aiResponse, setAiResponse] = useState<string>("")

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commandInput.trim() || !isReady || loading) return

    const input = commandInput
    setCommandInput("")
    setLastCommand(input)
    
    const response = await sendToBrain(input)

    if (response) {
      console.log("[IntelligencePanel] Got response:", response)
      
      // Try to extract trip data from response
      const tripJson = extractTripJson(response)
      
      if (tripJson) {
        console.log("[IntelligencePanel] Detected trip update in response")
        const mappedData = mapBotpressToTripData(tripJson)
        
        if (mappedData && isValidTripData(mappedData)) {
          setAiResponse("Itinerary updated successfully.")
          onAdapt("update_received", mappedData)
        } else {
          console.warn("[IntelligencePanel] Invalid trip data in response", { tripJson, mappedData })
          setAiResponse(response.reply || "Received a trip update but the format was invalid.")
        }
      } else {
        // Just a regular text response
        setAiResponse(response.reply || "No response text received.")
      }
    } else {
      // Handle null response
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
      // Handle null response
      setAiResponse("No response received. Please try again.")
    }
    
    setLastCommand(null)
  }

  // Calculate progress percentages
  const total = budget.spent || 1
  const foodPct = (budget.breakdown.food / total) * 100
  const activityPct = (budget.breakdown.activity / total) * 100
  const travelPct = (budget.breakdown.travel / total) * 100

  return (
    <div className="flex flex-col h-full relative overflow-y-auto scrollbar-hide animate-fade-in">
      {/* Budget Section */}
      <div className="px-5 py-5">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-3.5 h-3.5 text-neutral-600" />
          <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-medium">
            Budget
          </span>
        </div>

        {/* Total Amount - Animated Counter */}
        <div className="text-2xl font-semibold text-neutral-100 mb-4 tracking-tight transition-all duration-500">
          {formatCurrency(budget.spent, budget.currency)}
        </div>

        {/* Segmented Progress Bar - increased intensity */}
        <div className="h-1.5 rounded-sm bg-neutral-800/60 flex overflow-hidden mb-3 shadow-inner">
          <div 
            className="bg-orange-400 transition-all shadow-sm shadow-orange-400/30" 
            style={{ width: `${foodPct}%` }} 
          />
          <div 
            className="bg-emerald-400 transition-all shadow-sm shadow-emerald-400/30" 
            style={{ width: `${activityPct}%` }} 
          />
          <div 
            className="bg-blue-400 transition-all shadow-sm shadow-blue-400/30" 
            style={{ width: `${travelPct}%` }} 
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] text-neutral-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-orange-400 shadow-sm shadow-orange-400/40" />
            <span>Food</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/40" />
            <span>Activity</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/40" />
            <span>Travel</span>
          </div>
        </div>
      </div>


      {/* Trip Card */}
      <div className="px-5 py-4">
        <div className="bg-neutral-900/40 rounded-md p-4 flex items-center justify-between shadow-lg shadow-black/20 hover:bg-neutral-900/50 transition-all duration-300 group cursor-pointer border border-transparent hover:border-neutral-800/30">
          <span className="text-sm text-neutral-300 group-hover:text-neutral-200 transition-colors duration-300">
            {tripData.duration} trip to {tripData.destination}
          </span>
          <div className="w-7 h-7 rounded-full bg-neutral-800/80 flex items-center justify-center shadow-inner group-hover:bg-neutral-800 transition-all duration-300">
            <User className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-400 transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* AI Response Card */}
      <div className="px-5 py-4 flex-1">
        <div className="bg-linear-to-b from-neutral-900/50 to-neutral-950/60 rounded-md p-4 shadow-lg shadow-black/30 transition-all duration-300">
          {/* Show user's command when loading */}
          {loading && lastCommand && (
            <div className="mb-3 pb-3 border-b border-neutral-800/50">
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <Send className="w-3 h-3" />
                <span className="italic">{lastCommand}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-md bg-linear-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-orange-500/20">
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 text-orange-400 animate-spin" />
              ) : (
                <span className="text-xs">🏯</span>
              )}
            </div>
            <div className="space-y-2 flex-1">
              {loading ? (
                <div className="space-y-2">
                  <div className="h-3 bg-neutral-800/50 rounded animate-pulse w-full" />
                  <div className="h-3 bg-neutral-800/50 rounded animate-pulse w-4/5" />
                  <div className="h-3 bg-neutral-800/50 rounded animate-pulse w-3/5" />
                </div>
              ) : (
                <p className="text-sm text-neutral-400 leading-relaxed">
                  {aiResponse || "Send a command to start interacting with Trip OS..."}
                </p>
              )}
              {botpressError && (
                <p className="text-xs text-red-400 mt-2">{botpressError}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Command Input - OS command prompt style */}
      <div className="p-5 mt-auto">
        <div className="relative">
          <form onSubmit={handleCommand}>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder={!isReady ? "Connecting..." : "Command Trip OS..."}
              disabled={loading || !isReady}
              className="w-full bg-neutral-900/40 rounded-md text-sm text-neutral-200 placeholder:text-neutral-600 px-4 py-3 pr-12 focus:outline-none focus:ring-1 focus:ring-neutral-700/50 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </form>

          {/* Send/Voice Button */}
          <button
            type="button"
            onClick={() => commandInput.trim() && handleCommand({ preventDefault: () => {} } as React.FormEvent)}
            disabled={loading || !isReady || !commandInput.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-800/80 flex items-center justify-center text-neutral-500 hover:bg-emerald-500/20 hover:text-emerald-400 transition-all duration-300 cursor-pointer shadow-md shadow-black/30 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-neutral-800/80"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <MessageCircle className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Adaptive Chips */}
        <div className="flex items-center gap-2 mt-3">
          <button
            type="button"
            onClick={() => handleChipClick("Make it cheaper")}
            disabled={loading || !isReady}
            className="px-3 py-1.5 rounded-sm bg-neutral-900/40 hover:bg-neutral-800/60 text-[11px] text-neutral-500 hover:text-neutral-300 transition-all duration-300 cursor-pointer shadow-md shadow-black/20 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Make it cheaper
          </button>
          <button
            type="button"
            onClick={() => handleChipClick("Less walking")}
            disabled={loading || !isReady}
            className="px-3 py-1.5 rounded-sm bg-neutral-900/40 hover:bg-neutral-800/60 text-[11px] text-neutral-500 hover:text-neutral-300 transition-all duration-300 cursor-pointer shadow-md shadow-black/20 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            Less walking
          </button>
        </div>
      </div>
    </div>
  )
}
