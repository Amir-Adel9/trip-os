/**
 * TypeScript types for ElevenLabs API responses
 */

export interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  samples?: Array<{
    sample_id: string;
    file_name: string;
    mime_type: string;
    size_bytes: number;
    hash: string;
  }>;
  category: string;
  fine_tuning?: {
    model_id?: string;
    is_allowed_to_fine_tune: boolean;
    finetuning_state: string;
    verification_failures: string[];
    verification_attempts_count: number;
    manual_verification_requested: boolean;
  };
  labels: Record<string, string>;
  description?: string;
  preview_url?: string;
  available_for_tiers?: string[];
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  sharing?: {
    status: string;
    history_item_sample_id?: string;
    original_voice_id?: string;
    public_owner_id?: string;
    liked_by_count: number;
    name?: string;
    labels?: Record<string, string>;
    description?: string;
    created_at_unix?: number;
    cloning_not_allowed_reason?: string;
    credit_cost?: number;
    free_users_allowed: boolean;
    live_moderation_enabled: boolean;
    rate?: number;
    notice_period?: number;
    featured?: boolean;
  };
  safety_status?: string;
  permission_on_resource?: string;
}

export interface ElevenLabsVoicesResponse {
  voices: ElevenLabsVoice[];
}

export interface ElevenLabsTTSParams {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

export interface ElevenLabsTTSResponse {
  audio: ArrayBuffer;
  contentType: string;
}
