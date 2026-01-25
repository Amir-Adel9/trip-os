"use client"

import React, { useState, useEffect } from "react"
import { MapPin, Calendar, Plus, Sparkles, ArrowRight, Compass, Globe } from "lucide-react"
import type { TripState } from "@/types/trip"

interface TripGalleryProps {
  trips: TripState[]
  onSelectTrip: (trip: TripState) => void
  onCreateNew: () => void
}

// Destination accent colors for visual variety
const destinationColors = [
  { bg: "from-emerald-500/20 to-teal-500/10", glow: "group-hover:shadow-emerald-500/20", accent: "text-emerald-400", border: "group-hover:border-emerald-500/30" },
  { bg: "from-blue-500/20 to-indigo-500/10", glow: "group-hover:shadow-blue-500/20", accent: "text-blue-400", border: "group-hover:border-blue-500/30" },
  { bg: "from-violet-500/20 to-purple-500/10", glow: "group-hover:shadow-violet-500/20", accent: "text-violet-400", border: "group-hover:border-violet-500/30" },
  { bg: "from-orange-500/20 to-amber-500/10", glow: "group-hover:shadow-orange-500/20", accent: "text-orange-400", border: "group-hover:border-orange-500/30" },
  { bg: "from-pink-500/20 to-rose-500/10", glow: "group-hover:shadow-pink-500/20", accent: "text-pink-400", border: "group-hover:border-pink-500/30" },
  { bg: "from-cyan-500/20 to-sky-500/10", glow: "group-hover:shadow-cyan-500/20", accent: "text-cyan-400", border: "group-hover:border-cyan-500/30" },
]

export function TripGallery({ trips, onSelectTrip, onCreateNew }: TripGalleryProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const getColorForTrip = (index: number) => {
    return destinationColors[index % destinationColors.length]
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-16 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(52,211,153,0.06),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(120,119,198,0.04),transparent)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-[10%] w-[400px] h-[400px] bg-emerald-500/[0.02] rounded-full blur-[100px] animate-breathe" />
      <div className="absolute bottom-1/3 right-[10%] w-[350px] h-[350px] bg-violet-500/[0.02] rounded-full blur-[100px] animate-breathe" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/[0.01] rounded-full blur-[120px] animate-pulse-slow" />
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.012]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div 
          className={`flex items-center justify-between mb-10 transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center border border-emerald-500/20">
                <Globe className="w-6 h-6 text-emerald-400" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-emerald-500/10 blur-xl -z-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-white">My Trips</h1>
            </div>
          </div>
          
          {trips.length > 0 && (
            <button
              onClick={onCreateNew}
              className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 hover:border-emerald-500/30 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
              <span>New Trip</span>
            </button>
          )}
        </div>

        {trips.length === 0 ? (
          /* Empty State */
          <div 
            className={`relative flex flex-col items-center justify-center py-20 rounded-3xl border border-dashed border-neutral-800/80 bg-neutral-900/30 backdrop-blur-sm overflow-hidden transition-all duration-700 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {/* Empty State Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/[0.03] to-transparent" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/[0.05] rounded-full blur-[80px]" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center border border-neutral-700/50 shadow-2xl">
                  <Compass className="w-9 h-9 text-neutral-500" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-white mb-2">No trips yet</h3>
              <p className="text-neutral-500 mb-8 text-center max-w-sm text-sm leading-relaxed">
                Your adventures start here. Create your first trip and let AI help you plan the perfect journey.
              </p>
              
              <button
                onClick={onCreateNew}
                className="group relative flex items-center gap-3 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-neutral-950 text-sm font-semibold hover:from-emerald-400 hover:to-teal-400 transition-all duration-300 shadow-xl shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:scale-105 active:scale-95"
              >
                <Plus className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
                <span>Plan Your First Trip</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ) : (
          /* Trip Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip, idx) => {
              const colors = getColorForTrip(idx)
              return (
                <button
                  key={trip.id}
                  onClick={() => onSelectTrip(trip)}
                  className={`group relative flex flex-col text-left p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800/50 hover:bg-neutral-800/50 ${colors.border} transition-all duration-300 overflow-hidden backdrop-blur-sm hover:scale-[1.02] hover:shadow-xl ${colors.glow} ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ 
                    transitionDelay: isMounted ? `${150 + idx * 75}ms` : '0ms',
                  }}
                >
                  {/* Card Background Gradient */}
                  <div className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${colors.bg} rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 animate-shimmer pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Top Row */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors.bg} flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <MapPin className={`w-5 h-5 ${colors.accent} transition-all duration-300`} />
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/5 backdrop-blur-sm">
                        <Calendar className="w-3 h-3 text-neutral-500" />
                        <span className="text-[11px] font-medium text-neutral-400">
                          {trip.days.length} {trip.days.length === 1 ? 'Day' : 'Days'}
                        </span>
                      </div>
                    </div>

                    {/* Trip Info */}
                    <h3 className={`text-lg font-semibold text-white mb-1.5 group-hover:${colors.accent} transition-colors duration-300`}>
                      {trip.destination}
                    </h3>
                    <p className="text-sm text-neutral-500 group-hover:text-neutral-400 line-clamp-2 mb-5 flex-1 transition-colors duration-300">
                      {trip.title || "Exploring " + trip.destination}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                        {new Date(trip.createdAt).toLocaleDateString(undefined, { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </div>
                      <div className={`flex items-center gap-1.5 text-xs font-medium ${colors.accent} opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0`}>
                        <span>Open</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
            
            {/* Add New Trip Card */}
            <button
              onClick={onCreateNew}
              className={`group relative flex flex-col items-center justify-center min-h-[200px] p-6 rounded-2xl border-2 border-dashed border-neutral-800/80 hover:border-emerald-500/30 bg-neutral-900/20 hover:bg-neutral-900/40 transition-all duration-300 backdrop-blur-sm hover:scale-[1.02] ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ 
                transitionDelay: isMounted ? `${150 + trips.length * 75}ms` : '0ms',
              }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110">
                  <Plus className="w-6 h-6 text-neutral-500 group-hover:text-emerald-400 transition-all duration-300 group-hover:rotate-90" />
                </div>
                <span className="text-sm font-medium text-neutral-500 group-hover:text-emerald-400 transition-colors duration-300">
                  Create New Trip
                </span>
              </div>
            </button>
          </div>
        )}
      </div>
      
      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
          <span className="font-mono text-[10px] text-neutral-600 tracking-wider">
            {trips.length} {trips.length === 1 ? 'trip' : 'trips'} saved
          </span>
        </div>
      </div>
    </div>
  )
}
