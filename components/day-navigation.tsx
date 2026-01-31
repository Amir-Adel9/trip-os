"use client"

import type { TripDay } from "@/lib/trip-types"

interface DayNavigationProps {
  days: TripDay[]
  selectedDay: number
  onDaySelect: (day: number) => void
}

export function DayNavigation({ days, selectedDay, onDaySelect }: DayNavigationProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Itinerary Header */}
      <div className="px-5 py-5">
        <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-medium">
          Itinerary
        </span>
      </div>

      {/* Day List */}
      <div className="flex-1 px-3 space-y-1 overflow-y-auto scrollbar-hide">
        {days.map((day, idx) => {
          const isSelected = selectedDay === day.day
          return (
            <button
              key={day.day}
              type="button"
              onClick={() => onDaySelect(day.day)}
              className={`w-full text-left px-3 py-3 rounded-md transition-all duration-300 cursor-pointer relative flex items-center gap-3 animate-fade-in ${
                isSelected
                  ? "bg-neutral-900/80 shadow-lg shadow-black/20 scale-[1.02]"
                  : "hover:bg-neutral-900/40 hover:scale-[1.01]"
              }`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <span
                className={`text-sm font-medium transition-colors duration-300 ${
                  isSelected ? "text-neutral-100" : "text-neutral-500 group-hover:text-neutral-400"
                }`}
              >
                Day {day.day}
              </span>

              {/* Emerald dot with glow for selected */}
              {isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-md shadow-emerald-400/50 animate-pulse" />
              )}
            </button>
          )
        })}
      </div>

      {/* Separator - no border, just spacing */}
      <div className="mx-5 h-px bg-neutral-800/30" />

      {/* Focus Section - shows selected day's title */}
      {(() => {
        const currentDay = days.find(d => d.day === selectedDay)
        return currentDay?.title ? (
          <div className="px-5 py-5 animate-fade-in" style={{ animationDelay: "300ms" }}>
            <span className="font-mono text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-medium block mb-3">
              Focus
            </span>
            <p className="text-sm text-emerald-400/90 italic hover:text-emerald-400 transition-colors duration-300 cursor-default">
              &quot;{currentDay.title}&quot;
            </p>
          </div>
        ) : null
      })()}
    </div>
  )
}
