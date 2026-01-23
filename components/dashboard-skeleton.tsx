"use client"

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 animate-float">
      {/* Subtle radial vignette - matches dashboard */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-60" />

      {/* Header Skeleton - matches dashboard header exactly */}
      <header className="h-12 flex items-center justify-center gap-6 relative z-10 bg-neutral-950/80 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-[3px] bg-neutral-800 animate-pulse-slow" />
          <div className="w-14 h-3 rounded bg-neutral-800 animate-pulse-slow" />
        </div>
        <div className="w-px h-5 bg-neutral-800/60" />
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-neutral-800 animate-pulse-slow" />
          <div className="w-12 h-3 rounded bg-neutral-800 animate-pulse-slow" />
        </div>
        <div className="w-px h-5 bg-neutral-800/60" />
        <div className="w-20 h-3 rounded bg-neutral-800 animate-pulse-slow" />
      </header>

      {/* 3-Column Layout - matches dashboard grid exactly */}
      <div className="h-[calc(100vh-48px)] grid grid-cols-1 lg:grid-cols-[200px_1fr_320px] relative z-10">
        {/* Left: Day Navigation Skeleton */}
        <aside className="hidden lg:flex flex-col bg-neutral-950/40">
          {/* Itinerary Header */}
          <div className="px-5 py-5">
            <div className="w-16 h-2 rounded bg-neutral-800 animate-pulse-slow" />
          </div>

          {/* Day List */}
          <div className="flex-1 px-3 space-y-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`w-full h-11 rounded-md animate-pulse-slow ${
                  i === 1 ? "bg-neutral-900/80 shadow-lg shadow-black/20" : "bg-neutral-900/30"
                }`}
                style={{ animationDelay: `${i * 100}ms` }}
              />
            ))}
          </div>

          {/* Separator */}
          <div className="mx-5 h-px bg-neutral-800/30" />

          {/* Focus Section */}
          <div className="px-5 py-5">
            <div className="w-10 h-2 rounded bg-neutral-800 animate-pulse-slow mb-3" />
            <div className="w-28 h-3 rounded bg-emerald-400/20 animate-pulse-slow" />
          </div>
        </aside>

        {/* Center: Timeline Skeleton */}
        <main className="flex flex-col overflow-hidden relative">
          {/* Subtle gradient behind timeline - matches dashboard */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.03)_0%,transparent_60%)] pointer-events-none" />

          <div className="p-8 lg:p-12 max-w-3xl relative z-10">
            {/* Day Header */}
            <div className="mb-10">
              <div className="w-20 h-8 rounded bg-neutral-800 animate-pulse-slow mb-2" />
              <div className="w-24 h-3 rounded bg-neutral-800/60 animate-pulse-slow" />
            </div>

            {/* Vertical Timeline */}
            <div className="relative">
              {/* Main timeline spine */}
              <div className="absolute left-[31px] top-8 bottom-8 w-px bg-gradient-to-b from-neutral-800/60 via-neutral-700/40 to-neutral-800/60" />

              {[1, 2, 3, 4].map((i) => {
                // Cycle through colors to match the real timeline
                const colors = [
                  { dot: "bg-orange-400/30 shadow-orange-400/20", accent: "via-orange-400/10" },
                  { dot: "bg-orange-400/30 shadow-orange-400/20", accent: "via-orange-400/10" },
                  { dot: "bg-emerald-400/30 shadow-emerald-400/20", accent: "via-emerald-400/10" },
                  { dot: "bg-orange-400/30 shadow-orange-400/20", accent: "via-orange-400/10" },
                ]
                const color = colors[(i - 1) % colors.length]

                return (
                  <div
                    key={i}
                    className="relative flex gap-6 pb-8"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    {/* Left: Time + Spine */}
                    <div className="flex flex-col items-center w-16 flex-shrink-0">
                      {/* Time */}
                      <div className="w-10 h-3 rounded bg-neutral-800/60 animate-pulse-slow mb-3" />
                      
                      {/* Glowing Icon Dot */}
                      <div className={`w-6 h-6 rounded-full ${color.dot} shadow-lg animate-pulse-slow`} />
                    </div>

                    {/* Right: Event Card */}
                    <div className="flex-1 pt-5">
                      <div className="bg-neutral-900/50 rounded-md p-5 shadow-lg shadow-black/20 animate-pulse-slow relative">
                        {/* Subtle gradient header accent */}
                        <div className={`absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent ${color.accent} to-transparent rounded-t-md`} />
                        
                        {/* Cost */}
                        <div className="absolute top-5 right-5 w-12 h-3 rounded bg-neutral-800/60" />
                        
                        {/* Title */}
                        <div className="w-40 h-4 rounded bg-neutral-700/60 mb-3" />
                        
                        {/* Description */}
                        <div className="w-full h-3 rounded bg-neutral-800/50 mb-2" />
                        <div className="w-3/4 h-3 rounded bg-neutral-800/50 mb-4" />
                        
                        {/* Location */}
                        <div className="flex items-center gap-1.5">
                          <div className="w-3 h-3 rounded-full bg-neutral-800/60" />
                          <div className="w-24 h-2.5 rounded bg-neutral-800/60" />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>

        {/* Right: Intelligence Panel Skeleton */}
        <aside className="hidden lg:flex flex-col bg-gradient-to-b from-neutral-950/60 to-neutral-950/90">
          {/* Budget Section */}
          <div className="px-5 py-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3.5 h-3.5 rounded bg-neutral-800 animate-pulse-slow" />
              <div className="w-12 h-2 rounded bg-neutral-800 animate-pulse-slow" />
            </div>

            {/* Total Amount */}
            <div className="w-20 h-7 rounded bg-neutral-800 animate-pulse-slow mb-4" />

            {/* Segmented Progress Bar */}
            <div className="h-1.5 rounded-sm bg-neutral-800/60 flex overflow-hidden mb-3 shadow-inner">
              <div className="w-[40%] bg-orange-400/30 animate-pulse-slow" />
              <div className="w-[35%] bg-emerald-400/30 animate-pulse-slow" />
              <div className="w-[25%] bg-blue-400/30 animate-pulse-slow" />
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4">
              {[
                { color: "bg-orange-400/50", width: "w-8" },
                { color: "bg-emerald-400/50", width: "w-12" },
                { color: "bg-blue-400/50", width: "w-10" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${item.color} animate-pulse-slow`} />
                  <div className={`${item.width} h-2 rounded bg-neutral-800/60 animate-pulse-slow`} />
                </div>
              ))}
            </div>
          </div>

          {/* Live OS Toggle */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3.5 h-3.5 rounded bg-neutral-800 animate-pulse-slow" />
              <div className="w-12 h-2 rounded bg-neutral-800 animate-pulse-slow" />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-16 h-7 rounded-sm bg-emerald-500/15 animate-pulse-slow shadow-md shadow-emerald-500/10" />
              <div className="w-18 h-7 rounded-sm bg-neutral-900/50 animate-pulse-slow" />
            </div>
          </div>

          {/* Trip Card */}
          <div className="px-5 py-4">
            <div className="bg-neutral-900/40 rounded-md p-4 flex items-center justify-between shadow-lg shadow-black/20 animate-pulse-slow">
              <div className="w-36 h-3.5 rounded bg-neutral-700/60" />
              <div className="w-7 h-7 rounded-full bg-neutral-800/80 shadow-inner" />
            </div>
          </div>

          {/* AI Response Card */}
          <div className="px-5 py-4 flex-1">
            <div className="bg-gradient-to-b from-neutral-900/50 to-neutral-950/60 rounded-md p-4 shadow-lg shadow-black/30 animate-pulse-slow">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-md bg-orange-500/20 flex-shrink-0 mt-0.5 shadow-md shadow-orange-500/20" />
                <div className="flex-1 space-y-2">
                  <div className="w-full h-3 rounded bg-neutral-700/50" />
                  <div className="w-full h-3 rounded bg-neutral-700/50" />
                  <div className="w-3/4 h-3 rounded bg-neutral-700/50" />
                </div>
              </div>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Command Input */}
          <div className="p-5 mt-auto">
            <div className="relative">
              <div className="w-full bg-neutral-900/40 rounded-md h-11 shadow-lg shadow-black/20 animate-pulse-slow" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-neutral-800/80 shadow-md shadow-black/30 animate-pulse-slow" />
            </div>

            {/* Adaptive Chips */}
            <div className="flex items-center gap-2 mt-3">
              <div className="w-24 h-7 rounded-sm bg-neutral-900/40 shadow-md shadow-black/20 animate-pulse-slow" />
              <div className="w-20 h-7 rounded-sm bg-neutral-900/40 shadow-md shadow-black/20 animate-pulse-slow" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
