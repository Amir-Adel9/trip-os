"use client"

import { MapPin, Utensils, Bus, Moon } from "lucide-react"
import type { TripDay, EventType } from "@/lib/trip-types"
import { formatCurrency } from "@/lib/trip-utils"

interface TimelineProps {
  day: TripDay
  currency?: string
}

const eventColors: Record<EventType, { bg: string; text: string; glow: string; iconBg: string }> = {
  transport: { 
    bg: "bg-blue-400", 
    text: "text-blue-400", 
    glow: "shadow-blue-400/40",
    iconBg: "bg-blue-500/20"
  },
  accommodation: { 
    bg: "bg-violet-400", 
    text: "text-violet-400", 
    glow: "shadow-violet-400/40",
    iconBg: "bg-violet-500/20"
  },
  activity: { 
    bg: "bg-emerald-400", 
    text: "text-emerald-400", 
    glow: "shadow-emerald-400/40",
    iconBg: "bg-emerald-500/20"
  },
  food: { 
    bg: "bg-orange-400", 
    text: "text-orange-400", 
    glow: "shadow-orange-400/40",
    iconBg: "bg-orange-500/20"
  },
}

const eventIcons: Record<EventType, typeof MapPin> = {
  transport: Bus,
  accommodation: Moon,
  activity: MapPin,
  food: Utensils,
}

export function Timeline({ day, currency }: TimelineProps) {
  return (
    <div className="p-8 lg:p-12 max-w-3xl">
      {/* Day Header */}
      <div className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-semibold text-neutral-100 mb-1 tracking-tight">{day.title}</h1>
        <p className="text-sm text-neutral-500">Day {day.day} • {day.date}</p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative">
        {/* Main timeline spine - lighter */}
        <div className="absolute left-[31px] top-8 bottom-8 w-px bg-gradient-to-b from-neutral-800/60 via-neutral-700/40 to-neutral-800/60" />

        {day.events.map((event, index) => {
          const colors = eventColors[event.type] || eventColors.activity
          const Icon = eventIcons[event.type] || MapPin
          const isLast = index === day.events.length - 1

          return (
            <div 
              key={event.id} 
              className="relative flex gap-6 pb-8 group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Left: Time + Spine */}
              <div className="flex flex-col items-center w-16 shrink-0">
                {/* Time */}
                <span className="font-mono text-xs text-neutral-600 mb-3 group-hover:text-neutral-400 transition-colors duration-300">{event.time}</span>
                
                {/* Glowing Icon Dot */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${colors.text} ${colors.iconBg} shadow-lg ${colors.glow} transition-all duration-300 group-hover:scale-125 group-hover:shadow-xl cursor-pointer`}>
                  <Icon className="w-3 h-3 transition-all duration-300 group-hover:scale-110" />
                </div>
              </div>

              {/* Right: Event Card */}
              <div className="flex-1 pt-5">
                <div className="bg-neutral-900/50 rounded-md p-5 hover:bg-neutral-900/70 transition-all duration-300 relative shadow-lg shadow-black/20 group-hover:shadow-xl group-hover:shadow-black/30 group-hover:scale-[1.01] cursor-pointer border border-transparent hover:border-neutral-800/50">
                  {/* Subtle gradient header accent */}
                  <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${colors.text.replace('text-', 'via-')}/10 to-transparent rounded-t-md group-hover:${colors.text.replace('text-', 'via-')}/20 transition-all duration-300`} />
                  
                  {/* Cost - Top Right */}
                  {event.cost > 0 && (
                    <span className="absolute top-5 right-5 font-mono text-xs text-neutral-400 tracking-tight group-hover:text-neutral-300 transition-colors duration-300">
                      {formatCurrency(event.cost, currency)}
                    </span>
                  )}

                  {/* Title */}
                  <h3 className="font-medium text-neutral-100 mb-2 pr-16 group-hover:text-white transition-colors duration-300">{event.title}</h3>
                  
                  {/* Description */}
                  <p className="text-sm text-neutral-500 leading-relaxed mb-3 group-hover:text-neutral-400 transition-colors duration-300">
                    {event.description}
                  </p>

                  {/* Footer: Location + Duration */}
                  <div className="flex items-center justify-between">
                    {event.location && (
                      <div className="flex items-center gap-1.5 text-neutral-600 group-hover:text-neutral-500 transition-colors duration-300">
                        <MapPin className="w-3 h-3" />
                        <span className="font-mono text-[11px] uppercase tracking-wider">
                          {event.location}
                        </span>
                      </div>
                    )}
                    {event.duration && (
                      <span className="text-[11px] text-neutral-700 group-hover:text-neutral-600 transition-colors duration-300">
                        {event.duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
