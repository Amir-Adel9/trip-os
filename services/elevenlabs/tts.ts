/**
 * Client-side TTS service utilities for ElevenLabs
 */

import type { ElevenLabsVoice, ElevenLabsVoicesResponse, ElevenLabsTTSParams } from './types';

/**
 * Fetch all available voices from ElevenLabs
 */
export async function fetchVoices(): Promise<ElevenLabsVoice[]> {
  try {
    const response = await fetch('/api/elevenlabs/voices');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.statusText}`);
    }
    
    const data: ElevenLabsVoicesResponse = await response.json();
    return data.voices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    throw error;
  }
}

/**
 * Generate speech from text using ElevenLabs TTS
 */
export async function generateSpeech(params: ElevenLabsTTSParams): Promise<Blob> {
  try {
    const response = await fetch('/api/elevenlabs/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to generate speech: ${response.statusText} - ${errorText}`);
    }
    
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

/**
 * Create an audio URL from a blob for playback
 */
export function createAudioURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke an audio URL to free memory
 */
export function revokeAudioURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Play audio from a blob
 */
export async function playAudio(blob: Blob): Promise<HTMLAudioElement> {
  const url = createAudioURL(blob);
  const audio = new Audio(url);
  
  return new Promise((resolve, reject) => {
    audio.onloadeddata = () => resolve(audio);
    audio.onended = () => {
      revokeAudioURL(url);
    };
    audio.onerror = (error) => {
      revokeAudioURL(url);
      reject(error);
    };
    audio.play().catch(reject);
  });
}

/**
 * Generate a trip briefing text and then convert to speech
 */
export async function generateTripBriefing(tripData: any): Promise<Blob> {
  // Construct a concise briefing text from trip data
  const destination = tripData.destination;
  const totalDays = tripData.days.length;
  const totalBudget = tripData.totalBudget;
  const currency = tripData.currency || "USD";
  
  let briefingText = `Welcome to your Trip O S briefing for ${destination}. `;
  briefingText += `You have a ${totalDays} day journey ahead with a total budget of ${totalBudget} ${currency}. `;
  
  // Add a highlight from the first day
  if (tripData.days.length > 0) {
    const firstDay = tripData.days[0];
    briefingText += `On your first day, you'll be focusing on ${firstDay.title}. `;
    if (firstDay.events.length > 0) {
      briefingText += `Highlights include ${firstDay.events[0].title}. `;
    }
  }
  
  briefingText += "I've optimized your itinerary for the best experience. Have a wonderful trip!";

  // Use a more modern model and try to get available voices if possible
  // For now, using a more stable default voice ID (Rachel is very common)
  const DEFAULT_VOICE_ID = "21m00Tcm4TlvDq8ikWAM"; 

  return generateSpeech({
    text: briefingText,
    voice_id: DEFAULT_VOICE_ID,
    model_id: "eleven_multilingual_v2"
  });
}
