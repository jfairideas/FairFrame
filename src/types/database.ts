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
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      analysis_history: {
        Row: {
          id: string;
          user_id: string;
          analysis_mode: string;
          scene_type: string;
          story_context: Record<string, unknown> | null;
          result: Record<string, unknown>;
          source: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          analysis_mode: string;
          scene_type: string;
          story_context?: Record<string, unknown> | null;
          result: Record<string, unknown>;
          source?: string;
        };
        Update: Partial<Database["public"]["Tables"]["analysis_history"]["Insert"]>;
      };
    };
  };
}
