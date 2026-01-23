"use client"

import React from "react"
import { MapPin, Calendar, Trash2, Plus } from "lucide-react"
import type { TripState } from "@/types/trip"

interface TripGalleryProps {
  trips: TripState[]
  onSelectTrip: (trip: TripState) => void
  onCreateNew: () => void
}

export function TripGallery({ trips, onSelectTrip, onCreateNew }: TripGalleryProps) {
  return (
    <div className="flex flex-col items-center px-6 py-20 relative">
      {/* Content */}
      <div className="relative z-10 w-full max-w-5xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-semibold text-white mb-2">My Trips</h1>
            <p className="text-neutral-500 text-sm font-mono uppercase tracking-wider">
              Stored in Convex Cloud
            </p>
          </div>
        </div>

        {trips.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-neutral-800 bg-white/2">
            <div className="w-12 h-12 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-neutral-600" />
            </div>
            <p className="text-neutral-400 mb-6 text-center max-w-xs">
              No trips found. Start your first journey by entering a prompt.
            </p>
            <button
              onClick={onCreateNew}
              className="px-6 py-2.5 rounded-full bg-emerald-500 text-neutral-950 text-sm font-semibold hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
            >
              Start Planning
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <button
                key={trip.id}
                onClick={() => onSelectTrip(trip)}
                className="group relative flex flex-col text-left p-6 rounded-2xl bg-white/3 border border-white/6 hover:bg-white/5 hover:border-emerald-500/30 transition-all duration-500 overflow-hidden"
              >
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-emerald-500/50 transition-colors">
                      <MapPin className="w-5 h-5 text-neutral-400 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/5">
                      <Calendar className="w-3 h-3 text-neutral-500" />
                      <span className="text-[10px] font-medium text-neutral-400">
                        {trip.days.length} Days
                      </span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                    {trip.destination}
                  </h3>
                  <p className="text-sm text-neutral-500 line-clamp-2 mb-6 flex-1">
                    {trip.title || "Exploring " + trip.destination}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="text-[10px] font-mono text-neutral-600 uppercase tracking-widest">
                      {new Date(trip.createdAt).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}
                    </div>
                    <div className="text-xs font-semibold text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                      Open →
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
