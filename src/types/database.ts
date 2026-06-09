export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
          current_fair_level: string;
          total_frames_analyzed: number;
          rolling_average_fair_score: number;
          highest_fair_score: number;
          best_classification: string | null;
          is_premium: boolean;
          is_founding_member: boolean;
          is_fair_circle_member: boolean;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          current_fair_level?: string;
          total_frames_analyzed?: number;
          rolling_average_fair_score?: number;
          highest_fair_score?: number;
          best_classification?: string | null;
          is_premium?: boolean;
          is_founding_member?: boolean;
          is_fair_circle_member?: boolean;
        };
        Update: {
          display_name?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
          current_fair_level?: string;
          total_frames_analyzed?: number;
          rolling_average_fair_score?: number;
          highest_fair_score?: number;
          best_classification?: string | null;
          is_premium?: boolean;
          is_founding_member?: boolean;
          is_fair_circle_member?: boolean;
        };
        Relationships: [];
      };
      analysis_history: {
        Row: {
          id: string;
          user_id: string;
          analysis_mode: string;
          scene_type: string;
          story_context: Json | null;
          result: Json;
          source: string;
          created_at: string;
          fair_score: number | null;
          classification: string | null;
          image_type: string | null;
          category: string | null;
          chief_reaction: string | null;
          chief_assignment: string | null;
          detected_strengths: Json | null;
          detected_weaknesses: Json | null;
          attention_drivers: Json | null;
          fair_level_at_capture: string | null;
          safety_tier: string | null;
          ethics_reason_code: string | null;
          recognition_allowed: boolean | null;
          progress_contributed: boolean | null;
        };
        Insert: {
          user_id: string;
          analysis_mode: string;
          scene_type: string;
          story_context?: Json | null;
          result: Json;
          source?: string;
          fair_score?: number | null;
          classification?: string | null;
          image_type?: string | null;
          category?: string | null;
          chief_reaction?: string | null;
          chief_assignment?: string | null;
          detected_strengths?: Json | null;
          detected_weaknesses?: Json | null;
          attention_drivers?: Json | null;
          fair_level_at_capture?: string | null;
          safety_tier?: string | null;
          ethics_reason_code?: string | null;
          recognition_allowed?: boolean | null;
          progress_contributed?: boolean | null;
        };
        Update: Partial<Database["public"]["Tables"]["analysis_history"]["Insert"]>;
        Relationships: [];
      };
      chief_daily_usage: {
        Row: {
          user_id: string;
          usage_date: string;
          analysis_count: number;
          last_request_at: string | null;
        };
        Insert: {
          user_id: string;
          usage_date: string;
          analysis_count?: number;
          last_request_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["chief_daily_usage"]["Insert"]>;
        Relationships: [];
      };
      chief_request_dedup: {
        Row: {
          request_id: string;
          user_id: string;
          created_at: string;
        };
        Insert: {
          request_id: string;
          user_id: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["chief_request_dedup"]["Insert"]>;
        Relationships: [];
      };
      fair_cards: {
        Row: {
          id: string;
          user_id: string;
          analysis_id: string | null;
          card_type: string;
          display_serial: string;
          fair_score: number | null;
          card_classification: string | null;
          fair_level_at_creation: string | null;
          creator_display_name: string | null;
          source_image_strategy: string;
          card_payload: Json;
          created_at: string;
        };
        Insert: {
          user_id: string;
          analysis_id?: string | null;
          card_type: string;
          display_serial: string;
          fair_score?: number | null;
          card_classification?: string | null;
          fair_level_at_creation?: string | null;
          creator_display_name?: string | null;
          source_image_strategy?: string;
          card_payload?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["fair_cards"]["Insert"]>;
        Relationships: [];
      };
      visual_dna: {
        Row: {
          user_id: string;
          dominant_archetype: string;
          trait_badges: Json;
          subject_preferences: Json;
          composition_preferences: Json;
          light_preferences: Json;
          attention_drivers: Json;
          top_strengths: Json;
          growth_areas: Json;
          fair_score_trend: string | null;
          last_recalculated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          dominant_archetype?: string;
          trait_badges?: Json;
          subject_preferences?: Json;
          composition_preferences?: Json;
          light_preferences?: Json;
          attention_drivers?: Json;
          top_strengths?: Json;
          growth_areas?: Json;
          fair_score_trend?: string | null;
          last_recalculated_at?: string | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["visual_dna"]["Insert"]>;
        Relationships: [];
      };
      ethics_screenings: {
        Row: {
          id: string;
          user_id: string | null;
          safety_tier: string;
          reason_code: string;
          analysis_allowed: boolean;
          recognition_allowed: boolean;
          card_allowed: boolean;
          progress_allowed: boolean;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          safety_tier: string;
          reason_code: string;
          analysis_allowed?: boolean;
          recognition_allowed?: boolean;
          card_allowed?: boolean;
          progress_allowed?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["ethics_screenings"]["Insert"]>;
        Relationships: [];
      };
      milestones: {
        Row: {
          id: string;
          user_id: string;
          milestone_key: string;
          achieved_at: string;
          metadata: Json;
        };
        Insert: {
          user_id: string;
          milestone_key: string;
          achieved_at?: string;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["milestones"]["Insert"]>;
        Relationships: [];
      };
      analytics_events: {
        Row: {
          id: string;
          user_id: string | null;
          event_name: string;
          properties: Json;
          created_at: string;
        };
        Insert: {
          user_id?: string | null;
          event_name: string;
          properties?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_my_daily_analysis_usage: {
        Args: { p_display_limit?: number };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
