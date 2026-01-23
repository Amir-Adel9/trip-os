'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { BOTPRESS_WEBHOOK_ID } from '@/lib/botpress';
import type { TripData } from '@/lib/trip-types';

export type BotResponse = {
  reply: string;
  metadata?: Record<string, unknown>;
};

type ChatState = {
  client: any; // Will be typed dynamically from @botpress/chat
  conversationId: string;
};

export function useBotpressBrain(tripData?: TripData) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  
  const chatStateRef = useRef<ChatState | null>(null);
  const tripDataRef = useRef<TripData | undefined>(tripData);
  const initCalledRef = useRef(false);
  const isReadyRef = useRef(false); // Ref for synchronous ready checks

  // Keep tripData ref updated
  useEffect(() => {
    tripDataRef.current = tripData;
  }, [tripData]);

  // Initialize client on mount (with guard against double-invocation in Strict Mode)
  useEffect(() => {
    if (initCalledRef.current) return;
    initCalledRef.current = true;

    let mounted = true;

    const init = async () => {
      try {
        console.log('[Botpress] Connecting...');
        
        // Dynamically import Botpress chat SDK (client-side only)
        const { Client } = await import('@botpress/chat');
        
        const client = await Client.connect({
          webhookId: process.env.NEXT_PUBLIC_BOTPRESS_WEBHOOK_ID!,
        });

        console.log('[Botpress] Connected. User:', client.user.id);

        const { conversation } = await client.createConversation({});
        console.log('[Botpress] Conversation:', conversation.id);

        chatStateRef.current = {
          client,
          conversationId: conversation.id,
        };

        // NOTE: Not sending initial context automatically
        // Context can be sent manually via updateContext() when needed
        
        if (mounted) {
          isReadyRef.current = true;
          setIsReady(true);
        }
      } catch (err) {
        console.error('[Botpress] Init failed:', err);
        if (mounted) {
          setError('Failed to connect');
        }
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []); // Only run once on mount

  // Function to update context (e.g., when trip data changes)
  const updateContext = useCallback(async (newTripData: TripData) => {
    const chatState = chatStateRef.current;
    if (!chatState) return;

    tripDataRef.current = newTripData;

    try {
      const contextMessage = `[CONTEXT_UPDATE]
Updated trip state:
${JSON.stringify(newTripData, null, 2)}
[/CONTEXT_UPDATE]`;

      await chatState.client.createMessage({
        conversationId: chatState.conversationId,
        payload: {
          type: 'text',
          text: contextMessage,
        },
      });
      console.log('[Botpress] Context updated');
    } catch (err) {
      console.error('[Botpress] Failed to update context:', err);
    }
  }, []);

  const sendToBrain = useCallback(async (text: string): Promise<BotResponse | null> => {
    const chatState = chatStateRef.current;
    
    if (!chatState) {
      setError('Not connected');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Send plain message (context already set)
      const { message: sentMessage } = await chatState.client.createMessage({
        conversationId: chatState.conversationId,
        payload: {
          type: 'text',
          text,
        },
      });

      // Poll for bot reply (increased timeout to 60 seconds)
      const maxAttempts = 60;
      const pollInterval = 1000;
      
      console.log('[Botpress] Waiting for bot response... (max 60 seconds)')
      
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, pollInterval));
        
        const { messages } = await chatState.client.listMessages({
          conversationId: chatState.conversationId,
        });

        console.log(`[Botpress] Poll attempt ${i + 1}/${maxAttempts}, messages:`, messages.length)

        // Find a bot reply (message from different user, after our message)
        const botReply = messages.find(m => 
          m.userId !== chatState.client.user.id &&
          new Date(m.createdAt) > new Date(sentMessage.createdAt)
        );

        if (botReply) {
          console.log('[Botpress] Bot reply found:', botReply)
          const payload = botReply.payload as { text?: string; [key: string]: unknown };
          setLoading(false); // Clear loading before returning
          return {
            reply: payload.text || '',
            metadata: payload,
          };
        }
      }

      console.warn('[Botpress] Timeout: No bot response after 60 seconds')
      setLoading(false); // Clear loading before returning
      return { reply: 'No response received. Please try again.' };
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      console.error('[Botpress] Error:', err);
      setLoading(false); // Clear loading on error
      return null;
    } finally {
      setLoading(false); // Ensure loading is always cleared
    }
  }, []);

  return {
    sendToBrain,
    updateContext,
    loading,
    error,
    isReady,
    isReadyRef, // Export ref for synchronous checks
  };
}
