"use client"

import React from "react"

import { useState } from "react"
import { UtensilsCrossed, Landmark, Mountain, Coffee } from "lucide-react"

interface HeroStateProps {
  onSubmit: (prompt: string) => void
}

const exampleTrips = [
  {
    icon: UtensilsCrossed,
    title: "Tokyo Foodie",
    description: "Foodie tour in Tokyo",
    prompt: "5-day foodie tour in Tokyo under $2500",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    icon: Coffee,
    title: "Seoul Cafe Hopping",
    description: "Aesthetic cafes & skincare",
    prompt: "A week in Seoul exploring aesthetic cafes and high-tech skincare clinics",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    icon: Mountain,
    title: "Patagonia Trek",
    description: "Hiking adventure in Patagonia",
    prompt: "10-day hiking adventure in Patagonia",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Landmark,
    title: "Roman History",
    description: "Art & History in Rome",
    prompt: "Week of art and history exploration in Rome",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
]

export function HeroState({ onSubmit }: HeroStateProps) {
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim() && !isSubmitting) {
      setIsSubmitting(true)
      onSubmit(prompt)
    }
  }

  const handleCardClick = (tripPrompt: string) => {
    if (!isSubmitting) {
      setIsSubmitting(true)
      setPrompt(tripPrompt)
      onSubmit(tripPrompt)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Animated Gradient Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.15),transparent)] animate-pulse-slow" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/2 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        {/* Product Signature with Square Icon */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-5 h-5 rounded-md bg-white/90 flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-sm bg-neutral-900" />
          </div>
          <span className="font-mono text-[11px] tracking-[0.25em] text-neutral-500 uppercase">
            Trip OS
          </span>
        </div>

        {/* Hero Content */}
        <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold tracking-tight text-white text-center leading-[1.1] mb-4">
          Plan. Spend. Adapt.
        </h1>
        <p className="text-base text-neutral-500 text-center mb-14">
          The AI operating system for modern travel.
        </p>

        {/* Minimal Line Input */}
        <form onSubmit={handleSubmit} className="w-full mb-12">
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Weekend in Tokyo with a budget of $500"
              disabled={isSubmitting}
              className="w-full bg-transparent text-xl text-white placeholder:text-neutral-600 py-4 border-b border-neutral-800 focus:border-emerald-500/50 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {prompt.trim() && !isSubmitting && (
              <button
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-sm text-neutral-400 hover:text-emerald-400 transition-all duration-300 hover:scale-105"
              >
                Press Enter ↵
              </button>
            )}
            {isSubmitting && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm text-emerald-400">Processing...</span>
              </div>
            )}
          </div>
        </form>

        {/* Example Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {exampleTrips.map((trip, idx) => (
            <button
              key={trip.title}
              type="button"
              onClick={() => handleCardClick(trip.prompt)}
              disabled={isSubmitting}
              className="flex items-center gap-4 p-4 rounded-xl bg-white/3 hover:bg-white/5 border border-white/6 hover:border-white/12 transition-all duration-300 text-left group hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className={`shrink-0 w-10 h-10 rounded-lg ${trip.bg} flex items-center justify-center transition-all duration-300 group-hover:scale-110`}>
                <trip.icon className={`w-5 h-5 ${trip.color} transition-colors duration-300`} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-white mb-0.5 group-hover:text-white transition-colors duration-300">
                  {trip.title}
                </div>
                <div className="text-xs text-neutral-500 group-hover:text-neutral-400 truncate transition-colors duration-300">
                  {trip.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <span className="font-mono text-[10px] text-neutral-700 tracking-wider">
          v1.0.0
        </span>
      </div>
    </div>
  )
}
