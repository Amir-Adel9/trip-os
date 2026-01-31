'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TripData } from '@/lib/trip-types';

export type BotResponse = {
  reply: string;
  metadata?: Record<string, unknown>;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  displayText: string; // Text with JSON stripped for display
  createdAt: string;
  isContextUpdate?: boolean;
};

// Helper to strip JSON blocks from message text for display
function stripJsonFromText(text: string): string {
  // Remove ```json ... ``` blocks
  let cleaned = text.replace(/```json[\s\S]*?```/g, '').trim();
  // Remove standalone JSON objects that look like trip data
  cleaned = cleaned.replace(/\{[\s\S]*?"destination"[\s\S]*?"days"[\s\S]*?\}$/g, '').trim();
  // Remove any remaining ``` blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '').trim();
  // If nothing left, provide a default message
  if (!cleaned) {
    cleaned = "I've updated your itinerary.";
  }
  return cleaned;
}

type ChatState = {
  client: any; // Will be typed dynamically from @botpress/chat
  conversationId: string;
};

// Storage key for Botpress user key
const BOTPRESS_USER_KEY_PREFIX = 'botpress-user-key-';

export function useBotpressBrain(tripId?: string, tripData?: TripData, userId?: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  
  const chatStateRef = useRef<ChatState | null>(null);
  const tripDataRef = useRef<TripData | undefined>(tripData);
  const currentTripIdRef = useRef<string | null>(null);
  const isReadyRef = useRef(false); // Ref for synchronous ready checks
  const contextSentRef = useRef(false); // Track if context was sent for current conversation

  // Keep tripData ref updated
  useEffect(() => {
    tripDataRef.current = tripData;
  }, [tripData]);

  // Send context when tripData becomes available after conversation is ready
  // This handles the case where trip loads after Botpress connection is established
  useEffect(() => {
    if (!isReady || !tripId || !tripData || contextSentRef.current) return;
    
    const chatState = chatStateRef.current;
    if (!chatState) return;

    const sendInitialContext = async () => {
      try {
        const contextMessage = `[CONTEXT_UPDATE]
Current trip state (session resumed):
${JSON.stringify(tripData, null, 2)}
[/CONTEXT_UPDATE]`;

        await chatState.client.createMessage({
          conversationId: chatState.conversationId,
          payload: {
            type: 'text',
            text: contextMessage,
          },
        });
        contextSentRef.current = true;
        console.log('[Botpress] Initial context sent (tripData loaded after connection)');
      } catch (err) {
        console.warn('[Botpress] Failed to send initial context:', err);
      }
    };

    sendInitialContext();
  }, [isReady, tripId, tripData]);

  // Initialize client and conversation
  // - With tripId: initialize on mount to load existing messages
  // - Without tripId (home page): skip - will initialize lazily on first message
  useEffect(() => {
    // For home page (no tripId), don't auto-connect - wait for first message
    if (!tripId) {
      console.log('[Botpress] Home page mode - will connect on first message');
      return;
    }

    // Wait for userId to be available for proper session persistence
    if (!userId) {
      console.log('[Botpress] Waiting for userId before connecting...');
      return;
    }

    // Create a unique key for this conversation context
    const contextKey = `${tripId}-${userId}`;
    
    // Skip if already initialized for this context
    if (currentTripIdRef.current === contextKey) return;
    currentTripIdRef.current = contextKey;

    // Reset state for new/initial conversation
    setIsReady(false);
    isReadyRef.current = false;
    contextSentRef.current = false; // Reset context tracking for new conversation
    setError(null);
    setMessages([]); // Clear previous conversation messages

    let cancelled = false;

    const init = async () => {
      if (cancelled) return;
      try {
        console.log('[Botpress] Connecting...', tripId ? `for trip: ${tripId}` : '(ephemeral)');
        
        // Dynamically import Botpress chat SDK (client-side only)
        const { Client } = await import('@botpress/chat');
        
        // Try to reuse stored user key for persistent identity across sessions
        const storedUserKey = userId ? localStorage.getItem(`${BOTPRESS_USER_KEY_PREFIX}${userId}`) : null;
        
        const connectOptions: any = {
          webhookId: process.env.NEXT_PUBLIC_BOTPRESS_WEBHOOK_ID!,
        };
        
        // If we have a stored user key, use it for session continuity
        if (storedUserKey) {
          connectOptions.userKey = storedUserKey;
          console.log('[Botpress] Using stored user key for session continuity');
        }
        
        const client = await Client.connect(connectOptions);
        
        // Store the user key for future sessions
        if (userId && client.user?.key) {
          localStorage.setItem(`${BOTPRESS_USER_KEY_PREFIX}${userId}`, client.user.key);
          console.log('[Botpress] Stored user key for future sessions');
        }

        console.log('[Botpress] Connected. User:', client.user.id);

        let conversation;
        if (tripId) {
          // Try to get or create a conversation with tripId
          // Note: Botpress assigns unique user IDs per session, so if a conversation
          // was created in a previous session, we may not own it anymore.
          // Fall back to creating a new conversation if access is denied.
          try {
            const result = await client.getOrCreateConversation({
              id: tripId,
            });
            conversation = result.conversation;
            console.log('[Botpress] Conversation:', conversation.id, '(persisted for trip:', tripId, ')');
          } catch (convErr: any) {
            // Check if it's a Forbidden error (conversation owned by different user)
            // The error might come in different formats from the SDK
            const errString = String(convErr);
            const errMessage = convErr?.message || '';
            const errName = convErr?.name || '';
            const isForbidden = 
              errName === 'ForbiddenError' ||
              errString.includes('ForbiddenError') ||
              errString.includes('Forbidden') ||
              errMessage.includes('not the owner') ||
              errMessage.includes('403') ||
              convErr?.status === 403;
            
            if (isForbidden) {
              console.warn('[Botpress] Cannot access existing conversation (different session), creating new one');
              const result = await client.createConversation({});
              conversation = result.conversation;
              console.log('[Botpress] Conversation:', conversation.id, '(new session for trip:', tripId, ')');
            } else {
              throw convErr; // Re-throw other errors
            }
          }
        } else {
          // Create ephemeral conversation (no tripId - e.g., home page)
          const result = await client.createConversation({});
          conversation = result.conversation;
          console.log('[Botpress] Conversation:', conversation.id, '(ephemeral)');
        }

        chatStateRef.current = {
          client,
          conversationId: conversation.id,
        };

        // Fetch existing messages from the conversation
        try {
          const { messages: existingMessages } = await client.listMessages({
            conversationId: conversation.id,
          });
          
          if (existingMessages && existingMessages.length > 0 && !cancelled) {
            // Convert Botpress messages to our format
            const chatMessages: ChatMessage[] = existingMessages
              .map((m: any) => {
                const text = m.payload?.text || '';
                const isContextUpdate = text.includes('[CONTEXT_UPDATE]');
                const role = m.userId === client.user.id ? 'user' as const : 'assistant' as const;
                return {
                  id: m.id,
                  role,
                  text,
                  displayText: role === 'assistant' ? stripJsonFromText(text) : text,
                  createdAt: m.createdAt,
                  isContextUpdate,
                };
              })
              .filter((m: ChatMessage) => !m.isContextUpdate) // Filter out context updates from display
              .sort((a: ChatMessage, b: ChatMessage) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
            
            setMessages(chatMessages);
            console.log('[Botpress] Loaded', chatMessages.length, 'existing messages');
          }
        } catch (err) {
          console.warn('[Botpress] Failed to fetch existing messages:', err);
        }

        // Send current trip context when connecting to a persisted conversation
        // This ensures the bot has the latest trip state on each session
        if (tripId && tripDataRef.current && !cancelled) {
          try {
            const contextMessage = `[CONTEXT_UPDATE]
Current trip state (session resumed):
${JSON.stringify(tripDataRef.current, null, 2)}
[/CONTEXT_UPDATE]`;

            await client.createMessage({
              conversationId: conversation.id,
              payload: {
                type: 'text',
                text: contextMessage,
              },
            });
            contextSentRef.current = true;
            console.log('[Botpress] Initial context sent for persisted conversation');
          } catch (err) {
            console.warn('[Botpress] Failed to send initial context:', err);
          }
        }
        
        if (!cancelled) {
          isReadyRef.current = true;
          setIsReady(true);
          console.log('[Botpress] Ready!');
        }
      } catch (err) {
        console.error('[Botpress] Init failed:', err);
        if (!cancelled) {
          setError('Failed to connect');
        }
      }
    };

    init();

    return () => {
      cancelled = true;
    };
  }, [tripId, userId]); // Re-run when tripId or userId changes

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

  // Lazy connection for home page - creates ephemeral conversation on first message
  const ensureConnected = useCallback(async (): Promise<ChatState | null> => {
    // If already connected, return existing state
    if (chatStateRef.current) {
      return chatStateRef.current;
    }

    // Only allow lazy connection for home page (no tripId)
    if (tripId) {
      console.error('[Botpress] Trip page should already be connected');
      return null;
    }

    try {
      console.log('[Botpress] Lazy connecting for home page...');
      
      const { Client } = await import('@botpress/chat');
      
      const client = await Client.connect({
        webhookId: process.env.NEXT_PUBLIC_BOTPRESS_WEBHOOK_ID!,
      });

      console.log('[Botpress] Connected. User:', client.user.id);

      const { conversation } = await client.createConversation({});
      console.log('[Botpress] Conversation:', conversation.id, '(ephemeral)');

      const chatState: ChatState = {
        client,
        conversationId: conversation.id,
      };

      chatStateRef.current = chatState;
      isReadyRef.current = true;
      setIsReady(true);

      return chatState;
    } catch (err) {
      console.error('[Botpress] Lazy connection failed:', err);
      setError('Failed to connect');
      return null;
    }
  }, [tripId]);

  const sendToBrain = useCallback(async (text: string): Promise<BotResponse | null> => {
    // Ensure we're connected (lazy connect for home page)
    const chatState = await ensureConnected();
    
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

      // Add user message to state immediately
      const userMessage: ChatMessage = {
        id: sentMessage.id,
        role: 'user',
        text,
        displayText: text,
        createdAt: sentMessage.createdAt,
      };
      setMessages(prev => [...prev, userMessage]);

      // Poll for bot reply (increased timeout to 120 seconds for complex trip generation)
      const maxAttempts = 120;
      const pollInterval = 1000;
      
      console.log('[Botpress] Waiting for bot response... (max 120 seconds)')
      
      for (let i = 0; i < maxAttempts; i++) {
        await new Promise(r => setTimeout(r, pollInterval));
        
        const { messages: allMessages } = await chatState.client.listMessages({
          conversationId: chatState.conversationId,
        });

        console.log(`[Botpress] Poll attempt ${i + 1}/${maxAttempts}, messages:`, allMessages.length)

        // Find a bot reply (message from different user, after our message)
        const botReply = allMessages.find((m: any) => 
          m.userId !== chatState.client.user.id &&
          new Date(m.createdAt) > new Date(sentMessage.createdAt)
        );

        if (botReply) {
          console.log('[Botpress] Bot reply found:', botReply)
          const payload = botReply.payload as { text?: string; [key: string]: unknown };
          const replyText = payload.text || '';
          
          // Add bot message to state (strip JSON from display)
          const botMessage: ChatMessage = {
            id: botReply.id,
            role: 'assistant',
            text: replyText,
            displayText: stripJsonFromText(replyText),
            createdAt: botReply.createdAt,
          };
          setMessages(prev => [...prev, botMessage]);
          
          setLoading(false);
          return {
            reply: replyText,
            metadata: payload,
          };
        }
      }

      console.warn('[Botpress] Timeout: No bot response after 120 seconds')
      setLoading(false);
      return { reply: 'No response received. Please try again.' };
      
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
      console.error('[Botpress] Error:', err);
      setLoading(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, [ensureConnected]);

  return {
    sendToBrain,
    updateContext,
    messages,
    loading,
    error,
    isReady,
    isReadyRef, // Export ref for synchronous checks
  };
}
