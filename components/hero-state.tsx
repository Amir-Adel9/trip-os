"use client"

import React from "react"

import { useState, useEffect } from "react"
import { UtensilsCrossed, Landmark, Mountain, Coffee, Sparkles, ArrowRight } from "lucide-react"

interface HeroStateProps {
  onSubmit: (prompt: string) => void
}

const exampleTrips = [
  {
    icon: UtensilsCrossed,
    title: "Tokyo Foodie",
    description: "Ramen, sushi & hidden izakayas",
    prompt: "5-day foodie tour in Tokyo under $2500",
    color: "text-orange-400",
    bg: "bg-gradient-to-br from-orange-500/20 to-amber-500/10",
    glow: "group-hover:shadow-orange-500/20",
  },
  {
    icon: Coffee,
    title: "Seoul Cafe Hopping",
    description: "Aesthetic cafes & K-beauty",
    prompt: "A week in Seoul exploring aesthetic cafes and high-tech skincare clinics",
    color: "text-pink-400",
    bg: "bg-gradient-to-br from-pink-500/20 to-rose-500/10",
    glow: "group-hover:shadow-pink-500/20",
  },
  {
    icon: Mountain,
    title: "Patagonia Trek",
    description: "Epic trails & glacial lakes",
    prompt: "10-day hiking adventure in Patagonia",
    color: "text-emerald-400",
    bg: "bg-gradient-to-br from-emerald-500/20 to-teal-500/10",
    glow: "group-hover:shadow-emerald-500/20",
  },
  {
    icon: Landmark,
    title: "Roman History",
    description: "Ancient ruins & Renaissance art",
    prompt: "Week of art and history exploration in Rome",
    color: "text-blue-400",
    bg: "bg-gradient-to-br from-blue-500/20 to-indigo-500/10",
    glow: "group-hover:shadow-blue-500/20",
  },
]

export function HeroState({ onSubmit }: HeroStateProps) {
  const [prompt, setPrompt] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

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
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(52,211,153,0.08),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_100%,rgba(120,119,198,0.06),transparent)]" />
      
      {/* Floating Orbs */}
      <div className="absolute top-1/4 left-[15%] w-[500px] h-[500px] bg-emerald-500/[0.03] rounded-full blur-[100px] animate-breathe" />
      <div className="absolute bottom-1/4 right-[15%] w-[400px] h-[400px] bg-violet-500/[0.03] rounded-full blur-[100px] animate-breathe" style={{ animationDelay: "2s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.01] rounded-full blur-[120px] animate-pulse-slow" />
      
      {/* Subtle Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl">
        {/* Product Signature */}
        <div 
          className={`flex items-center gap-3 mb-10 transition-all duration-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white to-neutral-300 flex items-center justify-center shadow-lg shadow-white/10">
              <div className="w-3.5 h-3.5 rounded-md bg-neutral-900" />
            </div>
            <div className="absolute inset-0 rounded-lg bg-white/20 blur-md -z-10" />
          </div>
          <span className="font-mono text-xs tracking-[0.3em] text-neutral-400 uppercase font-medium">
            Trip OS
          </span>
        </div>

        {/* Hero Content */}
        <h1 
          className={`text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-center leading-[1.1] mb-5 transition-all duration-700 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span className="text-white">Plan. </span>
          <span className="bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-400 bg-clip-text text-transparent">Spend. </span>
          <span className="text-white">Adapt.</span>
        </h1>
        <p 
          className={`text-base sm:text-lg text-neutral-500 text-center mb-12 max-w-md transition-all duration-700 delay-200 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          The AI operating system for modern travel.
        </p>

        {/* Premium Input Container */}
        <form 
          onSubmit={handleSubmit} 
          className={`w-full mb-14 transition-all duration-700 delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <div className={`relative group ${isFocused ? 'animate-glow-pulse' : ''}`}>
            {/* Input Glow Effect */}
            <div className={`absolute -inset-px rounded-2xl bg-gradient-to-r from-emerald-500/50 via-teal-500/50 to-emerald-500/50 opacity-0 blur-sm transition-opacity duration-500 ${isFocused ? 'opacity-100' : 'group-hover:opacity-50'}`} />
            
            {/* Input Container */}
            <div className="relative bg-neutral-900/80 backdrop-blur-xl rounded-2xl border border-neutral-800/80 overflow-hidden transition-all duration-300 group-hover:border-neutral-700/80">
              <div className="flex items-center px-5 py-4">
                <Sparkles className={`w-5 h-5 mr-4 transition-colors duration-300 ${isFocused ? 'text-emerald-400' : 'text-neutral-600'}`} />
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholder="Describe your dream trip..."
                  disabled={isSubmitting}
                  className="flex-1 bg-transparent text-lg text-white placeholder:text-neutral-600 outline-none transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {prompt.trim() && !isSubmitting && (
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    <span>Go</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
                {isSubmitting && (
                  <div className="flex items-center gap-3 px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm text-emerald-400 font-medium">Planning...</span>
                  </div>
                )}
              </div>
              
              {/* Shimmer Effect */}
              <div className="absolute inset-0 animate-shimmer pointer-events-none" />
            </div>
          </div>
        </form>

        {/* Example Cards Label */}
        <div 
          className={`flex items-center gap-2 mb-4 transition-all duration-700 delay-400 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <span className="text-xs text-neutral-600 uppercase tracking-wider font-medium">Try an example</span>
        </div>

        {/* Example Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          {exampleTrips.map((trip, idx) => (
            <button
              key={trip.title}
              type="button"
              onClick={() => handleCardClick(trip.prompt)}
              disabled={isSubmitting}
              className={`relative flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/50 hover:bg-neutral-800/50 border border-neutral-800/50 hover:border-neutral-700/50 transition-all duration-300 text-left group hover:scale-[1.02] hover:shadow-xl ${trip.glow} disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 backdrop-blur-sm ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ 
                transitionDelay: isMounted ? `${500 + idx * 75}ms` : '0ms',
              }}
            >
              {/* Card Hover Glow */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className={`relative shrink-0 w-11 h-11 rounded-xl ${trip.bg} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <trip.icon className={`w-5 h-5 ${trip.color} transition-all duration-300 group-hover:scale-110`} />
              </div>
              <div className="relative min-w-0 flex-1">
                <div className="text-sm font-medium text-white mb-0.5 group-hover:text-white transition-colors duration-300">
                  {trip.title}
                </div>
                <div className="text-xs text-neutral-500 group-hover:text-neutral-400 truncate transition-colors duration-300">
                  {trip.description}
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-700 group-hover:text-neutral-400 group-hover:translate-x-0.5 transition-all duration-300 opacity-0 group-hover:opacity-100" />
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-emerald-500/50" />
          <span className="font-mono text-[10px] text-neutral-600 tracking-wider">
            v1.0
          </span>
        </div>
      </div>
    </div>
  )
}
