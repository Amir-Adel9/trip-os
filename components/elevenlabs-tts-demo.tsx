"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Pause,
  Download,
  Loader2,
  Volume2,
  Settings,
} from "lucide-react";
import { fetchVoices, generateSpeech, createAudioURL, revokeAudioURL } from "@/services/elevenlabs/tts";
import type { ElevenLabsVoice } from "@/services/elevenlabs/types";

export function ElevenLabsTTSDemo() {
  const [voices, setVoices] = useState<ElevenLabsVoice[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");
  const [text, setText] = useState<string>(
    "Hello! This is a demonstration of ElevenLabs Text-to-Speech. You can customize the voice, adjust settings, and generate natural-sounding speech from any text."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  
  // Voice settings
  const [stability, setStability] = useState(0.5);
  const [similarityBoost, setSimilarityBoost] = useState(0.75);
  const [style, setStyle] = useState(0.0);
  const [useSpeakerBoost, setUseSpeakerBoost] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voices on mount
  useEffect(() => {
    async function loadVoices() {
      try {
        setIsLoading(true);
        const fetchedVoices = await fetchVoices();
        setVoices(fetchedVoices);
        if (fetchedVoices.length > 0) {
          setSelectedVoiceId(fetchedVoices[0].voice_id);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load voices");
      } finally {
        setIsLoading(false);
      }
    }
    loadVoices();
  }, []);

  // Cleanup audio URL on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) {
        revokeAudioURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Handle audio playback events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioUrl]);

  const handleGenerate = async () => {
    if (!selectedVoiceId || !text.trim()) {
      setError("Please select a voice and enter some text");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Revoke previous audio URL if exists
      if (audioUrl) {
        revokeAudioURL(audioUrl);
        setAudioUrl(null);
      }

      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }

      // Generate speech
      const audioBlob = await generateSpeech({
        text: text.trim(),
        voice_id: selectedVoiceId,
        voice_settings: {
          stability,
          similarity_boost: similarityBoost,
          style,
          use_speaker_boost: useSpeakerBoost,
        },
      });

      // Create audio URL and set up audio element
      const url = createAudioURL(audioBlob);
      setAudioUrl(url);

      // Create or update audio element
      if (audioRef.current) {
        audioRef.current.src = url;
      } else {
        const audio = new Audio(url);
        audioRef.current = audio;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate speech");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !audioUrl) {
      // If no audio, generate it first
      handleGenerate();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `elevenlabs-tts-${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedVoice = voices.find((v) => v.voice_id === selectedVoiceId);
  const characterCount = text.length;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-neutral-100">ElevenLabs TTS Demo</h1>
        <p className="text-neutral-400 text-sm">
          Generate natural-sounding speech from text using ElevenLabs AI voices
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-md p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-6">
        {/* Text Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">
            Text to Convert
          </label>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter text to convert to speech..."
            className="min-h-32 bg-neutral-900/40 border-neutral-800 text-neutral-200 placeholder:text-neutral-600"
            disabled={isLoading}
          />
          <div className="flex justify-between items-center text-xs text-neutral-500">
            <span>{characterCount} characters</span>
            <span>Max recommended: 5000 characters</span>
          </div>
        </div>

        {/* Voice Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-300">
            Select Voice
          </label>
          {isLoading && voices.length === 0 ? (
            <div className="flex items-center gap-2 text-neutral-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading voices...
            </div>
          ) : (
            <Select
              value={selectedVoiceId}
              onValueChange={setSelectedVoiceId}
              disabled={isLoading || voices.length === 0}
            >
              <SelectTrigger className="w-full bg-neutral-900/40 border-neutral-800 text-neutral-200">
                <SelectValue placeholder="Select a voice">
                  {selectedVoice?.name || "Select a voice"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-neutral-900 border-neutral-800">
                {voices.map((voice) => (
                  <SelectItem
                    key={voice.voice_id}
                    value={voice.voice_id}
                    className="text-neutral-200"
                  >
                    {voice.name}
                    {voice.category && (
                      <span className="text-neutral-500 ml-2">
                        ({voice.category})
                      </span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {selectedVoice?.description && (
            <p className="text-xs text-neutral-500 mt-1">
              {selectedVoice.description}
            </p>
          )}
        </div>

        {/* Voice Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-neutral-300">
              Voice Settings
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-neutral-400 hover:text-neutral-200"
            >
              <Settings className="w-4 h-4 mr-2" />
              {showSettings ? "Hide" : "Show"} Settings
            </Button>
          </div>

          {showSettings && (
            <div className="bg-neutral-900/40 border border-neutral-800 rounded-md p-4 space-y-4">
              {/* Stability */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-neutral-300">Stability</label>
                  <span className="text-xs text-neutral-500">{stability.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stability}
                  onChange={(e) => setStability(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-400"
                />
                <p className="text-xs text-neutral-500">
                  Controls consistency vs. dynamism (0.0 = more dynamic, 1.0 = more stable)
                </p>
              </div>

              {/* Similarity Boost */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-neutral-300">Similarity Boost</label>
                  <span className="text-xs text-neutral-500">{similarityBoost.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={similarityBoost}
                  onChange={(e) => setSimilarityBoost(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-400"
                />
                <p className="text-xs text-neutral-500">
                  How closely the generated voice matches the original (0.0-1.0)
                </p>
              </div>

              {/* Style */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-neutral-300">Style</label>
                  <span className="text-xs text-neutral-500">{style.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={style}
                  onChange={(e) => setStyle(parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-neutral-400"
                />
                <p className="text-xs text-neutral-500">
                  Exaggeration of the style (0.0 = neutral, 1.0 = exaggerated)
                </p>
              </div>

              {/* Speaker Boost */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-neutral-300">Speaker Boost</label>
                <input
                  type="checkbox"
                  checked={useSpeakerBoost}
                  onChange={(e) => setUseSpeakerBoost(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-700 bg-neutral-800 text-neutral-400 focus:ring-neutral-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !selectedVoiceId || !text.trim()}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 mr-2" />
                Generate Speech
              </>
            )}
          </Button>

          <Button
            onClick={handlePlayPause}
            disabled={!audioUrl && !isLoading}
            variant="outline"
            className="border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-200"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Play
              </>
            )}
          </Button>

          {audioUrl && (
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800 text-neutral-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>

        {/* Audio Element (hidden) */}
        {audioUrl && (
          <audio ref={audioRef} src={audioUrl} className="hidden" />
        )}

        {/* Info */}
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-md p-4 text-sm text-neutral-400">
          <p className="font-medium text-neutral-300 mb-2">How to use:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs">
            <li>Enter or paste text you want to convert to speech</li>
            <li>Select a voice from the dropdown</li>
            <li>Optionally adjust voice settings for customization</li>
            <li>Click "Generate Speech" to create the audio</li>
            <li>Use Play/Pause to listen, or Download to save the file</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
