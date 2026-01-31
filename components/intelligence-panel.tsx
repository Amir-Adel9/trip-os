'use client';

import React, { useRef, useEffect } from 'react';

import { useState } from 'react';
import { MessageCircle, Wallet, User, Loader2, Bot } from 'lucide-react';
import type { TripData } from '@/lib/trip-types';
import {
  extractTripJson,
  mapBotpressToTripData,
  isValidTripData,
  formatCurrency,
} from '@/lib/trip-utils';

interface Budget {
  total: number;
  spent: number;
  breakdown: {
    food: number;
    activity: number;
    travel: number;
  };
  currency: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  displayText: string;
  createdAt: string;
  isContextUpdate?: boolean;
}

interface IntelligencePanelProps {
  onAdapt: (action: string, newTripData?: TripData) => void;
  budget: Budget;
  onReset: () => void;
  sendToBrain: (text: string) => Promise<unknown>;
  messages?: ChatMessage[];
  loading: boolean;
  isReady: boolean;
  error: string | null;
}

export function IntelligencePanel({
  onAdapt,
  budget,
  sendToBrain,
  messages = [],
  loading,
  isReady,
  error: botpressError,
}: IntelligencePanelProps) {
  const [commandInput, setCommandInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim() || !isReady || loading) return;

    const input = commandInput;
    setCommandInput('');

    const response = await sendToBrain(input);

    if (response) {
      console.log('[IntelligencePanel] Got response:', response);

      // Try to extract trip data from response
      const tripJson = extractTripJson(response);

      if (tripJson) {
        console.log('[IntelligencePanel] Detected trip update in response');
        const mappedData = mapBotpressToTripData(tripJson);

        if (mappedData && isValidTripData(mappedData)) {
          onAdapt('update_received', mappedData);
        } else {
          console.warn('[IntelligencePanel] Invalid trip data in response', {
            tripJson,
            mappedData,
          });
        }
      }
    }
  };

  const handleChipClick = async (chip: string) => {
    if (!isReady || loading) return;

    const response = await sendToBrain(chip);

    if (response) {
      const tripJson = extractTripJson(response);
      if (tripJson) {
        const mappedData = mapBotpressToTripData(tripJson);
        if (mappedData && isValidTripData(mappedData)) {
          onAdapt(chip, mappedData);
        }
      }
    }
  };

  // Calculate progress percentages
  const total = budget.spent || 1;
  const foodPct = (budget.breakdown.food / total) * 100;
  const activityPct = (budget.breakdown.activity / total) * 100;
  const travelPct = (budget.breakdown.travel / total) * 100;

  return (
    <div className='flex flex-col h-full relative overflow-y-auto scrollbar-hide animate-fade-in'>
      {/* Budget Section */}
      <div className='px-5 py-5'>
        <div className='flex items-center gap-2 mb-4'>
          <Wallet className='w-3.5 h-3.5 text-neutral-600' />
          <span className='font-mono text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-medium'>
            Budget
          </span>
        </div>

        {/* Total Amount - Animated Counter */}
        <div className='text-2xl font-semibold text-neutral-100 mb-4 tracking-tight transition-all duration-500'>
          {formatCurrency(budget.spent, budget.currency)}
        </div>

        {/* Segmented Progress Bar - increased intensity */}
        <div className='h-1.5 rounded-sm bg-neutral-800/60 flex overflow-hidden mb-3 shadow-inner'>
          <div
            className='bg-orange-400 transition-all shadow-sm shadow-orange-400/30'
            style={{ width: `${foodPct}%` }}
          />
          <div
            className='bg-emerald-400 transition-all shadow-sm shadow-emerald-400/30'
            style={{ width: `${activityPct}%` }}
          />
          <div
            className='bg-blue-400 transition-all shadow-sm shadow-blue-400/30'
            style={{ width: `${travelPct}%` }}
          />
        </div>

        {/* Legend */}
        <div className='flex items-center gap-4 text-[11px] text-neutral-500'>
          <div className='flex items-center gap-1.5'>
            <div className='w-2 h-2 rounded-full bg-orange-400 shadow-sm shadow-orange-400/40' />
            <span>Food</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/40' />
            <span>Activity</span>
          </div>
          <div className='flex items-center gap-1.5'>
            <div className='w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/40' />
            <span>Travel</span>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className='px-5 py-4 flex-1 overflow-hidden flex flex-col min-h-0'>
        <div className='flex items-center gap-2 mb-3'>
          <MessageCircle className='w-3.5 h-3.5 text-neutral-600' />
          <span className='font-mono text-[10px] text-neutral-600 uppercase tracking-[0.2em] font-medium'>
            Chat
          </span>
        </div>

        <div className='bg-linear-to-b from-neutral-900/50 to-neutral-950/60 rounded-md shadow-lg shadow-black/30 flex-1 overflow-y-auto scrollbar-hide min-h-0'>
          <div className='p-4 space-y-4'>
            {messages.length === 0 && !loading ? (
              <div className='flex items-start gap-3'>
                <div className='w-6 h-6 rounded-md bg-linear-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-orange-500/20'>
                  <Bot className='w-3.5 h-3.5 text-orange-400' />
                </div>
                <p className='text-sm text-neutral-500 leading-relaxed'>
                  Send a command to start interacting with Trip OS...
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className='w-6 h-6 rounded-md bg-linear-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-orange-500/20'>
                        <Bot className='w-3.5 h-3.5 text-orange-400' />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] ${
                        msg.role === 'user'
                          ? 'bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2'
                          : ''
                      }`}
                    >
                      <p
                        className={`text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'text-emerald-300'
                            : 'text-neutral-400'
                        }`}
                      >
                        {msg.displayText}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className='w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-emerald-500/20'>
                        <User className='w-3.5 h-3.5 text-emerald-400' />
                      </div>
                    )}
                  </div>
                ))}

                {/* Loading indicator */}
                {loading && (
                  <div className='flex items-start gap-3'>
                    <div className='w-6 h-6 rounded-md bg-linear-to-br from-orange-500/20 to-orange-600/10 flex items-center justify-center shrink-0 mt-0.5 shadow-md shadow-orange-500/20'>
                      <Loader2 className='w-3.5 h-3.5 text-orange-400 animate-spin' />
                    </div>
                    <div className='space-y-2 flex-1'>
                      <div className='h-3 bg-neutral-800/50 rounded animate-pulse w-full' />
                      <div className='h-3 bg-neutral-800/50 rounded animate-pulse w-4/5' />
                      <div className='h-3 bg-neutral-800/50 rounded animate-pulse w-3/5' />
                    </div>
                  </div>
                )}
              </>
            )}

            {botpressError && (
              <p className='text-xs text-red-400'>{botpressError}</p>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Command Input - OS command prompt style */}
      <div className='p-5 mt-auto'>
        <div className='relative'>
          <form onSubmit={handleCommand}>
            <input
              type='text'
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder={
                !isReady
                  ? 'Connecting to assistant...'
                  : 'Ask anything about your trip...'
              }
              disabled={loading || !isReady}
              className='w-full bg-neutral-900/40 rounded-md text-sm text-neutral-200 placeholder:text-neutral-600 px-4 py-3 pr-12 focus:outline-none focus:ring-1 focus:ring-neutral-700/50 transition-all shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-default'
            />
          </form>

          {/* Send Button */}
          <button
            type='button'
            onClick={() =>
              commandInput.trim() &&
              handleCommand({ preventDefault: () => {} } as React.FormEvent)
            }
            disabled={loading || !isReady || !commandInput.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer shadow-md shadow-black/30 disabled:opacity-50 disabled:cursor-default disabled:hover:scale-100 disabled:hover:bg-neutral-800/80 ${
              isInputFocused
                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/20'
                : 'bg-neutral-800/80 text-neutral-500 hover:bg-emerald-500/20 hover:text-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 hover:scale-110'
            }`}
          >
            {loading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <MessageCircle className='w-4 h-4' />
            )}
          </button>
        </div>

        {/* Adaptive Chips */}
        <div className='flex items-center gap-2 mt-3'>
          <button
            type='button'
            onClick={() => handleChipClick('Make it cheaper')}
            disabled={loading || !isReady}
            className='px-3 py-1.5 rounded-sm bg-neutral-900/40 hover:bg-neutral-800/60 text-[11px] text-neutral-500 hover:text-neutral-300 transition-all duration-300 cursor-pointer shadow-md shadow-black/20 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-default disabled:hover:scale-100'
          >
            Make it cheaper
          </button>
          <button
            type='button'
            onClick={() => handleChipClick('Less walking')}
            disabled={loading || !isReady}
            className='px-3 py-1.5 rounded-sm bg-neutral-900/40 hover:bg-neutral-800/60 text-[11px] text-neutral-500 hover:text-neutral-300 transition-all duration-300 cursor-pointer shadow-md shadow-black/20 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-default disabled:hover:scale-100'
          >
            Less walking
          </button>
        </div>
      </div>
    </div>
  );
}
